import type { Ability } from "@/types";

export const ABILITIES: Ability[] = [
  "Strength",
  "Dexterity",
  "Constitution",
  "Intelligence",
  "Wisdom",
  "Charisma",
];

export const ABILITY_ABBR: Record<Ability, string> = {
  Strength: "STR",
  Dexterity: "DEX",
  Constitution: "CON",
  Intelligence: "INT",
  Wisdom: "WIS",
  Charisma: "CHA",
};

export function createAbilityRecord<T>(value: T): Record<Ability, T> {
  return {
    Strength: value,
    Dexterity: value,
    Constitution: value,
    Intelligence: value,
    Wisdom: value,
    Charisma: value,
  };
}

export function getModifier(score: number): number {
  return Math.floor((score - 10) / 2);
}

export function formatModifier(mod: number): string {
  if (mod > 0) return `+${mod}`;
  return `${mod}`;
}

export function getPoolStatusClass(value: number): string {
  if (value < 0) return "text-[#ff3d3d]";
  if (value === 0) return "text-[#00c93cff] dark:text-[#10ff58ff]";
  return "text-foreground";
}

export function getModifierClass(value: number | null): string {
  if (value !== null && value > 0) return "text-[#00c93cff] dark:text-[#10ff58ff]";
  if (value !== null && value < 0) return "text-[#ff3d3d]";
  return "text-muted-foreground";
}
