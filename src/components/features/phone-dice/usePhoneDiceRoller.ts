import { useState, useEffect } from "react";
import type { RollObject, DicePreset, DiceGroup } from "./types";
import { randomInt } from "@/utils/rng";

const HISTORY_KEY = "phone-dice-history";
const PRESETS_KEY = "phone-dice-presets";
const POOL_ENABLED_KEY = "phone-dice-pool-enabled";

const DEFAULT_PRESETS: DicePreset[] = [
  { id: "p1", name: "D20 Straight", formula: "1d20", icon: "sword" },
  { id: "p2", name: "Longsword Attack", formula: "1d20+5", icon: "sword" },
  { id: "p3", name: "Fireball Damage", formula: "8d6", icon: "explosion" },
  { id: "p4", name: "Healing Word", formula: "1d4+4", icon: "heart" },
];

interface ParsedDiceTerm {
  count: number;
  sides: number;
  sign: 1 | -1;
}

// Parse complex multi-dice formula: e.g. "2d6+1d8+3" or "1d20-2"
function parseMultiDiceFormula(formulaStr: string) {
  const cleaned = formulaStr.replace(/\s+/g, "").toLowerCase();
  const termRegex = /([+-]?\d*)d(\d+)|([+-]\d+)/g;
  
  const diceTerms: ParsedDiceTerm[] = [];
  let modifier = 0;
  let match;
  let hasDice = false;

  while ((match = termRegex.exec(cleaned)) !== null) {
    if (match[3]) {
      // Modifier term (e.g., +3 or -5)
      modifier += parseInt(match[3], 10);
    } else {
      // Dice term (e.g., 2d6 or +1d8 or -d20)
      hasDice = true;
      const termSignStr = match[1] || "";
      let sign: 1 | -1 = 1;
      let countStr = termSignStr;
      
      if (termSignStr.startsWith("+")) {
        sign = 1;
        countStr = termSignStr.substring(1);
      } else if (termSignStr.startsWith("-")) {
        sign = -1;
        countStr = termSignStr.substring(1);
      }
      
      const count = countStr === "" ? 1 : parseInt(countStr, 10);
      const sides = parseInt(match[2], 10);
      
      diceTerms.push({ count: Math.abs(count), sides, sign });
    }
  }

  if (!hasDice) {
    const modOnly = cleaned.match(/^([+-]?\d+)$/);
    if (modOnly) {
      return {
        diceTerms: [],
        modifier: parseInt(modOnly[1], 10)
      };
    }
    return {
      diceTerms: [{ count: 1, sides: 20, sign: 1 as const }],
      modifier: 0
    };
  }

  return { diceTerms, modifier };
}

