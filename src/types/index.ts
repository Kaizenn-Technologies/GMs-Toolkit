export interface ClassData {
    name: string;
    hitDie: number;
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
    highElf: boolean;
    totalHP: number;
    breakdown: string;
}
