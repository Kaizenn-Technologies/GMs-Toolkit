import type { ClassSelection, CalculationResult, BreakdownItem, ClassData } from "@/types";
import { classes } from "./classes";

const classesMap = classes as Record<string, ClassData>;
const CUSTOM_CLASS_NAME = "Custom";

export const calculateHP = (
    classSelections: ClassSelection[],
    conModifier: number,
    tough: boolean,
    hillDwarf: boolean,
    useAverage: boolean = true,
    providedRolls?: number[]
): CalculationResult => {
    let totalHP = 0;
    const breakdown: BreakdownItem[] = [];

    // Sort classes by hit die descending
    const sortedSelections = [...classSelections].sort((a, b) => {
        const classA =
            a.className === CUSTOM_CLASS_NAME
                ? (a.customHitDie ?? 0)
                : (classesMap[a.className.toLowerCase()]?.hitDie || 0);
        const classB =
            b.className === CUSTOM_CLASS_NAME
                ? (b.customHitDie ?? 0)
                : (classesMap[b.className.toLowerCase()]?.hitDie || 0);
        return classB - classA;
    });

    let characterLevel = 0;
    let rollIndex = 0;
    const usedRolls: number[] = [];

    sortedSelections.forEach((selection) => {
        const classData = classesMap[selection.className.toLowerCase()];
        const hitDie =
            selection.className === CUSTOM_CLASS_NAME
                ? selection.customHitDie
                : classData?.hitDie;
        if (!hitDie) return;
        const levels = selection.level;

        for (let i = 1; i <= levels; i++) {
            characterLevel++;
            let rollValue = 0;
            const isFirstLevel = characterLevel === 1;

            if (isFirstLevel) {
                rollValue = hitDie;
            } else {
                if (useAverage) {
                    rollValue = Math.ceil((hitDie + 1) / 2);
                } else {
                    const provided = providedRolls?.[rollIndex];
                    if (typeof provided === "number" && Number.isFinite(provided)) {
                        rollValue = Math.max(1, Math.min(hitDie, Math.floor(provided)));
                    } else {
                        rollValue = Math.floor(Math.random() * hitDie) + 1;
                    }
                    usedRolls.push(rollValue);
                    rollIndex++;
                }
            }

            const toughBonus = tough ? 2 : 0;
            const hillDwarfBonus = hillDwarf ? 1 : 0;
            const levelHP = rollValue + conModifier + toughBonus + hillDwarfBonus;
            totalHP += levelHP;

            // Keep negative CON at the end so we render e.g. 2+1-3 instead of 2+-3+1.
            const positiveBonuses: number[] = [];
            const positiveBonusLabels: string[] = [];

            if (tough) {
                positiveBonuses.push(2);
                positiveBonusLabels.push("Tough");
            }
            if (hillDwarf) {
                positiveBonuses.push(1);
                positiveBonusLabels.push("Hill Dwarf");
            }

            const conAbs = Math.abs(conModifier);
            const startsWithNegativeCon = conModifier < 0 && positiveBonuses.length === 0;
            const basePart = startsWithNegativeCon ? `${rollValue}-${conAbs}` : `${rollValue}`;
            const positivePart = positiveBonuses.length ? `+${positiveBonuses.join("+")}` : "";
            const conPart = conModifier < 0
                ? (startsWithNegativeCon ? "" : `-${conAbs}`)
                : `+${conModifier}`;
            const calcString = `${basePart}${positivePart}${conPart}`;

            const tooltipBase = isFirstLevel ? "Max HP" : "HP";
            const tooltipPositivePart = positiveBonusLabels.length
                ? `+${positiveBonusLabels.join("+")}`
                : "";
            const tooltipConPart = conModifier < 0 ? "-CON" : "+CON";
            const tooltipString = `${tooltipBase}${tooltipPositivePart}${tooltipConPart}`;

            const valueStr = isFirstLevel
                ? `(${calcString}) = ${levelHP}`
                : `${calcString} = ${levelHP}`;

            breakdown.push({
                label: `${selection.className} Level ${characterLevel}`,
                value: valueStr,
                tooltip: tooltipString
            });
        }
    });

    return {
        classSelections,
        conModifier,
        tough,
        hillDwarf,
        totalHP,
        breakdown,
        rolls: useAverage ? undefined : usedRolls,
    };
};
