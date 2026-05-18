import type { Ability, Skills } from "@/types";

// 1. Ability Score mappings
export const ABILITY_LETTERS: Record<Ability, string> = {
    Strength: "A",
    Dexterity: "B",
    Constitution: "C",
    Intelligence: "D",
    Wisdom: "E",
    Charisma: "F",
};

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

// 2. Class mappings
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

export const LETTER_TO_CLASS: Record<string, string> = {
    A: "Barbarian",
    B: "Bard",
    C: "Cleric",
    D: "Druid",
    E: "Fighter",
    F: "Monk",
    G: "Paladin",
    H: "Ranger",
    I: "Rogue",
    J: "Sorcerer",
    K: "Warlock",
    L: "Wizard",
};

// 3. Background mappings
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

// 4. Skills mappings by ability and 1-indexed alphabetical order
export const SKILL_TO_CODE: Record<Skills, { ability: string; index: number }> = {
    Athletics: { ability: "A", index: 1 },
    Acrobatics: { ability: "B", index: 1 },
    "Sleight of Hand": { ability: "B", index: 2 },
    Stealth: { ability: "B", index: 3 },
    Arcana: { ability: "D", index: 1 },
    History: { ability: "D", index: 2 },
    Investigation: { ability: "D", index: 3 },
    Nature: { ability: "D", index: 4 },
    Religion: { ability: "D", index: 5 },
    "Animal Handling": { ability: "E", index: 1 },
    Insight: { ability: "E", index: 2 },
    Medicine: { ability: "E", index: 3 },
    Perception: { ability: "E", index: 4 },
    Survival: { ability: "E", index: 5 },
    Deception: { ability: "F", index: 1 },
    Intimidation: { ability: "F", index: 2 },
    Performance: { ability: "F", index: 3 },
    Persuasion: { ability: "F", index: 4 },
};

export const CODE_TO_SKILL: Record<string, Skills> = {
    A1: "Athletics",
    B1: "Acrobatics",
    B2: "Sleight of Hand",
    B3: "Stealth",
    D1: "Arcana",
    D2: "History",
    D3: "Investigation",
    D4: "Nature",
    D5: "Religion",
    E1: "Animal Handling",
    E2: "Insight",
    E3: "Medicine",
    E4: "Perception",
    E5: "Survival",
    F1: "Deception",
    F2: "Intimidation",
    F3: "Performance",
    F4: "Persuasion",
};

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
    proficiencies: Skills[];
    expertises: Skills[];
}

export interface EncodedCharacter {
    stats: PointBuyData | RolledData;
    skills?: SkillsData;
}

// Padding helper
function pad2(n: number): string {
    return n.toString().padStart(2, "0");
}

// Strict validator for background bonus
function validateBgBonus(bonus: Record<Ability, number>, asiEnabled: boolean): void {
    const values = ABILITY_ORDER.map((ab) => bonus[ab]);
    const total = values.reduce((sum, v) => sum + v, 0);

    if (!asiEnabled) {
        // According to Section 2.6: If ASI disabled, it must be 000000.
        // However, the spec's own example has a non-zero background bonus (200001) with ASI flag 0.
        // To be compatible with both the spec's example and strictness:
        // We allow it to be 000000 OR a valid pattern (total 3).
        if (total === 0) {
            return;
        }
    }

    // check if any value is out of range
    if (values.some((v) => v < 0 || v > 2)) {
        throw new Error("Background bonus values must be between 0 and 2");
    }

    if (total !== 3) {
        throw new Error(`Background bonus must total exactly 3, got ${total}`);
    }

    // allowed patterns are: +1 +1 +1 or +2 +1
    const sorted = [...values].sort((a, b) => b - a);
    const pattern = sorted.slice(0, 3).join("");
    if (pattern !== "111" && pattern !== "210") {
        throw new Error(`Invalid background bonus pattern: ${pattern}. Only +1+1+1 or +2+1 are allowed.`);
    }
}

