import { classes } from "../lib/classes";
import { CUSTOM_CLASS_NAME } from "../lib/constants";
import type { ClassSelection } from "@/types";
import type { Ability } from "@/types";
import { CLASS_ORDER } from "./encoding";

// Reverse Class Letters Map
export const LETTER_TO_CLASS: Record<string, string> = Object.fromEntries(
    CLASS_ORDER.map((key, i) => [String.fromCharCode(65 + i), key])
);

// Reverse Background Letters Map
export const LETTER_TO_BG: Record<string, string> = {
    A: "Acolyte",
    B: "Artisan",
    C: "Charlatan",
    D: "Criminal",
    E: "Entertainer",
    F: "Farmer",
    G: "Guard",
    H: "Guide",
    I: "Hermit",
    J: "Merchant",
    K: "Noble",
    L: "Sage",
    M: "Sailor",
    N: "Scribe",
    O: "Soldier",
    P: "Wayfarer",
};

// Reverse Ability Letters Map
export const LETTERS_TO_ABILITY: Record<string, Ability> = {
    A: "Strength",
    B: "Dexterity",
    C: "Constitution",
    D: "Intelligence",
    E: "Wisdom",
    F: "Charisma",
};

export const ABILITY_ORDER: Ability[] = [
    "Strength",
    "Dexterity",
    "Constitution",
    "Intelligence",
    "Wisdom",
    "Charisma",
];

// Helper: check if a character is a digit
function isDigit(char: string): boolean {
    return char >= "0" && char <= "9";
}

// Global segment parser
export function parseSegments(urlStr: string) {
    const segments = urlStr.split(";");
    let coredata = "";
    let rolled = "";
    let metadata = "";
    for (const seg of segments) {
        if (seg.startsWith("c:")) {
            coredata = seg.slice(2);
        } else if (seg.startsWith("r:")) {
            rolled = seg.slice(2);
        } else if (seg.startsWith("m:")) {
            metadata = seg.slice(2);
        }
    }
    return { coredata, rolled, metadata };
}

// ==========================================
// HP Calculator Decoder Types & Functions
// ==========================================

export interface DecodedCustomClass {
    type: "custom";
    hitDie: 1 | 2 | 3 | 4; // 1=d6, 2=d8, 3=d10, 4=d12
    levels: number;
}

export interface DecodedStandardClass {
    type: "standard";
    key: keyof typeof classes;
    levels: number;
}

export type DecodedClass = DecodedCustomClass | DecodedStandardClass;

export interface DecodedRollEntry {
    classId: string; // 'x' or 'A'...'L'
    value: number;
}

export interface DecodedCoreMetadata {
    version: string;
    unixTime: number;
    rerolls: number;
    name: string;
    offset?: string;
}

export interface DecodedCoreData {
    totalLevel: number;
    classes: DecodedClass[];
    conMod: number;
    tough: boolean;
    hillDwarf: boolean;
    rolls: DecodedRollEntry[];
    metadata: DecodedCoreMetadata | null;
}

const CUSTOM_HIT_DIE_FROM_CODE: Record<1 | 2 | 3 | 4, 6 | 8 | 10 | 12> = {
    1: 6,
    2: 8,
    3: 10,
    4: 12,
};

export function decodedClassesToSelections(decodedClasses: DecodedClass[]): ClassSelection[] {
    return decodedClasses
        .map((decodedClass, index) => {
            if (decodedClass.type === "custom") {
                return {
                    id: String(index + 1),
                    className: CUSTOM_CLASS_NAME,
                    level: decodedClass.levels,
                    customHitDie: CUSTOM_HIT_DIE_FROM_CODE[decodedClass.hitDie] || 6,
                };
            }

            return {
                id: String(index + 1),
                className: classes[decodedClass.key].name,
                level: decodedClass.levels,
            };
        })
        .filter((selection) => selection.level > 0);
}

