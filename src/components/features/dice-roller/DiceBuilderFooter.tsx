/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Zap, Plus, Dices, FolderPlus, Trash2 } from "lucide-react";
import { clsx } from "clsx";

export interface DiceBuilderFooterProps {
  showQuickAdd: boolean;
  setShowQuickAdd: (show: boolean) => void;
  notation: string;
  setNotation: (notation: string) => void;
  error: boolean;
  handleAddManual: () => void;
  handleAddNewQuick: () => void;
  settings: any;
  onRollNotation: (notation: string, name: string, isDaggerheart: boolean, mode: "normal" | "advantage" | "disadvantage") => void;
  handleAddGroupQuick: () => void;
  handleClearAll: () => void;
}

export const DiceBuilderFooter: React.FC<DiceBuilderFooterProps> = ({
  showQuickAdd,
  setShowQuickAdd,
  notation,
  setNotation,
  error,
  handleAddManual,
  handleAddNewQuick,
  settings,
  onRollNotation,
  handleAddGroupQuick,
  handleClearAll,
}) => {
  return (
    <div className="p-3 border-t border-border/50 bg-background/50 shrink-0 space-y-3">
      {showQuickAdd && (
        <div className="flex gap-2 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <Input
            autoFocus
            placeholder="Enter notation (e.g. 2d10+5)"
            className={clsx(
              "h-9 text-xs",
              error && "border-destructive ring-destructive/20"
            )}
            value={notation}
            onChange={(e) => setNotation(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleAddManual();
              if (e.key === 'Escape') setShowQuickAdd(false);
            }}
          />
          <Button size="sm" onClick={() => handleAddManual()} className="h-9 px-4">Add</Button>
        </div>
      )}
      <div className="grid grid-cols-5 gap-2">
        <Button
          variant={showQuickAdd ? "default" : "secondary"}
          className="gap-2 h-10 px-0 flex-row py-1 text-[11px]"
          onClick={() => setShowQuickAdd(!showQuickAdd)}
        >
          <Zap size={14} />
          Quick
        </Button>
        <Button variant="secondary" className="gap-2 h-10 px-0 flex-row py-1 text-[11px]" onClick={handleAddNewQuick}>
          <Plus size={14} />
          Dice
        </Button>
        <Button
          variant="default"
          className="gap-2 h-10 px-0 flex-row py-1 text-[11px]"
          onClick={(e) => {
            const mode = e.ctrlKey || e.metaKey ? "advantage" : e.shiftKey ? "disadvantage" : "normal";
            if (settings.daggerheartMode) {
              onRollNotation("2d12", "Hope & Fear Roll", true, mode);
            } else {
              onRollNotation("1d20", "Quick D20 Roll", false, mode);
            }
          }}
        >
          <Dices size={14} />
          {settings.daggerheartMode ? "DH Roll" : "D20"}
        </Button>
        <Button variant="secondary" className="gap-2 h-10 px-0 flex-row py-1 text-[11px]" onClick={handleAddGroupQuick}>
          <FolderPlus size={14} />
          Group
        </Button>
        <Button
          variant="outline"
          className="gap-2 h-10 px-0 flex-row py-1 text-[11px] text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-500/10 border-red-500/20"
          onClick={handleClearAll}
        >
          <Trash2 size={14} />
          Clear
        </Button>
      </div>
    </div>
  );
};
