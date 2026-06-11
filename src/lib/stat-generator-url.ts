import type { Ability } from "@/types";

export const scoreParamKeys: Record<Ability, string> = {
  Strength: "str",
  Dexterity: "dex",
  Constitution: "con",
  Intelligence: "int",
  Wisdom: "wis",
  Charisma: "cha",
};

export const backgroundBonusParamKeys: Record<Ability, string> = {
  Strength: "bstr",
  Dexterity: "bdex",
  Constitution: "bcon",
  Intelligence: "bint",
  Wisdom: "bwis",
  Charisma: "bcha",
};

export const manualBonusParamKeys: Record<Ability, string> = {
  Strength: "mstr",
  Dexterity: "mdex",
  Constitution: "mcon",
  Intelligence: "mint",
  Wisdom: "mwis",
  Charisma: "mcha",
};

export function parseClampedIntParam(
  value: string | null,
  min: number,
  max: number,
): number | null {
  if (!value) return null;
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed)) return null;
  return Math.max(min, Math.min(max, parsed));
}

