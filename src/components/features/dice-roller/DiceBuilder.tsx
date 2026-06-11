/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useRef, useEffect, useReducer } from "react";
import type { DiceConfig, DiceGroup as IDiceGroup } from "./types";
import { parseDiceNotation } from "./utils";
import { ImportModal } from "./ImportModal";
import { DiceBuilderHeader } from "./DiceBuilderHeader";
import { DiceBuilderFooter } from "./DiceBuilderFooter";
import { DiceBuilderPresets } from "./DiceBuilderPresets";

interface DiceBuilderProps {
  diceConfigs: DiceConfig[];
  groups: IDiceGroup[];
  onAddDice: (config: DiceConfig) => void;
  onUpdateDice: (id: string, updates: Partial<DiceConfig>) => void;
  onDeleteDice: (id: string) => void;
  onAddGroup: (name: string) => void;
  onUpdateGroup: (id: string, updates: Partial<IDiceGroup>) => void;
  onDeleteGroup: (id: string) => void;
  onToggleGroup: (id: string) => void;
  onMoveDiceToGroup: (diceId: string, groupId: string | null, position?: number) => void;
  onRollDice: (id: string, mode: "normal" | "advantage" | "disadvantage") => void;
  onRollGroup: (id: string, mode: "normal" | "advantage" | "disadvantage") => void;
  onRollNotation: (notation: string, name?: string, isDaggerheart?: boolean, mode?: "normal" | "advantage" | "disadvantage") => void;

  onReorderDice: (dice: DiceConfig[]) => void;
  onReorderGroups: (groups: IDiceGroup[]) => void;
  onClearAll: () => void;
  settings: { manualNotation: boolean; daggerheartMode: boolean };
  onImportData: (data: unknown, mode: "merge" | "replace") => { success: boolean; error?: string };
}



