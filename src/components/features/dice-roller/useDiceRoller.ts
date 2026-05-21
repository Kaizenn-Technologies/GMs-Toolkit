import { useState, useEffect } from "react";
import type { DiceConfig, DiceGroup, RollLog, RollResult } from "./types";
import { rollDice, parseDiceNotation } from "./utils";

const PRESETS_KEY = "dm-dice-presets";
const GROUPS_KEY = "dm-dice-groups";

export function useDiceRoller(addLog: (log: RollLog) => void) {
  const [diceConfigs, setDiceConfigs] = useState<DiceConfig[]>(() => {
    const saved = localStorage.getItem(PRESETS_KEY);
    return saved ? JSON.parse(saved) : [];
  });

  const [groups, setGroups] = useState<DiceGroup[]>(() => {
    const saved = localStorage.getItem(GROUPS_KEY);
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const cleaned = diceConfigs.map(({ isEditing, ...rest }) => rest);
    localStorage.setItem(PRESETS_KEY, JSON.stringify(cleaned));
  }, [diceConfigs]);

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const cleaned = groups.map(({ isEditing, ...rest }) => rest);
    localStorage.setItem(GROUPS_KEY, JSON.stringify(cleaned));
  }, [groups]);

  const addDiceConfig = (config: DiceConfig) => {
    setDiceConfigs((prev) => [...prev, { ...config, isEditing: config.isEditing ?? false }]);
  };

  const updateDiceConfig = (id: string, updates: Partial<DiceConfig>) => {
    setDiceConfigs((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updates } : c))
    );
  };

  const deleteDiceConfig = (id: string) => {
    setDiceConfigs((prev) => prev.filter((c) => c.id !== id));
    setGroups((prev) =>
      prev.map((g) => ({
        ...g,
        diceIds: g.diceIds.filter((dId) => dId !== id),
      }))
    );
  };

  const addGroup = (name: string) => {
    const newGroup: DiceGroup = {
      id: crypto.randomUUID(),
      name,
      diceIds: [],
      collapsed: false,
      isEditing: false,
    };
    setGroups((prev) => [...prev, newGroup]);
  };

  const deleteGroup = (id: string) => {
    setGroups((prev) => prev.filter((g) => g.id !== id));
  };
  
  const updateGroup = (id: string, updates: Partial<DiceGroup>) => {
    setGroups((prev) =>
      prev.map((g) => (g.id === id ? { ...g, ...updates } : g))
    );
  };

  const toggleGroupCollapse = (id: string) => {
    setGroups((prev) =>
      prev.map((g) => (g.id === id ? { ...g, collapsed: !g.collapsed } : g))
    );
  };

  const moveDiceToGroup = (diceId: string, groupId: string | null, position?: number) => {
    setGroups((prev) =>
      prev.map((g) => {
        // Remove from all groups first
        const newDiceIds = g.diceIds.filter((id) => id !== diceId);
        
        // Add to target group
        if (g.id === groupId) {
          if (typeof position === 'number') {
            newDiceIds.splice(position, 0, diceId);
          } else {
            newDiceIds.push(diceId);
          }
        }
        return { ...g, diceIds: newDiceIds };
      })
    );
  };

  const rollConfig = (configId: string, mode: "normal" | "advantage" | "disadvantage" = "normal") => {
    const config = diceConfigs.find((c) => c.id === configId);
    if (!config) return;

    let rolls: RollResult[];
    let rejectedRolls: RollResult[] | undefined = undefined;
    let total: number;

    if (mode === "normal") {
      const result = rollDice(config);
      rolls = [result];
      total = result.subtotal;
    } else {
      const r1 = rollDice(config);
      const r2 = rollDice(config);
      if (mode === "advantage") {
        const picked = r1.subtotal >= r2.subtotal ? r1 : r2;
        const rejected = r1.subtotal >= r2.subtotal ? r2 : r1;
        rolls = [picked];
        rejectedRolls = [rejected];
        total = picked.subtotal;
      } else {
        const picked = r1.subtotal <= r2.subtotal ? r1 : r2;
        const rejected = r1.subtotal <= r2.subtotal ? r2 : r1;
        rolls = [picked];
        rejectedRolls = [rejected];
        total = picked.subtotal;
      }
    }

    const log: RollLog = {
      id: crypto.randomUUID(),
      name: config.name || `${config.count}d${config.sides}`,
      timestamp: Date.now(),
      rolls,
      rejectedRolls,
      total,
      mode,
    };

    addLog(log);
  };

  const rollGroup = (groupId: string, mode: "normal" | "advantage" | "disadvantage" = "normal") => {
    const group = groups.find((g) => g.id === groupId);
    if (!group) return;

    const groupConfigs = group.diceIds
      .map((id) => diceConfigs.find((c) => c.id === id))
      .filter((c): c is DiceConfig => !!c);

    if (groupConfigs.length === 0) return;

    let rolls: RollResult[];
    let rejectedRolls: RollResult[] | undefined = undefined;
    let total: number;

    if (mode === "normal") {
      rolls = groupConfigs.map((c) => rollDice(c));
      total = rolls.reduce((acc, r) => acc + r.subtotal, 0);
    } else {
      const set1 = groupConfigs.map((c) => rollDice(c));
      const set2 = groupConfigs.map((c) => rollDice(c));
      const t1 = set1.reduce((acc, r) => acc + r.subtotal, 0);
      const t2 = set2.reduce((acc, r) => acc + r.subtotal, 0);

      if (mode === "advantage") {
        if (t1 >= t2) {
          rolls = set1;
          rejectedRolls = set2;
          total = t1;
        } else {
          rolls = set2;
          rejectedRolls = set1;
          total = t2;
        }
      } else {
        if (t1 <= t2) {
          rolls = set1;
          rejectedRolls = set2;
          total = t1;
        } else {
          rolls = set2;
          rejectedRolls = set1;
          total = t2;
        }
      }
    }

    const log: RollLog = {
      id: crypto.randomUUID(),
      name: group.name,
      timestamp: Date.now(),
      rolls,
      rejectedRolls,
      total,
      mode,
    };

    addLog(log);
  };

  const rollNotation = (notation: string, name?: string, isDaggerheart?: boolean, mode: "normal" | "advantage" | "disadvantage" = "normal") => {
    // Basic validation and fallback parsing for simple dX or XdX
    let config: Partial<DiceConfig> = parseDiceNotation(notation);
    
    if (!config.count || !config.sides) {
      const match = notation.toLowerCase().match(/^(\d*)d(\d+)$/);
      if (match) {
        config = {
          count: parseInt(match[1]) || 1,
          sides: parseInt(match[2]),
        };
      }
    }

    if (!config.count || !config.sides) return;
    
    if (!config.id) config.id = crypto.randomUUID();

    let rolls: RollResult[];
    let rejectedRolls: RollResult[] | undefined = undefined;
    let total: number;

    if (mode === "normal" || isDaggerheart) {
      const result = rollDice(config as DiceConfig);
      rolls = [result];
      total = result.subtotal;
    } else {
      const r1 = rollDice(config as DiceConfig);
      const r2 = rollDice(config as DiceConfig);
      if (mode === "advantage") {
        const picked = r1.subtotal >= r2.subtotal ? r1 : r2;
        const rejected = r1.subtotal >= r2.subtotal ? r2 : r1;
        rolls = [picked];
        rejectedRolls = [rejected];
        total = picked.subtotal;
      } else {
        const picked = r1.subtotal <= r2.subtotal ? r1 : r2;
        const rejected = r1.subtotal <= r2.subtotal ? r2 : r1;
        rolls = [picked];
        rejectedRolls = [rejected];
        total = picked.subtotal;
      }
    }
    
    const log: RollLog = {
      id: crypto.randomUUID(),
      name: name || notation,
      timestamp: Date.now(),
      rolls,
      rejectedRolls,
      total,
      mode: isDaggerheart ? "daggerheart" : mode,
    };

    if (isDaggerheart && rolls[0].results.length >= 2) {
      const result = rolls[0];
      const hope = result.results[0];
      const fear = result.results[1];
      let outcome: "hope" | "fear" | "critical";
      
      if (hope === fear) {
        outcome = "critical";
      } else if (fear > hope) {
        outcome = "fear";
      } else {
        outcome = "hope";
      }
      
      log.daggerheart = { hope, fear, outcome };
    }

    addLog(log);
  };


  const importData = (data: unknown, mode: "merge" | "replace"): { success: boolean; error?: string } => {
    try {
      if (!data || typeof data !== "object") {
        return { success: false, error: "Invalid JSON object" };
      }

      const parsed = data as Record<string, unknown>;
      const incomingGroups = Array.isArray(parsed.groups) ? parsed.groups : [];
      let incomingUngrouped = Array.isArray(parsed.ungrouped) ? parsed.ungrouped : [];

      if (!parsed.groups && !parsed.ungrouped) {
        if (Array.isArray(data)) {
          incomingUngrouped = data;
        } else {
          const potentialDice = data as Record<string, unknown>;
          if (potentialDice.count && (potentialDice.sides || potentialDice.type)) {
            incomingUngrouped = [potentialDice];
          } else {
            return { success: false, error: "JSON does not match the DM Roller schema (missing 'groups' or 'ungrouped' keys)." };
          }
        }
      }

      // Map to track old IDs to newly generated UUIDs to avoid any collisions
      const idMap = new Map<string, string>();

      const getRegeneratedId = (oldId: string | undefined): string => {
        if (!oldId) return crypto.randomUUID();
        if (!idMap.has(oldId)) {
          idMap.set(oldId, crypto.randomUUID());
        }
        return idMap.get(oldId)!;
      };

      const importedConfigs: DiceConfig[] = [];
      const importedGroups: DiceGroup[] = [];

      // Process ungrouped dice
      incomingUngrouped.forEach((dItem: unknown) => {
        if (!dItem || typeof dItem !== "object") return;
        const d = dItem as Record<string, unknown>;
        const sides = typeof d.sides === "number" ? d.sides : (d.type ? parseInt(String(d.type).replace(/^d/, ""), 10) : undefined);
        const count = typeof d.count === "number" ? d.count : 1;
        if (!sides) return;

        importedConfigs.push({
          id: getRegeneratedId(typeof d.id === "string" ? d.id : undefined),
          name: typeof d.name === "string" ? d.name : `${count}d${sides}`,
          count,
          sides,
          modifier: typeof d.modifier === "number" ? d.modifier : 0,
          explode: (d.explode === "single" || d.explode === "compound") ? d.explode : undefined,
          reroll: d.reroll ? (d.reroll as { type: "once" | "until"; threshold: number }) : undefined,
          rule: d.rule ? (d.rule as { type: "keep" | "drop"; target: "highest" | "lowest"; value: number }) : undefined,
          isEditing: false
        });
      });

      // Process groups
      incomingGroups.forEach((gItem: unknown) => {
        if (!gItem || typeof gItem !== "object") return;
        const g = gItem as Record<string, unknown>;
        
        const gId = crypto.randomUUID(); // Always generate a fresh ID for the group
        const groupDiceIds: string[] = [];

        const diceList = Array.isArray(g.dice) ? g.dice : [];
        diceList.forEach((dItem: unknown) => {
          if (!dItem || typeof dItem !== "object") return;
          const d = dItem as Record<string, unknown>;
          const sides = typeof d.sides === "number" ? d.sides : (d.type ? parseInt(String(d.type).replace(/^d/, ""), 10) : undefined);
          const count = typeof d.count === "number" ? d.count : 1;
          if (!sides) return;

          const newDiceId = getRegeneratedId(typeof d.id === "string" ? d.id : undefined);
          groupDiceIds.push(newDiceId);

          importedConfigs.push({
            id: newDiceId,
            name: typeof d.name === "string" ? d.name : `${count}d${sides}`,
            count,
            sides,
            modifier: typeof d.modifier === "number" ? d.modifier : 0,
            explode: (d.explode === "single" || d.explode === "compound") ? d.explode : undefined,
            reroll: d.reroll ? (d.reroll as { type: "once" | "until"; threshold: number }) : undefined,
            rule: d.rule ? (d.rule as { type: "keep" | "drop"; target: "highest" | "lowest"; value: number }) : undefined,
            isEditing: false
          });
        });

        importedGroups.push({
          id: gId,
          name: typeof g.name === "string" ? g.name : "Imported Group",
          diceIds: groupDiceIds,
          collapsed: typeof g.collapsed === "boolean" ? g.collapsed : false,
          isEditing: false
        });
      });

      if (importedConfigs.length === 0 && importedGroups.length === 0) {
        return { success: false, error: "No valid dice or groups found in the provided JSON." };
      }

      if (mode === "replace") {
        setDiceConfigs(importedConfigs);
        setGroups(importedGroups);
      } else {
        // Merge
        setDiceConfigs((prev) => [...prev, ...importedConfigs]);
        setGroups((prev) => [...prev, ...importedGroups]);
      }

      return { success: true };
    } catch (e: unknown) {
      const errMsg = e instanceof Error ? e.message : "An error occurred during import.";
      return { success: false, error: errMsg };
    }
  };

  const clearAll = () => {
    setDiceConfigs([]);
    setGroups([]);
  };

  return {
    diceConfigs,
    groups,
    addDiceConfig,
    updateDiceConfig,
    deleteDiceConfig,
    addGroup,
    updateGroup,
    deleteGroup,
    toggleGroupCollapse,
    moveDiceToGroup,
    rollConfig,
    rollGroup,
    rollNotation,
    reorderDice: setDiceConfigs,
    reorderGroups: setGroups,
    clearAll,
    importData,
  };
}
