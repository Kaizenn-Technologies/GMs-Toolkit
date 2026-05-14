import { useState, useEffect } from "react";
import type { DiceConfig, DiceGroup, RollLog, RollResult } from "./types";
import { rollDice } from "./utils";

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
    const cleaned = diceConfigs.map(({ isEditing, ...rest }) => rest);
    localStorage.setItem(PRESETS_KEY, JSON.stringify(cleaned));
  }, [diceConfigs]);

  useEffect(() => {
    const cleaned = groups.map(({ isEditing, ...rest }) => rest);
    localStorage.setItem(GROUPS_KEY, JSON.stringify(cleaned));
  }, [groups]);

  const addDiceConfig = (config: DiceConfig) => {
    setDiceConfigs((prev) => [...prev, { ...config, isEditing: true }]);
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
      isEditing: true,
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

  const moveDiceToGroup = (diceId: string, groupId: string | null) => {
    setGroups((prev) =>
      prev.map((g) => {
        // Remove from all groups first
        const newDiceIds = g.diceIds.filter((id) => id !== diceId);
        // Add to target group
        if (g.id === groupId) {
          newDiceIds.push(diceId);
        }
        return { ...g, diceIds: newDiceIds };
      })
    );
  };

  const rollConfig = (configId: string, mode: "normal" | "advantage" | "disadvantage" = "normal") => {
    const config = diceConfigs.find((c) => c.id === configId);
    if (!config) return;

    let rolls: RollResult[] = [];
    let rejectedRolls: RollResult[] | undefined = undefined;
    let total = 0;

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

    let rolls: RollResult[] = [];
    let rejectedRolls: RollResult[] | undefined = undefined;
    let total = 0;

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
    reorderDice: setDiceConfigs,
    reorderGroups: setGroups,
  };
}
