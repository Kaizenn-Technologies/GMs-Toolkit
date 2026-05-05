import { feats } from "./feats";
import type { BackgroundData } from "@/types";

export const backgrounds = {
    acolyte: {
        name: "Acolyte",
        abilityScores: ["Intelligence", "Wisdom", "Charisma"],
        skillProficiencies: ["Insight", "Religion"],
        feat: feats.magicInitiateCleric,
        toolProficiencies: "Calligrapher's Supplies",
        equipment: [
            "Calligrapher's Supplies, Book (Prayers), Holy Symbol, 10 Parchment, Robe, 8 GP",
            "50 GP"
        ]
    },

    artisan: {
        name: "Artisan",
        abilityScores: ["Strength", "Dexterity", "Intelligence"],
        skillProficiencies: ["Investigation", "Persuasion"],
        feat: feats.crafter,
        toolProficiencies: "Any Artisan's Tools",
        equipment: [
            "Artisan's Tools, 2 Pouches, Traveler's Clothes, 32 GP",
            "50 GP"
        ]
    },

    charlatan: {
        name: "Charlatan",
        abilityScores: ["Dexterity", "Constitution", "Charisma"],
        skillProficiencies: ["Deception", "Sleight of Hand"],
        feat: feats.skilled,
        toolProficiencies: "Forgery Kit",
        equipment: [
            "Forgery Kit, Costume, Fine Clothes, 15 GP",
            "50 GP"
        ]
    },

    criminal: {
        name: "Criminal",
        abilityScores: ["Dexterity", "Constitution", "Intelligence"],
        skillProficiencies: ["Sleight of Hand", "Stealth"],
        feat: feats.alert,
        toolProficiencies: "Thieves' Tools",
        equipment: [
            "2 Daggers, Thieves' Tools, Crowbar, 2 Pouches, Traveler's Clothes, 16 GP",
            "50 GP"
        ]
    },

    entertainer: {
        name: "Entertainer",
        abilityScores: ["Strength", "Dexterity", "Charisma"],
        skillProficiencies: ["Acrobatics", "Performance"],
        feat: feats.musician,
        toolProficiencies: "Any Musical Instrument",
        equipment: [
            "Musical Instrument, 2 Costumes, Mirror, Perfume, Traveler's Clothes, 11 GP",
            "50 GP"
        ]
    },

    farmer: {
        name: "Farmer",
        abilityScores: ["Strength", "Constitution", "Wisdom"],
        skillProficiencies: ["Animal Handling", "Nature"],
        feat: feats.tough,
        toolProficiencies: "Carpenter's Tools",
        equipment: [
            "Sickle, Carpenter's Tools, Healer's Kit, Iron Pot, Shovel, Traveler's Clothes, 30 GP",
            "50 GP"
        ]
    },

    guard: {
        name: "Guard",
        abilityScores: ["Strength", "Intelligence", "Wisdom"],
        skillProficiencies: ["Athletics", "Perception"],
        feat: feats.alert,
        toolProficiencies: "Any Gaming Set",
        equipment: [
            "Spear, Light Crossbow, 20 Bolts, Gaming Set, Hooded Lantern, Manacles, Quiver, Traveler's Clothes, 12 GP",
            "50 GP"
        ]
    },

    guide: {
        name: "Guide",
        abilityScores: ["Dexterity", "Constitution", "Wisdom"],
        skillProficiencies: ["Stealth", "Survival"],
        feat: feats.magicInitiateDruid,
        toolProficiencies: "Cartographer's Tools",
        equipment: [
            "Shortbow, 20 Arrows, Cartographer's Tools, Bedroll, Quiver, Tent, Traveler's Clothes, 3 GP",
            "50 GP"
        ]
    },

    hermit: {
        name: "Hermit",
        abilityScores: ["Constitution", "Wisdom", "Charisma"],
        skillProficiencies: ["Medicine", "Religion"],
        feat: feats.healer,
        toolProficiencies: "Herbalism Kit",
        equipment: [
            "Quarterstaff, Herbalism Kit, Bedroll, Book, Lamp, 3 Oil, Traveler's Clothes, 16 GP",
            "50 GP"
        ]
    },

    merchant: {
        name: "Merchant",
        abilityScores: ["Constitution", "Intelligence", "Charisma"],
        skillProficiencies: ["Animal Handling", "Persuasion"],
        feat: feats.lucky,
        toolProficiencies: "Navigator's Tools",
        equipment: [
            "Navigator's Tools, 2 Pouches, Traveler's Clothes, 22 GP",
            "50 GP"
        ]
    },

    noble: {
        name: "Noble",
        abilityScores: ["Strength", "Intelligence", "Charisma"],
        skillProficiencies: ["History", "Persuasion"],
        feat: feats.skilled,
        toolProficiencies: "Any Gaming Set",
        equipment: [
            "Gaming Set, Fine Clothes, Perfume, 29 GP",
            "50 GP"
        ]
    },

    sage: {
        name: "Sage",
        abilityScores: ["Constitution", "Intelligence", "Wisdom"],
        skillProficiencies: ["Arcana", "History"],
        feat: feats.magicInitiateWizard,
        toolProficiencies: "Calligrapher's Supplies",
        equipment: [
            "Quarterstaff, Calligrapher's Supplies, Book, 8 Parchment, Robe, 8 GP",
            "50 GP"
        ]
    },

    sailor: {
        name: "Sailor",
        abilityScores: ["Strength", "Dexterity", "Wisdom"],
        skillProficiencies: ["Acrobatics", "Perception"],
        feat: feats.tavernBrawler,
        toolProficiencies: "Navigator's Tools",
        equipment: [
            "Dagger, Navigator's Tools, Rope, Traveler's Clothes, 20 GP",
            "50 GP"
        ]
    },

    scribe: {
        name: "Scribe",
        abilityScores: ["Dexterity", "Intelligence", "Wisdom"],
        skillProficiencies: ["Investigation", "Perception"],
        feat: feats.skilled,
        toolProficiencies: "Calligrapher's Supplies",
        equipment: [
            "Calligrapher's Supplies, Fine Clothes, Lamp, Oil, Parchment, 23 GP",
            "50 GP"
        ]
    },

    soldier: {
        name: "Soldier",
        abilityScores: ["Strength", "Dexterity", "Constitution"],
        skillProficiencies: ["Athletics", "Intimidation"],
        feat: feats.savageAttacker,
        toolProficiencies: "Any Gaming Set",
        equipment: [
            "Spear, Shortbow, 20 Arrows, Gaming Set, Healer's Kit, Quiver, Traveler's Clothes, 14 GP",
            "50 GP"
        ]
    },

    wayfarer: {
        name: "Wayfarer",
        abilityScores: ["Dexterity", "Wisdom", "Charisma"],
        skillProficiencies: ["Insight", "Stealth"],
        feat: feats.lucky,
        toolProficiencies: "Thieves' Tools",
        equipment: [
            "2 Daggers, Thieves' Tools, Gaming Set, Bedroll, 2 Pouches, Traveler's Clothes, 16 GP",
            "50 GP"
        ]
    }
} satisfies Record<string, BackgroundData>;

export const backgroundNames = Object.values(backgrounds).map((c) => c.name);