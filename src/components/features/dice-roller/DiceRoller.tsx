import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { useSettings } from "@/contexts/SettingsContext";
import { useDiceLogs } from "./useDiceLogs";
import { useDiceRoller } from "./useDiceRoller";
import { DiceBuilder } from "./DiceBuilder";
import { DiceLogs } from "./DiceLogs";

export const DiceRoller: React.FC = () => {
  const { settings } = useSettings();
  const { logs, addLog, clearLogs } = useDiceLogs();
  const navigate = useNavigate();

  const mountedRef = useRef(false);
  const autoClearLogs = settings.diceRoller.autoClearLogs;
  
  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true;
      if (autoClearLogs) {
        clearLogs();
      }
    }
  }, [autoClearLogs, clearLogs]);

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
    rollNotation,
    reorderDice,
    reorderGroups,
    clearAll,
    importData,
  } = useDiceRoller(addLog);

  const maximizeSpace = settings.sitewide.maximizeSpace;

  return (
    <div className={`flex flex-col ${maximizeSpace ? "h-[calc(100vh-4.5rem)] min-h-[500px]" : "h-[calc(100vh-8rem)] min-h-[600px]"}`}>
      <PageHeader
        title="DM Dice Roller"
        description="Build custom dice sets, organize them into groups, and track your roll history."
      />

      {/* Announcement Pill */}
      <div className="flex justify-center m-2 relative z-10 sm:hidden">
        <button
          type="button"
          onClick={() => navigate('/phone-dice')}
          className="group relative inline-flex items-center gap-2 rounded-full border border-pink-500/30 bg-pink-500/10 px-4 py-1.5 text-sm font-medium text-pink-600 dark:text-pink-400 transition-colors hover:bg-pink-500/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-500"
        >
          <span className="flex size-2 rounded-full bg-pink-500 animate-pulse" />
          Try the new Mobile Dice Roller (Beta)
          <ChevronRight className="ml-1 size-4 transition-transform group-hover:translate-x-1" />
        </button>
      </div>

      <div className={`flex-1 grid grid-cols-1 md:grid-cols-12 ${maximizeSpace ? "gap-1 " : "gap-6 mt-2"} overflow-hidden`}>
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
            onRollNotation={rollNotation}
            onReorderDice={reorderDice}
            onReorderGroups={reorderGroups}
            onClearAll={clearAll}
            settings={settings.diceRoller}
            onImportData={importData}
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