// ----------------------------------------------------
// ENCODER
// ----------------------------------------------------
export function encodeCharacter(character: EncodedCharacter): string {
    let result: string;

    if (character.stats.method === "point_buy") {
        const pb = character.stats;

        // Class
        const classKey = pb.className.toLowerCase();
        const classLetter = CLASS_TO_LETTER[classKey] ?? "z";

        // Background
        const bgKey = pb.backgroundName.toLowerCase();
        const bgLetter = BG_TO_LETTER[bgKey] ?? "z";

        // ASI Flag
        const asiFlag = pb.asiEnabled ? "1" : "0";

        // Ability Scores
        let scoresStr = "";
        for (const ab of ABILITY_ORDER) {
            const score = pb.abilityScores[ab] ?? 0;
            if (score < 0 || score > 20) {
                throw new Error(`Ability score for ${ab} must be between 0 and 20, got ${score}`);
            }
            scoresStr += pad2(score);
        }

        // Background Bonus (prefixed with 'b')
        validateBgBonus(pb.backgroundBonus, pb.asiEnabled);
        let bgBonusStr = "";
        for (const ab of ABILITY_ORDER) {
            bgBonusStr += (pb.backgroundBonus[ab] ?? 0).toString();
        }

        // Feat Bonus (prefixed with 'f')
        let featBonusStr = "";
        for (const ab of ABILITY_ORDER) {
            const featVal = pb.featBonus[ab] ?? 0;
            if (featVal < 0 || featVal > 20) {
                throw new Error(`Feat bonus for ${ab} must be between 0 and 20, got ${featVal}`);
            }
            featBonusStr += pad2(featVal);
        }

        result = `${classLetter}${bgLetter}${asiFlag}${scoresStr}b${bgBonusStr}f${featBonusStr}`;

    } else if (character.stats.method === "rolled") {
        const rolled = character.stats;
        if (rolled.rolls.length !== 6) {
            throw new Error(`Rolled stats must contain exactly 6 rolls, got ${rolled.rolls.length}`);
        }

        // Check for duplicate assignments
        const assignedAbilities = new Set<Ability>();
        let rolledStr = "";

        for (const roll of rolled.rolls) {
            if (roll.roll.length !== 4 || !/^[1-6]{4}$/.test(roll.roll)) {
                throw new Error(`Invalid raw roll result: ${roll.roll}. Must be exactly 4 digits in range 1-6.`);
            }

            let assignmentChar = "x";
            if (roll.assignment !== "unassigned") {
                if (assignedAbilities.has(roll.assignment)) {
                    throw new Error(`Duplicate assignment for ability: ${roll.assignment}`);
                }
                assignedAbilities.add(roll.assignment);
                assignmentChar = ABILITY_LETTERS[roll.assignment];
            }

            rolledStr += `${roll.roll}${assignmentChar}`;
        }

        result = rolledStr;
    } else {
        throw new Error("Unsupported stat generation method");
    }

    // Skill Encoding
    if (character.skills) {
        const sk = character.skills;

        const isBardVal = sk.isBard ? 1 : 0;
        const conModVal = sk.conMod;

        const hasSaves = sk.savingThrows && sk.savingThrows.length > 0;
        const hasProfs = sk.proficiencies && sk.proficiencies.length > 0;
        const hasExpertise = sk.expertises && sk.expertises.length > 0;

        // Condition check: append skills section ONLY if at least one field has meaningful data
        if (isBardVal === 1 || conModVal !== 0 || hasSaves || hasProfs || hasExpertise) {
            let skillsStr = `${isBardVal}${conModVal}`;

            // 1. Saving Throws
            if (hasSaves) {
                // Ensure alphabetical/standard order of ability letters
                const letters = sk.savingThrows
                    .map((ab) => ABILITY_LETTERS[ab])
                    .filter(Boolean)
                    .sort();
                
                // Validate no duplicate saving throws
                if (new Set(letters).size !== letters.length) {
                    throw new Error("Duplicate saving throws detected");
                }

                skillsStr += `s${letters.join("")}`;
            }

            // Helper to encode and validate skill code arrays
            const getSortedSkillCodes = (skillsArr: Skills[]): string[] => {
                const codes = skillsArr.map((skillName) => {
                    const mapped = SKILL_TO_CODE[skillName];
                    if (!mapped) {
                        throw new Error(`Invalid skill name: ${skillName}`);
                    }
                    return `${mapped.ability}${mapped.index}`;
                });

                if (new Set(codes).size !== codes.length) {
                    throw new Error("Duplicate skill entries detected");
                }

                // Sort skills by ability letter, then index (alphabetical of the codes, e.g. A1, B1, B2)
                return codes.sort();
            };

            // 2. Proficiencies
            if (hasProfs) {
                const profCodes = getSortedSkillCodes(sk.proficiencies);
                skillsStr += `p${profCodes.join("")}`;
            }

            // 3. Expertises
            if (hasExpertise) {
                const expCodes = getSortedSkillCodes(sk.expertises);
                
                // Validate expertise is a subset of proficient skills
                const profSet = new Set(sk.proficiencies);
                for (const expSkill of sk.expertises) {
                    if (!profSet.has(expSkill)) {
                        throw new Error(`Expertise skill must be a subset of proficiencies: ${expSkill} is not proficient`);
                    }
                }

                skillsStr += `e${expCodes.join("")}`;
            }

            result += skillsStr;
        }
    }

    return result;
}