export function parseCoreData(shareString: string): DecodedCoreData {
    const { coredata, rolled, metadata } = parseSegments(shareString);

    if (!coredata.startsWith("tHP")) {
        throw new Error("Invalid HP coredata");
    }

    let idx = 3; // skip tHP
    if (!coredata.substring(idx).startsWith("cl")) {
        throw new Error("Expected tag cl in HP coredata");
    }
    idx += 2; // skip cl

    const conIdx = coredata.indexOf("con", idx);
    if (conIdx === -1) {
        throw new Error("Expected tag con in HP coredata");
    }

    const encodedClasses = coredata.substring(idx, conIdx);
    idx = conIdx;

    idx += 3; // skip con
    const tfIdx = coredata.indexOf("tf", idx);
    if (tfIdx === -1) {
        throw new Error("Expected tag tf in HP coredata");
    }
    const conModStr = coredata.substring(idx, tfIdx);
    const conMod = parseInt(conModStr, 10) || 0;
    idx = tfIdx;

    idx += 2; // skip tf
    const tough = coredata[idx] === "1";
    idx += 1;

    if (!coredata.substring(idx).startsWith("hd")) {
        throw new Error("Expected tag hd in HP coredata");
    }
    idx += 2; // skip hd
    const hillDwarf = coredata[idx] === "1";

    // Parse classes List
    const classesList: DecodedClass[] = [];
    let cIdx = 0;
    while (cIdx < encodedClasses.length) {
        const char = encodedClasses[cIdx];
        if (char === "x") {
            const hitDie = parseInt(encodedClasses[cIdx + 1], 10) as 1 | 2 | 3 | 4;
            cIdx += 2;
            let levelStr = "";
            while (cIdx < encodedClasses.length && isDigit(encodedClasses[cIdx])) {
                levelStr += encodedClasses[cIdx];
                cIdx++;
            }
            classesList.push({
                type: "custom",
                hitDie,
                levels: parseInt(levelStr, 10) || 0,
            });
        } else {
            const key = LETTER_TO_CLASS[char];
            if (!key) {
                throw new Error(`Invalid class letter: ${char}`);
            }
            cIdx++;
            let levelStr = "";
            while (cIdx < encodedClasses.length && isDigit(encodedClasses[cIdx])) {
                levelStr += encodedClasses[cIdx];
                cIdx++;
            }
            classesList.push({
                type: "standard",
                key: key as keyof typeof classes,
                levels: parseInt(levelStr, 10) || 0,
            });
        }
    }

    const totalLevel = classesList.reduce((sum, c) => sum + c.levels, 0);

    // Parse rolls
    const rollsList: DecodedRollEntry[] = [];
    if (rolled.startsWith("h")) {
        let rIdx = 1; // skip h
        while (rIdx < rolled.length) {
            const classId = rolled[rIdx];
            rIdx++;
            const valueStr = rolled.substring(rIdx, rIdx + 2);
            rIdx += 2;
            rollsList.push({
                classId,
                value: parseInt(valueStr, 10) || 0,
            });
        }
    }

    // Parse metadata
    let decodedMetadata: DecodedCoreMetadata | null = null;
    if (metadata) {
        const match = metadata.match(/^n([\s\S]*?)t(\d+)u([+-]\d{4})rc(\d+)/);
        if (match) {
            const name = (() => {
                try {
                    return decodeURIComponent(match[1]);
                } catch {
                    return match[1];
                }
            })();
            decodedMetadata = {
                version: "v1",
                unixTime: parseInt(match[2], 10) || 0,
                offset: match[3],
                rerolls: parseInt(match[4], 10) || 0,
                name,
            };
        }
    }

    return {
        totalLevel,
        classes: classesList,
        conMod,
        tough,
        hillDwarf,
        rolls: rollsList,
        metadata: decodedMetadata,
    };
}

// ==========================================
// Stats Generator Decoder Types & Functions
// ==========================================

