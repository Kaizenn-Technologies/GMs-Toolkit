import { classes } from "../lib/classes";
import { CUSTOM_CLASS_NAME } from "../lib/constants";
import type { ClassSelection } from "@/types";
import type { Ability } from "@/types";

export const SKILL_TO_CODE: Record<string, string> = {
    "Athletics": "A1",
    "Acrobatics": "B1",
    "Sleight of Hand": "B2",
    "Stealth": "B3",
    "Arcana": "D1",
    "History": "D2",
    "Investigation": "D3",
    "Nature": "D4",
    "Religion": "D5",
    "Animal Handling": "E1",
    "Insight": "E2",
    "Medicine": "E3",
    "Perception": "E4",
    "Survival": "E5",
    "Deception": "F1",
    "Intimidation": "F2",
    "Performance": "F3",
    "Persuasion": "F4",
};

export const CODE_TO_SKILL: Record<string, string> = Object.fromEntries(
    Object.entries(SKILL_TO_CODE).map(([name, code]) => [code, name])
);

// Class Mapping Definitions
export const CLASS_ORDER = [
    "barbarian",
    "bard",
    "cleric",
    "druid",
    "fighter",
    "monk",
    "paladin",
    "ranger",
    "rogue",
    "sorcerer",
    "warlock",
    "wizard",
] as const;

export const CLASS_LETTER_MAP: Record<string, string> = Object.fromEntries(
    CLASS_ORDER.map((key, i) => [key, String.fromCharCode(65 + i)])
);

export const CLASS_TO_LETTER: Record<string, string> = {
    barbarian: "A",
    bard: "B",
    cleric: "C",
    druid: "D",
    fighter: "E",
    monk: "F",
    paladin: "G",
    ranger: "H",
    rogue: "I",
    sorcerer: "J",
    warlock: "K",
    wizard: "L",
};

// Background Mapping Definitions
export const BG_TO_LETTER: Record<string, string> = {
    acolyte: "A",
    artisan: "B",
    charlatan: "C",
    criminal: "D",
    entertainer: "E",
    farmer: "F",
    guard: "G",
    guide: "H",
    hermit: "I",
    merchant: "J",
    noble: "K",
    sage: "L",
    sailor: "M",
    scribe: "N",
    soldier: "O",
    wayfarer: "P",
};

// Ability Score Definitions
export const ABILITY_LETTERS: Record<Ability, string> = {
    Strength: "A",
    Dexterity: "B",
    Constitution: "C",
    Intelligence: "D",
    Wisdom: "E",
    Charisma: "F",
};

export const ABILITY_ORDER: Ability[] = [
    "Strength",
    "Dexterity",
    "Constitution",
    "Intelligence",
    "Wisdom",
    "Charisma",
];

// Helper: pad to 2 digits
function pad2(n: number): string {
    return Math.max(0, Math.floor(n)).toString().padStart(2, "0");
}

// Helper: get local UTC offset like +0530 or -0700
export function getLocalUtcOffset(): string {
    const offsetMinutes = new Date().getTimezoneOffset();
    const sign = offsetMinutes <= 0 ? "+" : "-";
    const absMinutes = Math.abs(offsetMinutes);
    const hours = Math.floor(absMinutes / 60);
    const minutes = absMinutes % 60;
    return `${sign}${hours.toString().padStart(2, "0")}${minutes.toString().padStart(2, "0")}`;
}

// ==========================================
// HP Calculator Encoder Types & Functions
// ==========================================

export interface CustomClass {
    type: "custom";
    hitDie: 1 | 2 | 3 | 4; // 1=d6, 2=d8, 3=d10, 4=d12
    levels: number;
}

export interface StandardClass {
    type: "standard";
    key: keyof typeof classes;
    levels: number;
}

export type ClassInput = CustomClass | StandardClass;

export interface RollEntry {
    classId: string; // 'x' or 'A'...'L'
    value: number;   // 1–12
}

export interface CoreMetadataInput {
    version: string;
    unixTime: number;
    rerolls: number;
    name?: string;
}

