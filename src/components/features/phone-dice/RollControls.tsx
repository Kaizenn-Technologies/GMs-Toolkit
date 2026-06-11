import React from "react";
import { Plus } from "lucide-react";

interface RollControlsProps {
  advantageState: "none" | "advantage" | "disadvantage";
  setAdvantageState: (state: "none" | "advantage" | "disadvantage") => void;
  isRolling: boolean;
  onOpenAddPreset: () => void;
  dicePoolEnabled: boolean;
  setDicePoolEnabled: (enabled: boolean) => void;
}

export const RollControls: React.FC<RollControlsProps> = ({
  advantageState,
  setAdvantageState,
  isRolling,
  onOpenAddPreset,
  dicePoolEnabled,
  setDicePoolEnabled,
}) => {
  const toggleAdvantage = () => {
    if (isRolling) return;
    setAdvantageState(advantageState === "advantage" ? "none" : "advantage");
  };

  const toggleDisadvantage = () => {
    if (isRolling) return;
    setAdvantageState(advantageState === "disadvantage" ? "none" : "disadvantage");
  };

  return (
    <div className="flex gap-2 w-full my-1 justify-between items-center">
      {/* Advantage Button (Green) */}
      <button
        type="button"
        onClick={toggleAdvantage}
        disabled={isRolling}
        className={`
          flex-1 h-9 px-2 rounded-none border-2 font-bold text-xs select-none cursor-pointer
          flex items-center justify-center transition-all duration-200 active:scale-95
          ${
            advantageState === "advantage"
              ? "bg-emerald-600 border-emerald-500 text-white shadow-md shadow-emerald-600/20"
              : "bg-card border-border/80 text-muted-foreground hover:text-foreground hover:bg-muted/30"
          }
          disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100
        `}
      >
        Advantage
      </button>

      {/* Disadvantage Button (Red) */}
      <button
        type="button"
        onClick={toggleDisadvantage}
        disabled={isRolling}
        className={`
          flex-1 h-9 px-2 rounded-none border-2 font-bold text-xs select-none cursor-pointer
          flex items-center justify-center transition-all duration-200 active:scale-95
          ${
            advantageState === "disadvantage"
              ? "bg-red-600 border-red-500 text-white shadow-md shadow-red-600/20"
              : "bg-card border-border/80 text-muted-foreground hover:text-foreground hover:bg-muted/30"
          }
          disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100
        `}
      >
        Disadvantage
      </button>

      {/* Dice Pool Toggle Button (⠿) */}
      <button
        type="button"
        onClick={() => setDicePoolEnabled(!dicePoolEnabled)}
        disabled={isRolling}
        className={`
          h-9 w-9 rounded-none border-2 font-black text-base select-none cursor-pointer
          flex items-center justify-center transition-all duration-200 active:scale-95 shrink-0
          ${
            dicePoolEnabled
              ? "bg-primary border-primary text-primary-foreground shadow-md shadow-primary/25"
              : "bg-card border-border/80 text-muted-foreground hover:text-foreground hover:bg-muted/30"
          }
          disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100
        `}
        title="Toggle Dice Pool Builder"
        aria-label="Toggle dice pool builder"
      >
        ⠿
      </button>

      {/* Add Preset Button */}
      <button
        type="button"
        onClick={onOpenAddPreset}
        disabled={isRolling}
        className="
          size-9 rounded-none border-2 border-border/80 bg-card hover:bg-muted/30 text-foreground
          flex items-center justify-center cursor-pointer transition-all duration-200 active:scale-95 select-none
          disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100 shrink-0
        "
        title="Add Custom Preset"
        aria-label="Add custom preset"
      >
        <Plus className="size-4" />
      </button>
    </div>
  );
};
