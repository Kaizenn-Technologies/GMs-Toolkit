export type Ability =
    | "Strength"
    | "Dexterity"
    | "Constitution"
    | "Intelligence"
    | "Wisdom"
    | "Charisma";

export type Skills =
    | "Acrobatics"
    | "Animal Handling"
    | "Arcana"
    | "Athletics"
    | "Deception"
    | "History"
    | "Insight"
    | "Intimidation"
    | "Investigation"
    | "Medicine"
    | "Nature"
    | "Perception"
    | "Performance"
    | "Persuasion"
    | "Religion"
    | "Sleight of Hand"
    | "Stealth"
    | "Survival";

export type FeatsTypes =
    | "Origin"
    | "General"
    | "Fighting Style"
    | "ASI"
    | "Epic Boons";

export type Feat = {
    name: string;
    type: FeatsTypes;
    abilityScoreModifiers?: Ability[];
    prerequisites?: string[]
    descriptionHeadings?: string[];
    description: string[];
};

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

export interface BackgroundData {
    name: string;
    abilityScores: Ability[];
    skillProficiencies: Skills[];
    feat: Feat;
    toolProficiencies?: string;
    equipment?: string[];
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
