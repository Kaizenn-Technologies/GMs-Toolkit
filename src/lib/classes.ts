import type { ClassData } from "@/types";

export const classes: Record<string, ClassData> = {
    barbarian: { name: "Barbarian", hitDie: 12 },
    bard: { name: "Bard", hitDie: 8 },
    cleric: { name: "Cleric", hitDie: 8 },
    druid: { name: "Druid", hitDie: 8 },
    fighter: { name: "Fighter", hitDie: 10 },
    monk: { name: "Monk", hitDie: 8 },
    paladin: { name: "Paladin", hitDie: 10 },
    ranger: { name: "Ranger", hitDie: 10 },
    rogue: { name: "Rogue", hitDie: 8 },
    sorcerer: { name: "Sorcerer", hitDie: 6 },
    warlock: { name: "Warlock", hitDie: 8 },
    wizard: { name: "Wizard", hitDie: 6 },
};

export const classNames = Object.values(classes).map((c) => c.name);
