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
    hillDwarf: boolean;
    totalHP: number;
    breakdown: BreakdownItem[];
}

export interface BreakdownItem {
    label: string;
    value: string;
    tooltip: string;
}
