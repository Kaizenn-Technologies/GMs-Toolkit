export interface RollObject {
  id: string;
  formula: string;
  rolls: number[];
  discardedRolls?: number[];
  modifier: number;
  advantageState: "none" | "advantage" | "disadvantage";
  result: number;
  timestamp: number;
}

export interface DicePreset {
  id: string;
  name: string;
  formula: string;
  icon?: "sword" | "shield" | "explosion" | "spell" | "magic" | "heart";
}

export interface DiceGroup {
  sides: number;
  count: number;
}
