import { classes } from "../lib/classes";
import type { ClassSelection } from "@/types";
import { CUSTOM_CLASS_NAME } from "../lib/constants";

export interface CustomClass {
    type: "custom";
    hitDie: 1 | 2 | 3 | 4; // 1=d6, 2=d8, 3=d10, 4=d12
    levels: number;
}

export interface StandardClass {
    type: "standard";
    key: keyof typeof classes; // reuse existing classes.ts keys
    levels: number;
}

export type ClassInput = CustomClass | StandardClass;

export interface RollEntry {
    classId: string; // 'x' or 'A'...'L'
    value: number;   // 1–12
}

export interface CoreDataInput {
    classes: ClassInput[];
    conMod: number;
    tough: boolean;
    hillDwarf: boolean;
    rolls?: RollEntry[];
    metadata?: CoreMetadataInput;
}

export interface CoreMetadataInput {
    version: string;
    unixTime: number;
    rerolls: number;
    name?: string;
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

const CLASS_LETTER_MAP: Record<keyof typeof classes, string> =
    Object.fromEntries(
        CLASS_ORDER.map((key, i) => [key, String.fromCharCode(65 + i)])
    ) as Record<keyof typeof classes, string>;

const CUSTOM_HIT_DIE_TO_CODE: Record<number, 1 | 2 | 3 | 4> = {
    6: 1,
    8: 2,
    10: 3,
    12: 4,
};

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

function pad2(n: number): string {
    return n.toString().padStart(2, "0");
}

function encodeClass(cls: ClassInput): string {
    if (cls.type === "custom") {
        return `x${cls.hitDie}${cls.levels}`;
    }

    const letter = CLASS_LETTER_MAP[cls.key];
    return `${letter}${cls.levels}`;
}

function encodeClasses(classesInput: ClassInput[]): string {
    return classesInput.map(encodeClass).join("");
}

function getTotalLevels(classesInput: ClassInput[]): number {
    return classesInput.reduce((sum, c) => sum + c.levels, 0);
}

function encodeFlags(tough: boolean, hillDwarf: boolean): string {
    return `${tough ? 1 : 0}${hillDwarf ? 1 : 0}`;
}

function encodeRolls(rolls?: RollEntry[]): string {
    if (!rolls || rolls.length === 0) return "";

    const encoded = rolls
        .map((r) => `${r.classId.toLowerCase()}${pad2(r.value)}`)
        .join("");

    return `r${encoded}`;
}

function encodeMetadata(metadata?: CoreMetadataInput): string {
    if (!metadata) return "";

    const name = metadata.name ? encodeURIComponent(metadata.name) : "";
    return `mv${metadata.version}u${metadata.unixTime}z${metadata.rerolls}n${name}`;
}

export function classSelectionsToClassInput(classSelections: ClassSelection[]): ClassInput[] {
    return classSelections.map((selection) => {
        if (selection.className === CUSTOM_CLASS_NAME) {
            const customHitDie = selection.customHitDie ?? 6;
            return {
                type: "custom",
                hitDie: CUSTOM_HIT_DIE_TO_CODE[customHitDie],
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

export function buildCoreData(input: CoreDataInput): string {
    const { classes, conMod, tough, hillDwarf, rolls, metadata } = input;

    const totalLevel = pad2(getTotalLevels(classes));
    const classData = encodeClasses(classes);
    const con = `n${conMod >= 0 ? "+" : ""}${conMod}`;
    const flags = encodeFlags(tough, hillDwarf);

    const base = `${totalLevel}${classData}${con}${flags}`;
    const rollData = encodeRolls(rolls);
    const metadataData = encodeMetadata(metadata);

    return base + rollData + metadataData;
}