// ----------------------------------------------------
// DECODER
// ----------------------------------------------------
export function decodeCharacter(encoded: string): EncodedCharacter {
    if (!encoded) {
        throw new Error("Empty encoded string");
    }

    let stats: PointBuyData | RolledData;
    let i = 0;

    // Detect generation method:
    // Point Buy starts with 2 letters and 1 digit: e.g. GC0 or xx0
    // Rolled stats starts with 4 digits and 1 letter/x: e.g. 2463F or 5521x
    const isPointBuy = /^[a-zA-Z]{2}[0-9]/.test(encoded);

    if (isPointBuy) {
        // Point Buy Decoding
        if (encoded.length < 35) {
            throw new Error(`Invalid Point Buy encoding: too short (${encoded.length} characters)`);
        }

        // 1. Class
        const classLetter = encoded[i];
        let className = "z";
        if (classLetter !== "z") {
            className = LETTER_TO_CLASS[classLetter.toUpperCase()];
            if (!className) {
                throw new Error(`Invalid class identifier: ${classLetter}`);
            }
        }
        i++;

        // 2. Background
        const bgLetter = encoded[i];
        let backgroundName = "z";
        if (bgLetter !== "z") {
            backgroundName = LETTER_TO_BG[bgLetter.toUpperCase()];
            if (!backgroundName) {
                throw new Error(`Invalid background identifier: ${bgLetter}`);
            }
        }
        i++;

        // 3. ASI Flag
        const asiFlagStr = encoded[i];
        if (asiFlagStr !== "0" && asiFlagStr !== "1") {
            throw new Error(`Invalid ASI flag: ${asiFlagStr}`);
        }
        const asiEnabled = asiFlagStr === "1";
        i++;

        // 4. Ability Scores (12 characters)
        const abilityScores = {} as Record<Ability, number>;
        for (const ab of ABILITY_ORDER) {
            const valStr = encoded.slice(i, i + 2);
            if (valStr.length !== 2 || !/^[0-9]{2}$/.test(valStr)) {
                throw new Error(`Invalid ability score value at index ${i}: ${valStr}`);
            }
            const score = parseInt(valStr, 10);
            if (score < 0 || score > 20) {
                throw new Error(`Ability score for ${ab} out of range: ${score}`);
            }
            abilityScores[ab] = score;
            i += 2;
        }

        // 5. Background Bonus ('b' followed by 6 characters)
        if (encoded[i] !== "b") {
            throw new Error(`Expected background bonus separator 'b' at index ${i}, got '${encoded[i]}'`);
        }
        i++; // skip 'b'

        const backgroundBonus = {} as Record<Ability, number>;
        for (const ab of ABILITY_ORDER) {
            const valChar = encoded[i];
            if (!valChar || !/^[0-9]$/.test(valChar)) {
                throw new Error(`Invalid background bonus character at index ${i}: '${valChar}'`);
            }
            const bonus = parseInt(valChar, 10);
            backgroundBonus[ab] = bonus;
            i++;
        }

        // Validate background bonus structure
        validateBgBonus(backgroundBonus, asiEnabled);

        // 6. Feat Bonus ('f' followed by 12 characters)
        if (encoded[i] !== "f") {
            throw new Error(`Expected feat bonus separator 'f' at index ${i}, got '${encoded[i]}'`);
        }
        i++; // skip 'f'

        const featBonus = {} as Record<Ability, number>;
        for (const ab of ABILITY_ORDER) {
            const valStr = encoded.slice(i, i + 2);
            if (valStr.length !== 2 || !/^[0-9]{2}$/.test(valStr)) {
                throw new Error(`Invalid feat bonus value at index ${i}: ${valStr}`);
            }
            const score = parseInt(valStr, 10);
            if (score < 0 || score > 20) {
                throw new Error(`Feat bonus for ${ab} out of range: ${score}`);
            }
            featBonus[ab] = score;
            i += 2;
        }

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
        // Rolled Stats Decoding
        // Must start with 30 characters of rolled data
        if (encoded.length < 30) {
            throw new Error(`Invalid Rolled stats encoding: too short (${encoded.length} characters)`);
        }

        const rolls: RolledRoll[] = [];
        const assignedAbilities = new Set<Ability>();

        for (let rIndex = 0; rIndex < 6; rIndex++) {
            const rollDigits = encoded.slice(i, i + 4);
            if (rollDigits.length !== 4 || !/^[1-6]{4}$/.test(rollDigits)) {
                throw new Error(`Invalid rolled digits at index ${i}: ${rollDigits}`);
            }
            i += 4;

            const assignChar = encoded[i];
            let assignment: Ability | "unassigned" = "unassigned";

            if (assignChar !== "x") {
                const ab = LETTERS_TO_ABILITY[assignChar.toUpperCase()];
                if (!ab) {
                    throw new Error(`Invalid assignment character at index ${i}: '${assignChar}'`);
                }
                if (assignedAbilities.has(ab)) {
                    throw new Error(`Duplicate assignment for ability in rolled stats: ${ab}`);
                }
                assignedAbilities.add(ab);
                assignment = ab;
            }
            i++;

            rolls.push({
                roll: rollDigits,
                assignment,
            });
        }

        stats = {
            method: "rolled",
            rolls,
        };
    }

    // Skills Parsing (if remaining characters exist)
    let skills: SkillsData | undefined;

    if (i < encoded.length) {
        // Start parsing skills
        // Format: <BARD_FLAG><CON_MOD>s<SAVING_THROWS>p<PROFICIENCIES>e<EXPERTISE>
        const bardFlagChar = encoded[i];
        if (bardFlagChar !== "0" && bardFlagChar !== "1") {
            throw new Error(`Invalid Bard Flag: ${bardFlagChar}`);
        }
        const isBard = bardFlagChar === "1";
        i++;

        // Parse CON modifier (starts with minus or digit, ends when s/p/e or end-of-string is reached)
        let conModStr = "";
        while (i < encoded.length && !["s", "p", "e"].includes(encoded[i])) {
            conModStr += encoded[i];
            i++;
        }

        const conMod = parseInt(conModStr, 10);
        if (isNaN(conMod)) {
            throw new Error(`Invalid CON modifier parsed: '${conModStr}'`);
        }

        const savingThrows: Ability[] = [];
        const proficiencies: Skills[] = [];
        const expertises: Skills[] = [];

        // Parse s<SAVING_THROWS>
        if (i < encoded.length && encoded[i] === "s") {
            i++; // skip 's'
            const parsedSavesLetters = new Set<string>();
            while (i < encoded.length && !["p", "e"].includes(encoded[i])) {
                const letter = encoded[i].toUpperCase();
                const ab = LETTERS_TO_ABILITY[letter];
                if (!ab) {
                    throw new Error(`Invalid saving throw character: '${encoded[i]}'`);
                }
                if (parsedSavesLetters.has(letter)) {
                    throw new Error(`Duplicate saving throw detected: '${letter}'`);
                }
                parsedSavesLetters.add(letter);
                savingThrows.push(ab);
                i++;
            }

            // Validate that they are in standard order
            const expectedOrder = [...savingThrows]
                .map((ab) => ABILITY_LETTERS[ab])
                .sort()
                .map((l) => LETTERS_TO_ABILITY[l]);
            
            for (let idx = 0; idx < savingThrows.length; idx++) {
                if (savingThrows[idx] !== expectedOrder[idx]) {
                    throw new Error("Saving throws not encoded in alphabetical order of ability letters");
                }
            }
        }

        // Parse p<PROFICIENCIES>
        if (i < encoded.length && encoded[i] === "p") {
            i++; // skip 'p'
            const parsedCodes = new Set<string>();
            const codesList: string[] = [];

            while (i < encoded.length && encoded[i] !== "e") {
                const code = encoded.slice(i, i + 2);
                if (code.length !== 2) {
                    throw new Error(`Incomplete proficiency code at index ${i}: ${code}`);
                }
                const skill = CODE_TO_SKILL[code];
                if (!skill) {
                    throw new Error(`Invalid skill code: ${code}`);
                }
                if (parsedCodes.has(code)) {
                    throw new Error(`Duplicate proficiency code: ${code}`);
                }
                parsedCodes.add(code);
                codesList.push(code);
                proficiencies.push(skill);
                i += 2;
            }

            // Validate proficiency code ordering (must be sorted alphabetically)
            const sortedCodes = [...codesList].sort();
            for (let idx = 0; idx < codesList.length; idx++) {
                if (codesList[idx] !== sortedCodes[idx]) {
                    throw new Error(`Proficiencies not encoded in alphabetical code order. Got: ${codesList.join("")}`);
                }
            }
        }

        // Parse e<EXPERTISE>
        if (i < encoded.length && encoded[i] === "e") {
            i++; // skip 'e'
            const parsedCodes = new Set<string>();
            const codesList: string[] = [];

            while (i < encoded.length) {
                const code = encoded.slice(i, i + 2);
                if (code.length !== 2) {
                    throw new Error(`Incomplete expertise code at index ${i}: ${code}`);
                }
                const skill = CODE_TO_SKILL[code];
                if (!skill) {
                    throw new Error(`Invalid expertise code: ${code}`);
                }
                if (parsedCodes.has(code)) {
                    throw new Error(`Duplicate expertise code: ${code}`);
                }
                parsedCodes.add(code);
                codesList.push(code);
                expertises.push(skill);
                i += 2;
            }

            // Validate expertise code ordering (must be sorted alphabetically)
            const sortedCodes = [...codesList].sort();
            for (let idx = 0; idx < codesList.length; idx++) {
                if (codesList[idx] !== sortedCodes[idx]) {
                    throw new Error(`Expertises not encoded in alphabetical code order. Got: ${codesList.join("")}`);
                }
            }

            // Validate expertise is a subset of proficiencies
            const profSet = new Set(proficiencies);
            for (const expSkill of expertises) {
                if (!profSet.has(expSkill)) {
                    throw new Error(`Expertise skill must be a subset of proficiencies: ${expSkill} is not proficient`);
                }
            }
        }

        skills = {
            isBard,
            conMod,
            savingThrows,
            proficiencies,
            expertises,
        };
    }

    return {
        stats,
        skills,
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
        const digits = box.rolls.join(""); // e.g. "5521"
        
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
