import React from "react";
import { Button } from "@/components/ui/button";
import { CheckSquare, Download, ChevronDown, Copy, Upload } from "lucide-react";
import { clsx } from "clsx";
import type { DiceConfig, DiceGroup as IDiceGroup } from "./types";

export interface DiceBuilderHeaderProps {
  isSelectionMode: boolean;
  toggleSelectionMode: () => void;
  isExportOpen: boolean;
  setIsExportOpen: (open: boolean) => void;
  exportDropdownRef: React.RefObject<HTMLDivElement | null>;
  selectedDiceIds: Set<string>;
  selectedGroupIds: Set<string>;
  groups: IDiceGroup[];
  diceConfigs: DiceConfig[];
  handleExport: (selectedOnly: boolean) => void;
  handleExportToClipboard: () => void;
  setIsImportOpen: (open: boolean) => void;
}

export const DiceBuilderHeader: React.FC<DiceBuilderHeaderProps> = ({
  isSelectionMode,
  toggleSelectionMode,
  isExportOpen,
  setIsExportOpen,
  exportDropdownRef,
  selectedDiceIds,
  selectedGroupIds,
  groups,
  diceConfigs,
  handleExport,
  handleExportToClipboard,
  setIsImportOpen,
}) => {
  return (
    <div className="flex items-center justify-between px-3.5 py-3 border-b border-border/50 bg-muted/20 shrink-0">
      <div className="flex items-center gap-2">
        <p className="text-lg font-bold uppercase tracking-wider text-foreground leading-none m-0">Dice Presets</p>
      </div>
      <div className="flex items-center gap-2">
        {/* Select Mode Toggle */}
        <Button
          variant={isSelectionMode ? "default" : "outline"}
          size="xs"
          onClick={toggleSelectionMode}
          className="h-8 text-[11px] gap-1.5 px-2.5 font-semibold uppercase shrink-0"
        >
          <CheckSquare size={13} />
          <span className="hidden sm:inline">{isSelectionMode ? "Cancel" : "Select"}</span>
        </Button>

        {/* Export Dropdown Trigger */}
        <div className="relative shrink-0" ref={exportDropdownRef}>
          <Button
            variant="outline"
            size="xs"
            onClick={() => setIsExportOpen(!isExportOpen)}
            className="h-8 text-[11px] gap-1.5 px-2.5 font-semibold uppercase"
          >
            <Download size={13} />
            <span className="hidden sm:inline">Export</span>
            <ChevronDown size={12} className={clsx("transition-transform duration-200 hidden sm:inline", isExportOpen && "rotate-180")} />
          </Button>
          {isExportOpen && (
            <div className="absolute right-0 mt-1.5 w-48 bg-card border border-border/80 rounded-md shadow-lg z-50 py-1 animate-in fade-in slide-in-from-top-1 duration-150">
              <button
                type="button"
                onClick={() => {
                  handleExport(true);
                  setIsExportOpen(false);
                }}
                disabled={selectedDiceIds.size === 0 && selectedGroupIds.size === 0}
                className="w-full text-left px-3 py-2 text-xs font-semibold text-foreground hover:bg-muted/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-between"
              >
                Export Selected
                <span className="text-[10px] text-muted-foreground bg-muted/70 px-1.5 py-0.5 rounded-sm">
                  {selectedDiceIds.size + selectedGroupIds.size}
                </span>
              </button>
              <button
                type="button"
                onClick={() => {
                  handleExport(false);
                  setIsExportOpen(false);
                }}
                className="w-full text-left px-3 py-2 text-xs font-semibold text-foreground hover:bg-muted/50 transition-colors flex items-center justify-between"
              >
                Export All
                <span className="text-[10px] text-muted-foreground bg-muted/70 px-1.5 py-0.5 rounded-sm">
                  {diceConfigs.length + groups.length}
                </span>
              </button>
              <hr className="border-border/40 my-1" />
              <button
                type="button"
                onClick={() => {
                  handleExportToClipboard();
                  setIsExportOpen(false);
                }}
                className="w-full text-left px-3 py-2 text-xs font-semibold text-primary hover:bg-primary/5 transition-colors flex items-center gap-1.5"
              >
                <Copy size={12} />
                Copy to Clipboard
              </button>
            </div>
          )}
        </div>

        {/* Import Button */}
        <Button
          variant="outline"
          size="xs"
          onClick={() => setIsImportOpen(true)}
          className="h-8 text-[11px] gap-1.5 px-2.5 font-semibold uppercase hover:border-primary hover:text-primary transition-colors shrink-0"
        >
          <Upload size={13} />
          <span className="hidden sm:inline">Import</span>
        </Button>
      </div>
    </div>
  );
};
