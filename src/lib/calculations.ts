import type { ClassSelection, CalculationResult, BreakdownItem } from "@/types";
import { classes } from "./classes";

export const calculateHP = (
    classSelections: ClassSelection[],
    conModifier: number,
    tough: boolean,
    hillDwarf: boolean,
    useAverage: boolean = true
): CalculationResult => {
    let totalHP = 0;
    const breakdown: BreakdownItem[] = [];

    // Sort classes by hit die descending
    const sortedSelections = [...classSelections].sort((a, b) => {
        const classA = classes[a.className.toLowerCase()]?.hitDie || 0;
        const classB = classes[b.className.toLowerCase()]?.hitDie || 0;
        return classB - classA;
    });

    let characterLevel = 0;

    sortedSelections.forEach((selection) => {
        const classData = classes[selection.className.toLowerCase()];
        if (!classData) return;

        const hitDie = classData.hitDie;
        const levels = selection.level;

        for (let i = 1; i <= levels; i++) {
            characterLevel++;
            let levelHP = 0;
            let rollValue = 0;
            const isFirstLevel = characterLevel === 1;

            if (isFirstLevel) {
                rollValue = hitDie;
            } else {
                if (useAverage) {
                    rollValue = Math.ceil((hitDie + 1) / 2);
                } else {
                    rollValue = Math.floor(Math.random() * hitDie) + 1;
                }
            }

            const toughBonus = tough ? 2 : 0;
            const hillDwarfBonus = hillDwarf ? 1 : 0;
            
            levelHP = rollValue + conModifier + toughBonus + hillDwarfBonus;
            totalHP += levelHP;

            // Construct calculation string
            const calcParts = [rollValue, conModifier];
            if (tough) calcParts.push(2);
            if (hillDwarf) calcParts.push(1);
            
            const calcString = calcParts.join("+");

            // Construct tooltip string
            const tooltipParts = [isFirstLevel ? "Max HP" : "HP", "CON"];
            if (tough) tooltipParts.push("Tough");
            if (hillDwarf) tooltipParts.push("Hill Dwarf");
            
            const tooltipString = tooltipParts.join("+");

            let valueStr = "";
            if (isFirstLevel) {
                valueStr = `(${calcString}) = ${levelHP}`;
            } else {
                valueStr = `${calcString} = ${levelHP}`;
            }

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
    };
};
