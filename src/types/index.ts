export type Ability =
    | "Strength"
    | "Dexterity"
    | "Constitution"
    | "Intelligence"
    | "Wisdom"
    | "Charisma";

export type PrimaryStat =
    | { type: "single"; value: Ability }
    | { type: "multiple"; values: Ability[] }
    | { type: "choice"; options: Ability[] };

export interface ClassData {
    name: string;
    hitDie: number;
    primaryStat: PrimaryStat;
    savingThrows: Ability[];
}

export interface ClassSelection {
    id: string;
    className: string;
    level: number;
}

export interface CalculationResult {
    classSelections: ClassSelection[];
    conModifier: number;
    tough: boolean;
    hillDwarf: boolean;
    totalHP: number;
    breakdown: BreakdownItem[];
}

export interface BreakdownItem {
    label: string;
    value: string;
    tooltip: string;
}