export function usePhoneDiceRoller() {
  const [rollHistory, setRollHistory] = useState<RollObject[]>(() => {
    const saved = localStorage.getItem(HISTORY_KEY);
    return saved ? JSON.parse(saved) : [];
  });

  const [presets, setPresets] = useState<DicePreset[]>(() => {
    const saved = localStorage.getItem(PRESETS_KEY);
    return saved ? JSON.parse(saved) : DEFAULT_PRESETS;
  });

  const [advantageState, setAdvantageState] = useState<"none" | "advantage" | "disadvantage">("none");
  const [activeRoll, setActiveRoll] = useState<RollObject | null>(() => {
    const saved = localStorage.getItem(HISTORY_KEY);
    if (saved) {
      const history = JSON.parse(saved) as RollObject[];
      return history.length > 0 ? history[0] : null;
    }
    return null;
  });

  const [isRolling, setIsRolling] = useState(false);

  // Active dice pool selection
  const [activePool, setActivePool] = useState<DiceGroup[]>([]);

  // Toggle state to enable or disable the dice pool draft bar
  const [dicePoolEnabled, setDicePoolEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem(POOL_ENABLED_KEY);
    return saved ? JSON.parse(saved) : false;
  });

  // Sync state to localStorage
  useEffect(() => {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(rollHistory));
  }, [rollHistory]);

  useEffect(() => {
    localStorage.setItem(PRESETS_KEY, JSON.stringify(presets));
  }, [presets]);

  useEffect(() => {
    localStorage.setItem(POOL_ENABLED_KEY, JSON.stringify(dicePoolEnabled));
  }, [dicePoolEnabled]);

  const addToPool = (sides: number) => {
    setActivePool((prev) => {
      const existing = prev.find((g) => g.sides === sides);
      if (existing) {
        return prev.map((g) => (g.sides === sides ? { ...g, count: Math.min(100, g.count + 1) } : g));
      } else {
        const newGroup = { sides, count: 1 };
        const updated = [...prev, newGroup];
        return updated.sort((a, b) => a.sides - b.sides);
      }
    });
  };

  const removeFromPool = (sides: number) => {
    setActivePool((prev) => {
      const existing = prev.find((g) => g.sides === sides);
      if (!existing) return prev;
      if (existing.count <= 1) {
        return prev.filter((g) => g.sides !== sides);
      }
      return prev.map((g) => (g.sides === sides ? { ...g, count: g.count - 1 } : g));
    });
  };

  const clearPool = () => {
    setActivePool([]);
  };

  const rollPool = (label?: string) => {
    if (activePool.length === 0) return;
    const formulaStr = activePool.map((g) => `${g.count}d${g.sides}`).join("+");
    rollDice(formulaStr, label);
    clearPool();
  };

  const rollDice = (formula: string, label?: string) => {
    setIsRolling(true);
    const { diceTerms, modifier } = parseMultiDiceFormula(formula);
    const rolls: number[] = [];
    const discardedRolls: number[] = [];
    let result = 0;

    // Save the current advantage state before we reset it
    const activeAdvantageState = advantageState;

    const rollTerms = (terms: typeof diceTerms) => {
      const termRolls: number[] = [];
      let termSum = 0;
      for (const term of terms) {
        for (let i = 0; i < term.count; i++) {
          const r = randomInt(1, term.sides);
          termSum += r * term.sign;
          termRolls.push(r);
        }
      }
      return { sum: termSum, rolls: termRolls };
    };

    if (activeAdvantageState === "none") {
      const rolled = rollTerms(diceTerms);
      rolls.push(...rolled.rolls);
      result = rolled.sum + modifier;
    } else if (activeAdvantageState === "advantage") {
      const totalDiceCount = diceTerms.reduce((sum, t) => sum + t.count, 0);
      if (totalDiceCount === 1 && diceTerms.length === 1) {
        const term = diceTerms[0];
        const r1 = randomInt(1, term.sides);
        const r2 = randomInt(1, term.sides);
        if (r1 >= r2) {
          rolls.push(r1);
          discardedRolls.push(r2);
          result = r1 * term.sign + modifier;
        } else {
          rolls.push(r2);
          discardedRolls.push(r1);
          result = r2 * term.sign + modifier;
        }
      } else {
        const set1 = rollTerms(diceTerms);
        const set2 = rollTerms(diceTerms);
        if (set1.sum >= set2.sum) {
          rolls.push(...set1.rolls);
          discardedRolls.push(...set2.rolls);
          result = set1.sum + modifier;
        } else {
          rolls.push(...set2.rolls);
          discardedRolls.push(...set1.rolls);
          result = set2.sum + modifier;
        }
      }
    } else if (activeAdvantageState === "disadvantage") {
      const totalDiceCount = diceTerms.reduce((sum, t) => sum + t.count, 0);
      if (totalDiceCount === 1 && diceTerms.length === 1) {
        const term = diceTerms[0];
        const r1 = randomInt(1, term.sides);
        const r2 = randomInt(1, term.sides);
        if (r1 <= r2) {
          rolls.push(r1);
          discardedRolls.push(r2);
          result = r1 * term.sign + modifier;
        } else {
          rolls.push(r2);
          discardedRolls.push(r1);
          result = r2 * term.sign + modifier;
        }
      } else {
        const set1 = rollTerms(diceTerms);
        const set2 = rollTerms(diceTerms);
        if (set1.sum <= set2.sum) {
          rolls.push(...set1.rolls);
          discardedRolls.push(...set2.rolls);
          result = set1.sum + modifier;
        } else {
          rolls.push(...set2.rolls);
          discardedRolls.push(...set1.rolls);
          result = set2.sum + modifier;
        }
      }
    }

    const finalFormula = label ? `${label} (${formula})` : formula;

    const newRoll: RollObject = {
      id: crypto.randomUUID(),
      formula: finalFormula,
      rolls,
      discardedRolls: discardedRolls.length > 0 ? discardedRolls : undefined,
      modifier,
      advantageState: activeAdvantageState,
      result,
      timestamp: Date.now(),
    };

    // Reset advantage/disadvantage after a roll
    setAdvantageState("none");

    // Add to history and set as active roll after a delay to simulate a real roll
    setTimeout(() => {
      setRollHistory((prev) => [newRoll, ...prev]);
      setActiveRoll(newRoll);
      setIsRolling(false);
    }, 450);
  };

  const selectRoll = (roll: RollObject) => {
    setActiveRoll(roll);
  };

  const addPreset = (name: string, formula: string, icon?: DicePreset["icon"]) => {
    const newPreset: DicePreset = {
      id: crypto.randomUUID(),
      name,
      formula: formula.replace(/\s+/g, ""),
      icon,
    };
    setPresets((prev) => [...prev, newPreset]);
  };

  const updatePreset = (id: string, name: string, formula: string, icon?: DicePreset["icon"]) => {
    setPresets((prev) =>
      prev.map((p) => (p.id === id ? { ...p, name, formula: formula.replace(/\s+/g, ""), icon } : p))
    );
  };

  const deletePreset = (id: string) => {
    setPresets((prev) => prev.filter((p) => p.id !== id));
  };

  const clearHistory = () => {
    setRollHistory([]);
    setActiveRoll(null);
  };

  return {
    rollHistory,
    presets,
    advantageState,
    setAdvantageState,
    activeRoll,
    selectRoll,
    isRolling,
    rollDice,
    addPreset,
    updatePreset,
    deletePreset,
    clearHistory,
    activePool,
    addToPool,
    removeFromPool,
    clearPool,
    rollPool,
    dicePoolEnabled,
    setDicePoolEnabled,
  };
}
