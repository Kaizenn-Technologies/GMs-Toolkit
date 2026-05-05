import type { ClassData } from "@/types";

export const classes = {
    barbarian: {
        name: "Barbarian",
        hitDie: 12,
        primaryStat: { type: "single", value: "Strength" },
        savingThrows: ["Strength", "Constitution"],
    },
    bard: {
        name: "Bard",
        hitDie: 8,
        primaryStat: { type: "single", value: "Charisma" },
        savingThrows: ["Dexterity", "Charisma"],
    },
    cleric: {
        name: "Cleric",
        hitDie: 8,
        primaryStat: { type: "single", value: "Wisdom" },
        savingThrows: ["Wisdom", "Charisma"],
    },
    druid: {
        name: "Druid",
        hitDie: 8,
        primaryStat: { type: "single", value: "Wisdom" },
        savingThrows: ["Intelligence", "Wisdom"],
    },
    fighter: {
        name: "Fighter",
        hitDie: 10,
        primaryStat: { type: "choice", options: ["Strength", "Dexterity"] },
        savingThrows: ["Strength", "Constitution"],
    },
    monk: {
        name: "Monk",
        hitDie: 8,
        primaryStat: { type: "multiple", values: ["Dexterity", "Wisdom"] },
        savingThrows: ["Dexterity", "Wisdom"],
    },
    paladin: {
        name: "Paladin",
        hitDie: 10,
        primaryStat: { type: "multiple", values: ["Strength", "Charisma"] },
        savingThrows: ["Wisdom", "Charisma"],
    },
    ranger: {
        name: "Ranger",
        hitDie: 10,
        primaryStat: { type: "multiple", values: ["Dexterity", "Wisdom"] },
        savingThrows: ["Dexterity", "Strength"],
    },
    rogue: {
        name: "Rogue",
        hitDie: 8,
        primaryStat: { type: "single", value: "Dexterity" },
        savingThrows: ["Dexterity", "Intelligence"],
    },
    sorcerer: {
        name: "Sorcerer",
        hitDie: 6,
        primaryStat: { type: "single", value: "Charisma" },
        savingThrows: ["Constitution", "Charisma"],
    },
    warlock: {
        name: "Warlock",
        hitDie: 8,
        primaryStat: { type: "single", value: "Charisma" },
        savingThrows: ["Wisdom", "Charisma"],
    },
    wizard: {
        name: "Wizard",
        hitDie: 6,
        primaryStat: { type: "single", value: "Intelligence" },
        savingThrows: ["Intelligence", "Wisdom"],
    },
} satisfies Record<string, ClassData>;

export const classNames = Object.values(classes).map((c) => c.name);