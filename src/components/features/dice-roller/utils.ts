import type { DiceConfig, RollResult } from "./types";

/**
 * Parses a dice notation string (e.g. "4d6k3+2!") into a DiceConfig object.
 */
export function parseDiceNotation(input: string): Partial<DiceConfig> {
  const cleanInput = input.replace(/\s+/g, "").toLowerCase();
  
  // Basic XdY
  const baseMatch = cleanInput.match(/^(\d+)d(\d+)/);
  if (!baseMatch) return {};

  const config: Partial<DiceConfig> = {
    id: crypto.randomUUID(),
    count: parseInt(baseMatch[1]),
    sides: parseInt(baseMatch[2]),
  };

  // Keep/Drop
  // Match k followed by h/l (optional) and digits
  const keepMatch = cleanInput.match(/k(h|l)?(\d+)/);
  if (keepMatch) {
    config.rule = {
      type: "keep",
      target: keepMatch[1] === "l" ? "lowest" : "highest",
      value: parseInt(keepMatch[2]),
    };
  }

  // Match d followed by h/l (optional) and digits, but NOT the 'd' in '4d6'
  const dropAfterBase = cleanInput.slice(baseMatch[0].length).match(/d(h|l)?(\d+)/);
  if (dropAfterBase) {
    config.rule = {
      type: "drop",
      target: dropAfterBase[1] === "h" ? "highest" : "lowest",
      value: parseInt(dropAfterBase[2]),
    };
  }

  // Modifier
  const modMatch = cleanInput.match(/([+-]\d+)/);
  if (modMatch) {
    config.modifier = parseInt(modMatch[1]);
  }

  // Explode
  if (cleanInput.includes("!!")) {
    config.explode = "compound";
  } else if (cleanInput.includes("!")) {
    config.explode = "single";
  }

  // Reroll
  const rrMatch = cleanInput.match(/rr(\d+)/);
  if (rrMatch) {
    config.reroll = {
      type: "until",
      threshold: parseInt(rrMatch[1]),
    };
  } else {
    const rMatch = cleanInput.match(/r(\d+)/);
    if (rMatch) {
      config.reroll = {
        type: "once",
        threshold: parseInt(rMatch[1]),
      };
    }
  }

  return config;
}

/**
 * Rolls dice based on a DiceConfig and returns the results.
 */
export function rollDice(config: DiceConfig): RollResult {
  const { count, sides, modifier = 0, explode, reroll, rule } = config;
  let results: number[] = [];

  // Initial rolls
  for (let i = 0; i < count; i++) {
    results.push(rollSingleDie(sides, explode, reroll));
  }

  // Handle Keep/Drop
  let kept = new Array(results.length).fill(true);
  if (rule) {
    const sortedIndices = results
      .map((val, idx) => ({ val, idx }))
      .sort((a, b) => b.val - a.val);

    if (rule.type === "keep") {
      if (rule.target === "highest") {
        // Keep highest N
        const keepCount = Math.min(rule.value, results.length);
        kept.fill(false);
        for (let i = 0; i < keepCount; i++) {
          kept[sortedIndices[i].idx] = true;
        }
      } else {
        // Keep lowest N
        const keepCount = Math.min(rule.value, results.length);
        kept.fill(false);
        for (let i = 0; i < keepCount; i++) {
          kept[sortedIndices[results.length - 1 - i].idx] = true;
        }
      }
    } else if (rule.type === "drop") {
      if (rule.target === "lowest") {
        // Drop lowest N
        const dropCount = Math.min(rule.value, results.length);
        for (let i = 0; i < dropCount; i++) {
          kept[sortedIndices[results.length - 1 - i].idx] = false;
        }
      } else {
        // Drop highest N
        const dropCount = Math.min(rule.value, results.length);
        for (let i = 0; i < dropCount; i++) {
          kept[sortedIndices[i].idx] = false;
        }
      }
    }
  }

  const subtotal = results.reduce((acc, val, idx) => acc + (kept[idx] ? val : 0), 0) + modifier;

  return {
    configId: config.id,
    config,
    results,
    kept,
    subtotal,
  };
}

/**
 * Rolls a single die with advanced mechanics.
 */
function rollSingleDie(
  sides: number,
  explode?: "single" | "compound",
  reroll?: { type: "once" | "until"; threshold: number }
): number {
  let roll = Math.floor(Math.random() * sides) + 1;

  // Handle Rerolls
  if (reroll) {
    if (reroll.type === "once" && roll <= reroll.threshold) {
      roll = Math.floor(Math.random() * sides) + 1;
    } else if (reroll.type === "until") {
      while (roll <= reroll.threshold) {
        roll = Math.floor(Math.random() * sides) + 1;
      }
    }
  }

  // Handle Exploding
  if (explode) {
    if (roll === sides) {
      if (explode === "single") {
        roll += Math.floor(Math.random() * sides) + 1;
      } else if (explode === "compound") {
        let extra = Math.floor(Math.random() * sides) + 1;
        roll += extra;
        while (extra === sides) {
          extra = Math.floor(Math.random() * sides) + 1;
          roll += extra;
        }
      }
    }
  }

  return roll;
}