export interface CoreDataInput {
    classes: ClassInput[];
    conMod: number;
    tough: boolean;
    hillDwarf: boolean;
    rolls?: RollEntry[];
    metadata?: CoreMetadataInput;
}

const CUSTOM_HIT_DIE_TO_CODE: Record<number, 1 | 2 | 3 | 4> = {
    6: 1,
    8: 2,
    10: 3,
    12: 4,
};

export function classSelectionsToClassInput(classSelections: ClassSelection[]): ClassInput[] {
    return classSelections.map((selection) => {
        if (selection.className === CUSTOM_CLASS_NAME) {
            const customHitDie = selection.customHitDie ?? 6;
            return {
                type: "custom",
                hitDie: CUSTOM_HIT_DIE_TO_CODE[customHitDie] || 1,
                levels: selection.level,
            };
        }

        return {
            type: "standard",
            key: selection.className.toLowerCase() as keyof typeof classes,
            levels: selection.level,
        };
    });
}

function toSortedSelections(classSelections: ClassSelection[]): ClassSelection[] {
    return [...classSelections].sort((a, b) => {
        const hitDieA =
            a.className === CUSTOM_CLASS_NAME
                ? (a.customHitDie ?? 0)
                : (classes[a.className.toLowerCase() as keyof typeof classes]?.hitDie ?? 0);
        const hitDieB =
            b.className === CUSTOM_CLASS_NAME
                ? (b.customHitDie ?? 0)
                : (classes[b.className.toLowerCase() as keyof typeof classes]?.hitDie ?? 0);
        return hitDieB - hitDieA;
    });
}

export function buildRollEntries(
    classSelections: ClassSelection[],
    rolledValues: number[],
): RollEntry[] {
    const sortedSelections = toSortedSelections(classSelections);
    const classIds: string[] = [];
    let characterLevel = 0;

    sortedSelections.forEach((selection) => {
        const classId =
            selection.className === CUSTOM_CLASS_NAME
                ? "x"
                : CLASS_LETTER_MAP[selection.className.toLowerCase() as keyof typeof classes];

        for (let i = 1; i <= selection.level; i++) {
            characterLevel++;
            if (characterLevel !== 1) {
                classIds.push(classId);
            }
        }
    });

    return rolledValues.map((value, index) => ({
        classId: classIds[index] ?? "x",
        value,
    }));
}

function encodeClass(cls: ClassInput): string {
    if (cls.type === "custom") {
        return `x${cls.hitDie}${cls.levels}`;
    }

    const letter = CLASS_LETTER_MAP[cls.key];
    return `${letter}${cls.levels}`;
}

export function buildCoreData(input: CoreDataInput): string {
    // 1. Coredata (c:)
    const encodedClasses = input.classes.map(encodeClass).join("");
    const sign = input.conMod >= 0 ? "+" : "";
    const coredata = `tHPcl${encodedClasses}con${sign}${input.conMod}tf${input.tough ? 1 : 0}hd${input.hillDwarf ? 1 : 0}`;

    // 2. Rolled (r:)
    let rolled = "";
    if (input.rolls && input.rolls.length > 0) {
        rolled = "h" + input.rolls
            .map((r) => `${r.classId.toLowerCase()}${pad2(r.value)}`)
            .join("");
    }

    // 3. Metadata (m:)
    let metadata = "";
    if (input.metadata) {
        const name = input.metadata.name ? encodeURIComponent(input.metadata.name) : "";
        const offset = getLocalUtcOffset();
        metadata = `n${name}t${input.metadata.unixTime}u${offset}rc${input.metadata.rerolls}`;
    }

    return `v1;c:${coredata};r:${rolled};m:${metadata}`;
}

// ==========================================
// Stats Generator Encoder Types & Functions
// ==========================================

export interface PointBuyData {
    method: "point_buy";
    className: string;
    backgroundName: string;
    asiEnabled: boolean;
    abilityScores: Record<Ability, number>;
    backgroundBonus: Record<Ability, number>;
    featBonus: Record<Ability, number>;
}

export interface RolledRoll {
    roll: string; // 4 digits e.g. "5521"
    assignment: Ability | "unassigned";
}

export interface RolledData {
    method: "rolled";
    rolls: RolledRoll[];
}

