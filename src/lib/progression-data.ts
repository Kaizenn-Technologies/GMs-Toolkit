export interface BadgeConfig {
  label: string;
  className: string;
  isGradient?: boolean;
}

export const BADGE_VARIANTS: Record<string, BadgeConfig> = {
  origin: {
    label: "Origin Feat",
    className: "bg-emerald-500/10 border border-emerald-500/25 text-emerald-400",
  },
  general: {
    label: "General Feat",
    className: "bg-blue-500/10 border border-blue-500/25 text-blue-400",
  },
  uncommon: {
    label: "Uncommon",
    className: "bg-blue-500/10 border border-blue-500/25 text-blue-400",
  },
  rare: {
    label: "Rare",
    className: "bg-purple-500/10 border border-purple-500/25 text-purple-400",
  },
  veryrare: {
    label: "Very Rare",
    className: "bg-amber-500/10 border border-amber-500/25 text-amber-400",
  },
  rareToLegendary: {
    label: "Rare to Legendary",
    className: "bg-cyan-400/10 border border-cyan-400/25 text-cyan-200",
  },
  variable: {
    label: "Variable",
    className: "",
    isGradient: true,
  },
};

export interface ProgressionItem {
  id: string;
  name: string;
  rarityKey?: string;
  footerBadgeKeys?: string[];
  description: string;
  attunement?: boolean;
  isAlert?: boolean;
  fullWidth?: boolean;
}

export const FEATS_PROGRESSION: ProgressionItem[] = [
  {
    id: "skilled",
    name: "Skilled",
    rarityKey: "origin",
    description: "You gain proficiency in any combination of three skills or tools of your choice. Excellent for broadening your utility.",
  },
  {
    id: "asi",
    name: "Ability Score Improvement",
    rarityKey: "general",
    description: "Increase one ability score by 2, or two ability scores by 1. You cannot increase an ability score above 20 using this feature.",
  },
  {
    id: "resilient",
    name: "Resilient",
    rarityKey: "general",
    description: "Increase the ability score of your choice by 1, and gain proficiency in saving throws using that ability.",
  },
];

export const MAGIC_ITEMS_PROGRESSION: ProgressionItem[] = [
  {
    id: "headband_intellect",
    name: "Headband of Intellect",
    rarityKey: "uncommon",
    description: "Your Intelligence score becomes 19. If your score is already 19 or higher, the headband has no effect.",
    attunement: true,
  },
  {
    id: "gauntlets_ogre_power",
    name: "Gauntlets of Ogre Power",
    rarityKey: "uncommon",
    description: "Your Strength score becomes 19. If your score is already 19 or higher, the gauntlets have no effect.",
    attunement: true,
  },
  {
    id: "amulet_health",
    name: "Amulet of Health",
    rarityKey: "rare",
    description: "Your Constitution score becomes 19. If your score is already 19 or higher, the amulet has no effect.",
    attunement: true,
  },
  {
    id: "belt_giant_strength",
    name: "Belt of Giant Strength",
    rarityKey: "rareToLegendary",
    description: "Your Strength score becomes equal to the belt's giant type (Hill: 21, Stone/Frost: 23, Fire: 25, Cloud: 27, Storm: 29).",
    attunement: true,
  },
  // {
  //   id: "manual_bodily_health",
  //   name: "Manual of Bodily Health",
  //   rarityKey: "veryrare",
  //   description: "This book contains health and diet tips, and its words are charged with magic. If you spend 48 hours over a period of 6 days or fewer studying the book's contents and practicing its guidelines, your Constitution increases by 2, to a maximum of 30. The manual then loses its magic, but regains it in a century.",
  //   attunement: false,
  //   fullWidth: true,
  // },
  // {
  //   id: "manual_gainful_exercise",
  //   name: "Manual of Gainful Exercise",
  //   rarityKey: "veryrare",
  //   description: "This book describes fitness exercises, and its words are charged with magic. If you spend 48 hours over a period of 6 days or fewer studying the book's contents and practicing its guidelines, your Strength increases by 2, to a maximum of 30. The manual then loses its magic, but regains it in a century.",
  //   attunement: false,
  //   fullWidth: true,
  // },
  // {
  //   id: "manual_quickness_action",
  //   name: "Manual of Quickness of Action",
  //   rarityKey: "veryrare",
  //   description: "This book contains coordination and balance exercises, and its words are charged with magic. If you spend 48 hours over a period of 6 days or fewer studying the book's contents and practicing its guidelines, your Dexterity increases by 2, to a maximum of 30. The manual then loses its magic, but regains it in a century.",
  //   attunement: false,
  //   fullWidth: true,
  // },
  // {
  //   id: "tome_clear_thought",
  //   name: "Tome of Clear Thought",
  //   rarityKey: "veryrare",
  //   description: "This book contains memory and logic exercises, and its words are charged with magic. If you spend 48 hours over a period of 6 days or fewer studying the book's contents and practicing its guidelines, your Intelligence increases by 2, to a maximum of 30. The manual then loses its magic, but regains it in a century.",
  //   attunement: false,
  //   fullWidth: true,
  // },
  // {
  //   id: "tome_leadership_influence",
  //   name: "Tome of Leadership and Influence",
  //   rarityKey: "veryrare",
  //   description: "This book contains guidelines for influencing and charming others, and its words are charged with magic. If you spend 48 hours over a period of 6 days or fewer studying the book's contents and practicing its guidelines, your Charisma increases by 2, to a maximum of 30. The manual then loses its magic, but regains it in a century.",
  //   attunement: false,
  //   fullWidth: true,
  // },
  // {
  //   id: "tome_understanding",
  //   name: "Tome of Understanding",
  //   rarityKey: "veryrare",
  //   description: "This book contains intuition and insight exercises, and its words are charged with magic. If you spend 48 hours over a period of 6 days or fewer studying the book's contents and practicing its guidelines, your Wisdom increases by 2, to a maximum of 30. The manual then loses its magic, but regains it in a century.",
  //   attunement: false,
  //   fullWidth: true,
  // },
  {
    id: "more_magic_items",
    name: "More Magic Items",
    description: "Other very rare items like the Manuals & Tomes (increases stat by 2 and its max to 30) are also common goals in high-tier campaigns.",
    isAlert: true,
  },
];