export const DiceBuilder: React.FC<DiceBuilderProps> = ({
  diceConfigs,
  groups,
  onAddDice,
  onUpdateDice,
  onDeleteDice,
  onAddGroup,
  onUpdateGroup,
  onDeleteGroup,
  onToggleGroup,
  onMoveDiceToGroup,
  onRollDice,
  onRollGroup,
  onRollNotation,
  onReorderDice,
  onReorderGroups,
  onClearAll,
  settings,
  onImportData,
}) => {
  const [state, dispatch] = useReducer((s: any, a: any) => ({ ...s, ...a }), {
    notation: "",
    error: false,
    showQuickAdd: false,
    activeId: null as string | null,
    isSelectionMode: false,
    selectedDiceIds: new Set<string>(),
    selectedGroupIds: new Set<string>(),
    isExportOpen: false,
    isImportOpen: false,
  });

  const { notation, error, showQuickAdd, activeId, isSelectionMode, selectedDiceIds, selectedGroupIds, isExportOpen, isImportOpen } = state;

  const setNotation = (notation: string) => dispatch({ notation });
  const setError = (error: boolean) => dispatch({ error });
  const setShowQuickAdd = (showQuickAdd: boolean) => dispatch({ showQuickAdd });
  const setActiveId = (activeId: string | null) => dispatch({ activeId });
  const setIsSelectionMode = (isSelectionMode: boolean) => dispatch({ isSelectionMode });
  const setSelectedDiceIds = (selectedDiceIds: Set<string> | ((prev: Set<string>) => Set<string>)) => {
    dispatch({ selectedDiceIds: typeof selectedDiceIds === 'function' ? selectedDiceIds(state.selectedDiceIds) : selectedDiceIds });
  };
  const setSelectedGroupIds = (selectedGroupIds: Set<string> | ((prev: Set<string>) => Set<string>)) => {
    dispatch({ selectedGroupIds: typeof selectedGroupIds === 'function' ? selectedGroupIds(state.selectedGroupIds) : selectedGroupIds });
  };
  const setIsExportOpen = (isExportOpen: boolean) => dispatch({ isExportOpen });
  const setIsImportOpen = (isImportOpen: boolean) => dispatch({ isImportOpen });

  const exportDropdownRef = useRef<HTMLDivElement>(null);

  // Click outside listener for Export Dropdown
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (exportDropdownRef.current && !exportDropdownRef.current.contains(e.target as Node)) {
        setIsExportOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const handleSelectDice = (diceId: string, checked: boolean) => {
    setSelectedDiceIds((prev) => {
      const next = new Set(prev);
      if (checked) next.add(diceId);
      else next.delete(diceId);
      return next;
    });
  };

  const handleSelectGroup = (groupId: string, checked: boolean) => {
    setSelectedGroupIds((prev) => {
      const next = new Set(prev);
      if (checked) next.add(groupId);
      else next.delete(groupId);
      return next;
    });

    const group = groups.find((g) => g.id === groupId);
    if (group) {
      setSelectedDiceIds((prev) => {
        const next = new Set(prev);
        group.diceIds.forEach((id) => {
          if (checked) next.add(id);
          else next.delete(id);
        });
        return next;
      });
    }
  };

  const toggleSelectionMode = () => {
    setIsSelectionMode(!isSelectionMode);
    setSelectedDiceIds(new Set());
    setSelectedGroupIds(new Set());
  };

  const handleExport = (selectedOnly: boolean) => {
    const exportedGroups: unknown[] = [];
    let exportedUngrouped: unknown[];

    if (selectedOnly) {
      groups.forEach((g) => {
        const isGroupSelected = selectedGroupIds.has(g.id);
        const selectedDiceInGroup = g.diceIds.filter((id) => selectedDiceIds.has(id));

        if (isGroupSelected || selectedDiceInGroup.length > 0) {
          const diceToExport = isGroupSelected ? g.diceIds : selectedDiceInGroup;
          exportedGroups.push({
            id: g.id,
            name: g.name,
            collapsed: g.collapsed,
            dice: diceToExport
              .flatMap((dId, idx) => {
                const c = diceConfigs.find((config) => config.id === dId);
                return c ? [{ ...c, position: idx }] : [];
              }),
          });
        }
      });

      const ungroupedDice = diceConfigs.filter(
        (c) => !groups.some((g) => g.diceIds.includes(c.id))
      );
      const selectedUngrouped = ungroupedDice.filter((d) => selectedDiceIds.has(d.id));
      exportedUngrouped = selectedUngrouped.map((d, idx) => ({ ...d, position: idx }));
    } else {
      groups.forEach((g) => {
        exportedGroups.push({
          id: g.id,
          name: g.name,
          collapsed: g.collapsed,
          dice: g.diceIds
            .flatMap((dId, idx) => {
              const c = diceConfigs.find((config) => config.id === dId);
              return c ? [{ ...c, position: idx }] : [];
            }),
        });
      });

      const ungroupedDice = diceConfigs.filter(
        (c) => !groups.some((g) => g.diceIds.includes(c.id))
      );
      exportedUngrouped = ungroupedDice.map((d, idx) => ({ ...d, position: idx }));
    }

    const dataStr = JSON.stringify({ version: "1.0.0", groups: exportedGroups, ungrouped: exportedUngrouped }, null, 2);
    const dataUri = "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);

    const exportFileDefaultName = selectedOnly ? "selected-dice-presets.json" : "all-dice-presets.json";

    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", exportFileDefaultName);
    linkElement.click();
  };

  const handleExportToClipboard = () => {
    const exportedGroups = groups.map((g) => ({
      id: g.id,
      name: g.name,
      collapsed: g.collapsed,
      dice: g.diceIds
        .flatMap((dId, idx) => {
          const c = diceConfigs.find((config) => config.id === dId);
          return c ? [{ ...c, position: idx }] : [];
        }),
    }));

    const ungroupedDice = diceConfigs.filter(
      (c) => !groups.some((g) => g.diceIds.includes(c.id))
    );
    const exportedUngrouped = ungroupedDice.map((d, idx) => ({ ...d, position: idx }));

    const dataStr = JSON.stringify({ version: "1.0.0", groups: exportedGroups, ungrouped: exportedUngrouped }, null, 2);
    navigator.clipboard.writeText(dataStr);
    alert("Configurations copied to clipboard successfully!");
  };

  const handleAddManual = (val?: string) => {
    const textToAdd = val || notation;
    const config = parseDiceNotation(textToAdd);
    if (config.count && config.sides) {
      onAddDice(config as DiceConfig);
      setNotation("");
      setShowQuickAdd(false);
      setError(false);
    } else {
      setError(true);
      setTimeout(() => setError(false), 2000);
    }
  };

  const handleAddNewQuick = () => {
    onAddDice({
      id: crypto.randomUUID(),
      count: 1,
      sides: 20,
      modifier: 0,
    });
  };

  const handleAddGroupQuick = () => {
    onAddGroup("New Group");
  };

  const handleClearAll = () => {
    if (window.confirm("Are you sure you want to clear all dice presets and groups? This action cannot be undone.")) {
      onClearAll();
    }
  };

  return (

    <div className="flex flex-col h-full overflow-hidden border border-border/50 rounded-xl bg-card/30">
      <DiceBuilderHeader
        isSelectionMode={isSelectionMode}
        toggleSelectionMode={toggleSelectionMode}
        isExportOpen={isExportOpen}
        setIsExportOpen={setIsExportOpen}
        exportDropdownRef={exportDropdownRef}
        selectedDiceIds={selectedDiceIds}
        selectedGroupIds={selectedGroupIds}
        groups={groups}
        diceConfigs={diceConfigs}
        handleExport={handleExport}
        handleExportToClipboard={handleExportToClipboard}
        setIsImportOpen={setIsImportOpen}
      />

      <DiceBuilderPresets
        groups={groups}
        diceConfigs={diceConfigs}
        activeId={activeId}
        setActiveId={setActiveId}
        isSelectionMode={isSelectionMode}
        selectedGroupIds={selectedGroupIds}
        selectedDiceIds={selectedDiceIds}
        onToggleGroup={onToggleGroup}
        onDeleteGroup={onDeleteGroup}
        onUpdateGroup={onUpdateGroup}
        onRollGroup={onRollGroup}
        onUpdateDice={onUpdateDice}
        onDeleteDice={onDeleteDice}
        onRollDice={onRollDice}
        handleSelectGroup={handleSelectGroup}
        handleSelectDice={handleSelectDice}
        onReorderGroups={onReorderGroups}
        onMoveDiceToGroup={onMoveDiceToGroup}
        onReorderDice={onReorderDice}
      />

      <DiceBuilderFooter
        showQuickAdd={showQuickAdd}
        setShowQuickAdd={setShowQuickAdd}
        notation={notation}
        setNotation={setNotation}
        error={error}
        handleAddManual={handleAddManual}
        handleAddNewQuick={handleAddNewQuick}
        settings={settings}
        onRollNotation={onRollNotation}
        handleAddGroupQuick={handleAddGroupQuick}
        handleClearAll={handleClearAll}
      />

      <ImportModal
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        onImport={onImportData}
      />
    </div>
  );
};


