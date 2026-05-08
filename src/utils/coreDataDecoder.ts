import { classes } from "../lib/classes";
import type { ClassSelection } from "@/types";

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

export interface DecodedCoreData {
    totalLevel: number;
    classes: DecodedClass[];
    conMod: number;
    tough: boolean;
    hillDwarf: boolean;
    rolls: DecodedRollEntry[];
}

const CLASS_ORDER = [
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

const LETTER_TO_CLASS: Record<string, keyof typeof classes> =
    Object.fromEntries(
        CLASS_ORDER.map((key, i) => [String.fromCharCode(65 + i), key])
    );

function isDigit(char: string): boolean {
    return char >= "0" && char <= "9";
}

// MAIN DECODER
export function parseCoreData(coreData: string): DecodedCoreData {
    let i = 0;

    // 1. Total Level (2 digits)
    const totalLevel = parseInt(coreData.slice(i, i + 2), 10);
    i += 2;

    // 2. Classes
    const parsedClasses: DecodedClass[] = [];

    while (i < coreData.length) {
        const char = coreData[i];

        // stop at CON section
        if (char === "n") break;

        // ---- Custom Class ----
        if (char === "x") {
            const hitDie = Number(coreData[i + 1]) as 1 | 2 | 3 | 4;
            i += 2;

            let levelStr = "";
            while (i < coreData.length && isDigit(coreData[i])) {
                levelStr += coreData[i];
                i++;
            }

            parsedClasses.push({
                type: "custom",
                hitDie,
                levels: Number(levelStr),
            });

            continue;
        }

        // ---- Standard Class ----
        const classKey = LETTER_TO_CLASS[char];
        if (!classKey) {
            throw new Error(`Invalid class identifier: ${char}`);
        }

        i++;

        let levelStr = "";
        while (i < coreData.length && isDigit(coreData[i])) {
            levelStr += coreData[i];
            i++;
        }

        parsedClasses.push({
            type: "standard",
            key: classKey,
            levels: Number(levelStr),
        });
    }

    // 3. CON Modifier
    if (coreData[i] !== "n") {
        throw new Error("Missing CON modifier");
    }

    i++; // skip 'n'

    // 4. CON + Flags:
    // Format is n<signed-con><2 flag digits>[r...]
    // Since flags are always exactly 2 digits and optional rolls begin with `r`,
    // take flags from the tail of the non-roll segment.
    const rollsIndex = coreData.indexOf("r", i);
    const afterConStart = i;
    const nonRollEnd = rollsIndex === -1 ? coreData.length : rollsIndex;
    const flagsStart = nonRollEnd - 2;

    if (flagsStart < afterConStart) {
        throw new Error("Missing flags section");
    }

    const conStr = coreData.slice(afterConStart, flagsStart);
    const conMod = conStr ? Number(conStr) : 0;
    if (!Number.isFinite(conMod)) {
        throw new Error("Invalid CON modifier");
    }

    const tough = coreData[flagsStart] === "1";
    const hillDwarf = coreData[flagsStart + 1] === "1";
    i = nonRollEnd;

    // 5. Rolls
    const rolls: DecodedRollEntry[] = [];

    if (coreData[i] === "r") {
        i++; // skip 'r'

        while (i < coreData.length) {
            const classId = coreData[i];
            i++;

            const value = parseInt(coreData.slice(i, i + 2), 10);
            i += 2;

            rolls.push({
                classId,
                value,
            });
        }
    }

    return {
        totalLevel,
        classes: parsedClasses,
        conMod,
        tough,
        hillDwarf,
        rolls,
    };
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
                    className: "Custom",
                    level: decodedClass.levels,
                    customHitDie: CUSTOM_HIT_DIE_FROM_CODE[decodedClass.hitDie],
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