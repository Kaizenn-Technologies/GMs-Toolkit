export type DiceConfig = {
  id: string;
  name?: string;
  count: number;
  sides: number;
  modifier?: number;
  explode?: "single" | "compound";
  reroll?: {
    type: "once" | "until";
    threshold: number;
  };
  rule?: {
    type: "keep" | "drop";
    target: "highest" | "lowest";
    value: number;
  };
  isEditing?: boolean;
};

export type DiceGroup = {
  id: string;
  name: string;
  diceIds: string[];
  collapsed: boolean;
  isEditing?: boolean;
};

export type RollResult = {
  configId: string;
  config: DiceConfig;
  results: number[];
  kept: boolean[];
  subtotal: number;
};

export type RollLog = {
  id: string;
  name?: string;
  timestamp: number;
  rolls: RollResult[];
  rejectedRolls?: RollResult[];
  total: number;
  mode?: "normal" | "advantage" | "disadvantage" | "daggerheart";
  daggerheart?: {
    hope: number;
    fear: number;
    outcome: "hope" | "fear" | "critical";
  };
};

