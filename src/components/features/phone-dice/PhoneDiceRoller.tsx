import React, { useState, useRef, useEffect } from "react";
import { usePhoneDiceRoller } from "./usePhoneDiceRoller";
import { OutcomesRow } from "./OutcomesRow";
import { RollSummary } from "./RollSummary";
import { RollControls } from "./RollControls";
import { DiceRow } from "./DiceRow";
import { PresetsList } from "./PresetsList";
import { HistoryList } from "./HistoryList";
import { PresetModal } from "./PresetModal";
import { RollSummaryModal } from "./RollSummaryModal";
import { RollerTabNav } from "./RollerTabNav";
import { DicePoolBar } from "./DicePoolBar";
import { playRollSound } from "./playRollSound";
import type { DicePreset } from "./types";
import { useSettings } from "@/contexts/SettingsContext";

export const PhoneDiceRoller: React.FC = () => {
  const { settings } = useSettings();
  const rollingAnimation = settings.diceRoller.rollingAnimation;
  const soundEnabled = settings.diceRoller.soundEnabled;

  const {
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
  } = usePhoneDiceRoller(rollingAnimation);

  // Navigation tab state: 'roller' | 'history'
  const [activeTab, setActiveTab] = useState<"roller" | "history">("roller");

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Scroll roller tab container to top immediately when a roll is triggered
  useEffect(() => {
    if (isRolling && scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  }, [isRolling]);

  // Modal open states
  const [isPresetModalOpen, setIsPresetModalOpen] = useState(false);
  const [presetToEdit, setPresetToEdit] = useState<DicePreset | null>(null);
  
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  const handleRoll = (formula: string, label?: string) => {
    playRollSound(soundEnabled);
    rollDice(formula, label);
  };

  const handleOpenEditPreset = (preset: DicePreset) => {
    setPresetToEdit(preset);
    setIsPresetModalOpen(true);
  };

  const handleOpenAddPreset = () => {
    setPresetToEdit(null);
    setIsPresetModalOpen(true);
  };

  const handleSavePreset = (name: string, formula: string, icon?: DicePreset["icon"]) => {
    if (presetToEdit) {
      updatePreset(presetToEdit.id, name, formula, icon);
    } else {
      addPreset(name, formula, icon);
    }
  };

  const handleDeletePreset = () => {
    if (presetToEdit) {
      deletePreset(presetToEdit.id);
    }
  };

  return (
    <div className="w-full h-[calc(100vh-4.5rem)] md:h-[calc(100vh-6rem)] flex flex-col bg-background select-none max-w-md mx-auto relative overflow-hidden">
      
      {/* Sliding Navigation Tabs */}
      <RollerTabNav activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Tab Contents Viewport */}
      <div className="flex-1 overflow-hidden flex flex-col relative bg-muted/5">
        {activeTab === "roller" ? (
          <div ref={scrollContainerRef} className="flex-1 overflow-y-auto py-2 space-y-2.5 scrollbar-thin">
            
            {/* Outcomes Horizontal Scroll */}
            <OutcomesRow
              history={rollHistory}
              activeRoll={activeRoll}
              onSelectRoll={selectRoll}
              onOpenSummary={() => setIsDetailsModalOpen(true)}
            />

            {/* Current Roll Summary Card */}
            <RollSummary
              activeRoll={activeRoll}
              isRolling={isRolling}
              onOpenDetails={() => setIsDetailsModalOpen(true)}
            />

             {/* Advantage / Disadvantage controls & preset addition */}
            <RollControls
              advantageState={advantageState}
              setAdvantageState={setAdvantageState}
              isRolling={isRolling}
              onOpenAddPreset={handleOpenAddPreset}
              dicePoolEnabled={dicePoolEnabled}
              setDicePoolEnabled={setDicePoolEnabled}
            />

            {/* Dice Pool Draft Bar */}
            {dicePoolEnabled && (
              <DicePoolBar
                activePool={activePool}
                removeFromPool={removeFromPool}
                clearPool={clearPool}
                onRollPool={() => {
                  playRollSound(soundEnabled);
                  rollPool();
                }}
              />
            )}

            {/* Standard Dice Grid */}
            <DiceRow
              onAddDie={(sides) => {
                if (dicePoolEnabled) {
                  addToPool(sides);
                } else {
                  handleRoll(`1d${sides}`);
                }
              }}
              isRolling={isRolling}
            />

            {/* Custom Presets Grid */}
            <PresetsList
              presets={presets}
              onRoll={handleRoll}
              onEditPreset={handleOpenEditPreset}
              isRolling={isRolling}
            />

          </div>
        ) : (
          <div className="flex-1 overflow-hidden py-2">
            {/* Full History vertical listing */}
            <HistoryList
              history={rollHistory}
              onSelectRoll={selectRoll}
              onOpenDetails={() => setIsDetailsModalOpen(true)}
              onClearHistory={clearHistory}
            />
          </div>
        )}

        {/* Overlays / Modals rendered inside the phone wrapper (absolute overlay drawer style) */}
        
        {isPresetModalOpen && (
          <PresetModal
            key={presetToEdit ? presetToEdit.id : "new-preset"}
            isOpen={isPresetModalOpen}
            onClose={() => setIsPresetModalOpen(false)}
            onSave={handleSavePreset}
            onDelete={handleDeletePreset}
            presetToEdit={presetToEdit}
          />
        )}

        <RollSummaryModal
          isOpen={isDetailsModalOpen}
          onClose={() => setIsDetailsModalOpen(false)}
          roll={activeRoll}
        />
      </div>
    </div>
  );
};
