import type { Feat } from "@/types";

export const feats = {
    asi: {
        name: "Ability Score Improvement",
        type: "ASI",
        abilityScoreModifiers: [],
        prerequisites: [],
        descriptionHeadings: ["ASI Options"],
        description: ["+2 to one ability score", "+1 to two ability scores"],
    },
    alert: {
        name: "Alert",
        type: "Origin",
        descriptionHeadings: [
            "Initiative Proficiency",
            "Initiative Swap",
        ],
        description: [
            "Add Proficiency Bonus to initiative rolls",
            "Swap initiative with a willing non-incapacitated ally after rolling",
        ],
    },

    crafter: {
        name: "Crafter",
        type: "Origin",
        descriptionHeadings: [
            "Tool Proficiency",
            "Discount",
            "Fast Crafting",
        ],
        description: [
            "Gain proficiency with three Artisan's Tools",
            "20% discount on nonmagical items",
            "Craft one temporary item after a Long Rest (Fast Crafting)",
        ],
    },

    healer: {
        name: "Healer",
        type: "Origin",
        descriptionHeadings: [
            "Battle Medic",
            "Healing Rerolls",
        ],
        description: [
            "Use Healer's Kit to let a creature spend a Hit Die and heal + PB",
            "Reroll 1s on healing dice",
        ],
    },

    lucky: {
        name: "Lucky",
        type: "Origin",
        descriptionHeadings: [
            "Luck Points",
            "Advantage",
            "Disadvantage",
        ],
        description: [
            "Luck Points = Proficiency Bonus per Long Rest",
            "Spend 1 point for advantage on a d20 test",
            "Spend 1 point to impose disadvantage on attack against you",
        ],
    },

    magicInitiateCleric: {
        name: "Magic Initiate (Cleric)",
        type: "Origin",
        descriptionHeadings: [
            "Two Cantrips",
            "Level 1 Spell",
            "Spell Change",
            "Repeatable",
        ],
        description: [
            "Learn 2 cantrips from Cleric",
            "Learn 1 level 1 spell (1 free cast per Long Rest)",
            "Can change spells on level up",
            "Repeatable with different spell lists",
        ],
    },
    magicInitiateDruid: {
        name: "Magic Initiate (Druid)",
        type: "Origin",
        descriptionHeadings: [
            "Two Cantrips",
            "Level 1 Spell",
            "Spell Change",
            "Repeatable",
        ],
        description: [
            "Learn 2 cantrips from Druid",
            "Learn 1 level 1 spell (1 free cast per Long Rest)",
            "Can change spells on level up",
            "Repeatable with different spell lists",
        ],
    },
    magicInitiateWizard: {
        name: "Magic Initiate (Wizard)",
        type: "Origin",
        descriptionHeadings: [
            "Two Cantrips",
            "Level 1 Spell",
            "Spell Change",
            "Repeatable",
        ],
        description: [
            "Learn 2 cantrips from Wizard",
            "Learn 1 level 1 spell (1 free cast per Long Rest)",
            "Can change spells on level up",
            "Repeatable with different spell lists",
        ],
    },
    magicInitiate: {
        name: "Magic Initiate",
        type: "Origin",
        descriptionHeadings: [
            "Two Cantrips",
            "Level 1 Spell",
            "Spell Change",
            "Repeatable",
        ],
        description: [
            "Learn 2 cantrips from Cleric, Druid, or Wizard",
            "Learn 1 level 1 spell (1 free cast per Long Rest)",
            "Can change spells on level up",
            "Repeatable with different spell lists",
        ],
    },

    musician: {
        name: "Musician",
        type: "Origin",
        descriptionHeadings: [
            "Instrument Training",
            "Encouraging Song",
        ],
        description: [
            "Gain proficiency with 3 musical instruments",
            "After rest, grant Heroic Inspiration to allies equal to PB",
        ],
    },

    savageAttacker: {
        name: "Savage Attacker",
        type: "Origin",
        description: [
            "Once per turn, roll weapon damage twice and use either result",
        ],
    },

    skilled: {
        name: "Skilled",
        type: "Origin",
        descriptionHeadings: [
            "Proficiencies",
            "Repeatable",
        ],
        description: [
            "Gain proficiency in any 3 skills or tools",
            "You can gain this feat multiple times"
        ],
    },

    tavernBrawler: {
        name: "Tavern Brawler",
        type: "Origin",
        descriptionHeadings: [
            "Enhanced Unarmed Strike",
            "Damage Rerolls",
            "Improvised Weaponry",
            "Push",
        ],
        description: [
            "Unarmed strike deals 1d4 + STR",
            "Reroll 1s on unarmed damage",
            "Proficiency with improvised weapons",
            "Once per turn, push target 5 ft on unarmed hit",
        ],
    },

    tough: {
        name: "Tough",
        type: "Origin",
        description: [
            "+2 HP per level (including retroactive)",
        ],
    },
} satisfies Record<string, Feat>;