export interface DecodedPointBuyData {
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

export interface DecodedRolledData {
    method: "rolled";
    rolls: RolledRoll[];
}

export interface DecodedCharacter {
    stats: DecodedPointBuyData | DecodedRolledData;
    skills?: unknown;
    metadata?: {
        name?: string;
        unixTime?: number;
        offset?: string;
        rollCount?: number;
    };
}

export function decodeCharacter(shareString: string): DecodedCharacter {
    const { coredata, rolled, metadata } = parseSegments(shareString);

    let stats: DecodedPointBuyData | DecodedRolledData;

    if (coredata.startsWith("tPB")) {
        let idx = 3;

        const consumeTag = (tag: string, length: number): string => {
            if (!coredata.substring(idx).startsWith(tag)) {
                throw new Error(`Expected tag ${tag} in stats coredata`);
            }
            idx += tag.length;
            const val = coredata.substring(idx, idx + length);
            if (val.length !== length) {
                throw new Error(`Expected ${length} characters for tag ${tag}`);
            }
            idx += length;
            return val;
        };

        const cl = consumeTag("cl", 1);
        const bg = consumeTag("bg", 1);
        const asi = consumeTag("asi", 1);
        consumeTag("fb", 1);
        const ab = consumeTag("ab", 12);
        const bb = consumeTag("bb", 12);
        const fbv = consumeTag("fbv", 12);

        const className = cl === "z" ? "Choose a class" : LETTER_TO_CLASS[cl.toUpperCase()] || "Choose a class";
        const backgroundName = bg === "z" ? "Sage" : LETTER_TO_BG[bg.toUpperCase()] || "Sage";
        const asiEnabled = asi === "1";

        const abilityScores = {} as Record<Ability, number>;
        ABILITY_ORDER.forEach((abName, i) => {
            const valStr = ab.substring(i * 2, i * 2 + 2);
            abilityScores[abName] = parseInt(valStr, 10) || 0;
        });

        const backgroundBonus = {} as Record<Ability, number>;
        ABILITY_ORDER.forEach((abName, i) => {
            const valStr = bb.substring(i * 2, i * 2 + 2);
            backgroundBonus[abName] = parseInt(valStr, 10) || 0;
        });

        const featBonus = {} as Record<Ability, number>;
        ABILITY_ORDER.forEach((abName, i) => {
            const valStr = fbv.substring(i * 2, i * 2 + 2);
            featBonus[abName] = parseInt(valStr, 10) || 0;
        });

        stats = {
            method: "point_buy",
            className,
            backgroundName,
            asiEnabled,
            abilityScores,
            backgroundBonus,
            featBonus,
        };
    } else {
        const rollsList: RolledRoll[] = [];
        let rIdx = 0;
        while (rIdx < rolled.length) {
            const rollDigits = rolled.substring(rIdx, rIdx + 4);
            rIdx += 4;
            const assignChar = rolled[rIdx];
            rIdx += 1;

            const assignment = assignChar === "x" ? "unassigned" : LETTERS_TO_ABILITY[assignChar.toUpperCase()] || "unassigned";
            rollsList.push({
                roll: rollDigits,
                assignment,
            });
        }

        stats = {
            method: "rolled",
            rolls: rollsList,
        };
    }

    let decodedMetadata: DecodedCharacter["metadata"] = undefined;
    if (metadata) {
        const match = metadata.match(/^n([\s\S]*?)t(\d+)u([+-]\d{4})rc(\d+)/);
        if (match) {
            const name = (() => {
                try {
                    return decodeURIComponent(match[1]);
                } catch {
                    return match[1];
                }
            })();
            decodedMetadata = {
                name,
                unixTime: parseInt(match[2], 10) || 0,
                offset: match[3],
                rollCount: parseInt(match[4], 10) || 0,
            };
        }
    }

    return {
        stats,
        metadata: decodedMetadata,
    };
}

export function matchRolledBoxesToAssignments(
    rolledBoxes: Record<Ability, { rolls: number[]; total: number }>,
    standardScores: Record<Ability, number | null>
): RolledRoll[] {
    const abilities = ABILITY_ORDER;
    const rolls: RolledRoll[] = [];
    const matchedAssigned = new Set<Ability>();

    for (const ab of abilities) {
        const box = rolledBoxes[ab];
        const digits = box.rolls.join("");

        let assignment: Ability | "unassigned" = "unassigned";
        for (const targetAb of abilities) {
            if (standardScores[targetAb] === box.total && !matchedAssigned.has(targetAb)) {
                assignment = targetAb;
                matchedAssigned.add(targetAb);
                break;
            }
        }

        rolls.push({
            roll: digits,
            assignment
        });
    }

    return rolls;
}
