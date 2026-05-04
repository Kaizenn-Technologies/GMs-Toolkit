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

    classSelections.forEach((selection) => {
        const classData = classes[selection.className.toLowerCase()];
        if (!classData) return;

        const hitDie = classData.hitDie;
        const levels = selection.level;
        const key = `${selection.className}_${selection.level}`;

        for (let i = 1; i <= levels; i++) {
            let levelHP = 0;

            if (i === 1) {
                // Level 1: max hit die + CON modifier
                levelHP = hitDie + conModifier;
                breakdownLines.push(`${selection.className} Level ${i}: (${hitDie}+${conModifier})`);
            } else {
                if (useAverage) {
                    // Average: (max + 1) / 2, rounded up
                    const avgRoll = Math.ceil((hitDie + 1) / 2);
                    levelHP = avgRoll + conModifier;
                    breakdownLines.push(`${selection.className} Level ${i}: ${avgRoll}+${conModifier}=${levelHP}`);
                } else {
                    // Use pre-generated rolls
                    if (rolls && rolls[key]) {
                        const roll = rolls[key][i - 1];
                        levelHP = roll + conModifier;
                        breakdownLines.push(`${selection.className} Level ${i}: ${roll}+${conModifier}=${levelHP}`);
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
