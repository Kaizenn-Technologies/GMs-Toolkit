import type { ClassSelection, CalculationResult } from "@/types";
import { classes } from "./classes";

export interface Rolls {
    [key: string]: number[]; // Format: "ClassName_levelIndex" -> [rolls...]
}

export const generateRolls = (
    classSelections: ClassSelection[]
): Rolls => {
    const rolls: Rolls = {};

    classSelections.forEach((selection) => {
        const classData = classes[selection.className.toLowerCase()];
        if (!classData) return;

        const hitDie = classData.hitDie;
        const key = `${selection.className}_${selection.level}`;
        const levelRolls: number[] = [];

        for (let i = 1; i <= selection.level; i++) {
            if (i === 1) {
                // Level 1: always max
                levelRolls.push(hitDie);
            } else {
                // Subsequent levels: roll 1 to max
                levelRolls.push(Math.floor(Math.random() * hitDie) + 1);
            }
        }

        rolls[key] = levelRolls;
    });

    return rolls;
};


export const calculateHP = (
    classSelections: ClassSelection[],
    conModifier: number,
    tough: boolean,
    highElf: boolean,
    useAverage: boolean = true
): CalculationResult => {
    let totalHP = 0;
    const breakdownLines: string[] = [];
    const rolls = useAverage ? null : generateRolls(classSelections);

    // Find the class with the highest hit die for 1st level
    let firstLevelClass: ClassSelection | null = null;
    let maxHitDie = 0;
    classSelections.forEach((selection) => {
        const classData = classes[selection.className.toLowerCase()];
        if (classData && classData.hitDie > maxHitDie) {
            maxHitDie = classData.hitDie;
            firstLevelClass = selection;
        }
    });

    // Track how many levels have been processed for each class
    const classLevelTracker: Record<string, number> = {};
    let firstLevelGranted = false;

    classSelections.forEach((selection) => {
        const classData = classes[selection.className.toLowerCase()];
        if (!classData) return;

        const hitDie = classData.hitDie;
        const levels = selection.level;
        const key = `${selection.className}_${selection.level}`;

        for (let i = 1; i <= levels; i++) {
            let levelHP = 0;
            const classKey = selection.className;
            classLevelTracker[classKey] = (classLevelTracker[classKey] || 0) + 1;
            const currentLevel = classLevelTracker[classKey];

            // Grant max HP at 1st level to the class with the highest hit die
            if (!firstLevelGranted && firstLevelClass && selection.className === firstLevelClass.className && currentLevel === 1) {
                levelHP = hitDie + conModifier;
                breakdownLines.push(`${selection.className} Level ${currentLevel}: (${hitDie}+${conModifier}) [Max HP at 1st level]`);
                firstLevelGranted = true;
            } else {
                if (useAverage) {
                    // Average: (max + 1) / 2, rounded up
                    const avgRoll = Math.ceil((hitDie + 1) / 2);
                    levelHP = avgRoll + conModifier;
                    breakdownLines.push(`${selection.className} Level ${currentLevel}: ${avgRoll}+${conModifier}=${levelHP}`);
                } else {
                    // Use pre-generated rolls
                    if (rolls && rolls[key]) {
                        const roll = rolls[key][currentLevel - 1];
                        levelHP = roll + conModifier;
                        breakdownLines.push(`${selection.className} Level ${currentLevel}: ${roll}+${conModifier}=${levelHP}`);
                    }
                }
            }

            totalHP += levelHP;
        }
    });

    // Apply Tough feat (+2 HP per level)
    if (tough) {
        const toughBonus =
            classSelections.reduce((acc, sel) => acc + sel.level, 0) * 2;
        totalHP += toughBonus;
        breakdownLines.push(`Tough feat: +${toughBonus}`);
    }

    // High Elf bonus: +1 max HP per character level gained
    if (highElf) {
        const characterLevel = classSelections.reduce(
            (acc, sel) => acc + sel.level,
            0
        );
        totalHP += characterLevel;
        breakdownLines.push(`High Elf: +${characterLevel}`);
    }

    const breakdown = breakdownLines.join("\n");

    return {
        classSelections,
        conModifier,
        tough,
        highElf,
        totalHP,
        breakdown,
    };
};