export interface SkillsData {
    isBard: boolean;
    conMod: number;
    savingThrows: Ability[];
    proficiencies: string[];
    expertises: string[];
}

export interface EncodedCharacter {
    stats: PointBuyData | RolledData;
    skills?: SkillsData;
    metadata?: {
        name?: string;
        rollCount?: number;
    };
}

export function encodeCharacter(character: EncodedCharacter): string {
    let coredata = "";
    let rolled = "";

    if (character.stats.method === "point_buy") {
        const pb = character.stats;

        // Class
        const classLetter = CLASS_TO_LETTER[pb.className.toLowerCase()] ?? "z";

        // Background
        const bgLetter = BG_TO_LETTER[pb.backgroundName.toLowerCase()] ?? "z";

        // ASI flag
        const asiFlag = pb.asiEnabled ? "1" : "0";

        // Feat Toggle
        const hasFeatBonus = ABILITY_ORDER.some((ab) => pb.featBonus[ab] > 0);
        const fbFlag = hasFeatBonus ? "1" : "0";

        // Ability scores (STR→CHA)
        let abStr = "";
        for (const ab of ABILITY_ORDER) {
            abStr += pad2(pb.abilityScores[ab] ?? 0);
        }

        // Background bonuses (STR→CHA, padded to 12 digits)
        let bbStr = "";
        for (const ab of ABILITY_ORDER) {
            bbStr += pad2(pb.backgroundBonus[ab] ?? 0);
        }

        // Feat bonus values (STR→CHA, always present)
        let fbvStr = "";
        for (const ab of ABILITY_ORDER) {
            fbvStr += pad2(pb.featBonus[ab] ?? 0);
        }

        coredata = `tPBcl${classLetter}bg${bgLetter}asi${asiFlag}fb${fbFlag}ab${abStr}bb${bbStr}fbv${fbvStr}`;

    } else if (character.stats.method === "rolled") {
        const rolledData = character.stats;
        let rolledStr = "";
        for (const roll of rolledData.rolls) {
            const assignmentChar = roll.assignment !== "unassigned" ? ABILITY_LETTERS[roll.assignment] : "x";
            rolledStr += `${roll.roll}${assignmentChar}`;
        }
        rolled = rolledStr;
    }

    if (character.skills) {
        const sk = character.skills;
        const hasSaves = sk.savingThrows && sk.savingThrows.length > 0;
        const hasProfs = sk.proficiencies && sk.proficiencies.length > 0;
        const hasExps = sk.expertises && sk.expertises.length > 0;
        const isBardVal = sk.isBard ? 1 : 0;
        const conModVal = sk.conMod;

        // Check if ANY of the conditions to include the skills segment are met
        if (isBardVal === 1 || conModVal !== 0 || hasSaves || hasProfs || hasExps) {
            let skillsStr = `${isBardVal}${conModVal}`;

            if (hasSaves) {
                const sortedSaves = [...sk.savingThrows]
                    .map((ab) => ABILITY_LETTERS[ab])
                    .filter(Boolean)
                    .sort()
                    .join("");
                skillsStr += `s${sortedSaves}`;
            }

            if (hasProfs) {
                const sortedProfs = sk.proficiencies
                    .map((name) => SKILL_TO_CODE[name])
                    .filter(Boolean)
                    .sort()
                    .join("");
                skillsStr += `p${sortedProfs}`;
            }

            if (hasExps) {
                const sortedExps = sk.expertises
                    .map((name) => SKILL_TO_CODE[name])
                    .filter(Boolean)
                    .sort()
                    .join("");
                skillsStr += `e${sortedExps}`;
            }

            coredata += skillsStr;
        }
    }

    // Metadata (m:)
    const name = character.metadata?.name ? encodeURIComponent(character.metadata.name) : "";
    const unix = Math.floor(Date.now() / 1000);
    const offset = getLocalUtcOffset();
    const count = character.metadata?.rollCount ?? 0;
    const metadata = `n${name}t${unix}u${offset}rc${count}`;

    return `v1;c:${coredata};r:${rolled};m:${metadata}`;
}
