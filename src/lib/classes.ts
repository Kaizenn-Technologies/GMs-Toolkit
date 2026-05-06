import type { ClassData } from "@/types";

export const classes = {
    barbarian: {
        name: "Barbarian",
        hitDie: 12,
        primaryStat: { type: "single", value: "Strength" },
        savingThrows: ["Strength", "Constitution"],
        standardArray: [15, 13, 14, 10, 12, 8],
    },
    bard: {
        name: "Bard",
        hitDie: 8,
        primaryStat: { type: "single", value: "Charisma" },
        savingThrows: ["Dexterity", "Charisma"],
        standardArray: [8, 14, 12, 13, 10, 15],
    },
    cleric: {
        name: "Cleric",
        hitDie: 8,
        primaryStat: { type: "single", value: "Wisdom" },
        savingThrows: ["Wisdom", "Charisma"],
        standardArray: [14, 8, 13, 10, 15, 12],
    },
    druid: {
        name: "Druid",
        hitDie: 8,
        primaryStat: { type: "single", value: "Wisdom" },
        savingThrows: ["Intelligence", "Wisdom"],
        standardArray: [8, 12, 14, 13, 15, 10],
    },
    fighter: {
        name: "Fighter",
        hitDie: 10,
        primaryStat: { type: "choice", options: ["Strength", "Dexterity"] },
        savingThrows: ["Strength", "Constitution"],
        standardArray: [15, 14, 13, 8, 10, 12],
    },
    monk: {
        name: "Monk",
        hitDie: 8,
        primaryStat: { type: "multiple", values: ["Dexterity", "Wisdom"] },
        savingThrows: ["Dexterity", "Wisdom"],
        standardArray: [12, 15, 13, 10, 14, 8],
    },
    paladin: {
        name: "Paladin",
        hitDie: 10,
        primaryStat: { type: "multiple", values: ["Strength", "Charisma"] },
        savingThrows: ["Wisdom", "Charisma"],
        standardArray: [15, 10, 13, 8, 12, 14],
    },
    ranger: {
        name: "Ranger",
        hitDie: 10,
        primaryStat: { type: "multiple", values: ["Dexterity", "Wisdom"] },
        savingThrows: ["Dexterity", "Strength"],
        standardArray: [12, 15, 13, 8, 14, 10],
    },
    rogue: {
        name: "Rogue",
        hitDie: 8,
        primaryStat: { type: "single", value: "Dexterity" },
        savingThrows: ["Dexterity", "Intelligence"],
        standardArray: [12, 15, 13, 14, 10, 8],
    },
    sorcerer: {
        name: "Sorcerer",
        hitDie: 6,
        primaryStat: { type: "single", value: "Charisma" },
        savingThrows: ["Constitution", "Charisma"],
        standardArray: [10, 13, 14, 8, 12, 15],
    },
    warlock: {
        name: "Warlock",
        hitDie: 8,
        primaryStat: { type: "single", value: "Charisma" },
        savingThrows: ["Wisdom", "Charisma"],
        standardArray: [8, 14, 13, 12, 10, 15],
    },
    wizard: {
        name: "Wizard",
        hitDie: 6,
        primaryStat: { type: "single", value: "Intelligence" },
        savingThrows: ["Intelligence", "Wisdom"],
        standardArray: [8, 12, 13, 15, 14, 10],
    },
} satisfies Record<string, ClassData>;

export const classNames = Object.values(classes).map((c) => c.name);