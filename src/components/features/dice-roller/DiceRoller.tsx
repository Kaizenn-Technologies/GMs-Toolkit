import React, { useEffect } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { useSettings } from "@/contexts/SettingsContext";
import { useDiceLogs } from "./useDiceLogs";
import { useDiceRoller } from "./useDiceRoller";
import { DiceBuilder } from "./DiceBuilder";
import { DiceLogs } from "./DiceLogs";

export const DiceRoller: React.FC = () => {
  const { settings } = useSettings();
  const { logs, addLog, clearLogs } = useDiceLogs();

  // Handle auto-clear logs on refresh
  useEffect(() => {
    if (settings.diceRoller.autoClearLogs) {
      clearLogs();
    }
  }, []); // Only on mount

  const {
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
    reorderDice,
    reorderGroups,
    clearAll,
  } = useDiceRoller(addLog);

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] min-h-[600px]">
      <PageHeader
        title="DM Dice Roller"
        description="Build custom dice sets, organize them into groups, and track your roll history."
      />

      <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-6 overflow-hidden mt-4">
        {/* Left: Builder / Presets (60%) */}
        <div className="md:col-span-7 lg:col-span-7 flex flex-col h-full overflow-hidden">
          <DiceBuilder
            diceConfigs={diceConfigs}
            groups={groups}
            onAddDice={addDiceConfig}
            onUpdateDice={updateDiceConfig}
            onDeleteDice={deleteDiceConfig}
            onAddGroup={addGroup}
            onUpdateGroup={updateGroup}
            onDeleteGroup={deleteGroup}
            onToggleGroup={toggleGroupCollapse}
            onMoveDiceToGroup={moveDiceToGroup}
            onRollDice={rollConfig}
            onRollGroup={rollGroup}
            onReorderDice={reorderDice}
            onReorderGroups={reorderGroups}
            onClearAll={clearAll}
            settings={settings.diceRoller}
          />
        </div>

        {/* Right: Roll History (40%) */}
        <div className="md:col-span-5 lg:col-span-5 flex flex-col h-full overflow-hidden">
          <DiceLogs logs={logs} onClear={clearLogs} />
        </div>
      </div>
    </div>
  );
};
