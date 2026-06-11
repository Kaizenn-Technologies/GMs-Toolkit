import React from "react";
import type { RollObject } from "./types";
import { Trash2 } from "lucide-react";
import { clsx } from "clsx";

interface HistoryListProps {
  history: RollObject[];
  onSelectRoll: (roll: RollObject) => void;
  onOpenDetails: () => void;
  onClearHistory: () => void;
}

export const HistoryList: React.FC<HistoryListProps> = ({
  history,
  onSelectRoll,
  onOpenDetails,
  onClearHistory,
}) => {
  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      {/* List Header */}
      <div className="flex justify-between items-center py-2 border-b border-border/40 shrink-0">
        <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60">
          Roll History ({history.length})
        </h3>
        {history.length > 0 && (
          <button
            type="button"
            onClick={() => {
              if (confirm("Are you sure you want to clear your entire roll history?")) {
                onClearHistory();
              }
            }}
            className="
              text-[10px] font-bold text-destructive hover:text-destructive/80 active:scale-95
              flex items-center gap-1 bg-destructive/5 hover:bg-destructive/10 px-2 py-1 rounded
              transition-all duration-200 cursor-pointer select-none
            "
          >
            <Trash2 className="size-3" />
            <span>Clear History</span>
          </button>
        )}
      </div>

      {/* List Content */}
      <div className="flex-1 overflow-y-auto py-2 pr-0.5 space-y-1.5 scrollbar-thin">
        {history.length === 0 ? (
          <div className="text-center py-12 text-xs text-muted-foreground/60 italic">
            Your roll history is empty. Try rolling some dice!
          </div>
        ) : (
          history.map((roll) => (
            <HistoryListEntry
              key={roll.id}
              roll={roll}
              onClick={() => {
                onSelectRoll(roll);
                onOpenDetails();
              }}
            />
          ))
        )}
      </div>
    </div>
  );
};

const HistoryListEntry: React.FC<{ roll: RollObject; onClick: () => void }> = ({ roll, onClick }) => {
  const timeString = new Date(roll.timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <button
      type="button"
      className={clsx(
        "w-full text-left bg-transparent p-0 block focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 group cursor-pointer rounded border border-border/40 bg-muted/10 transition-all hover:bg-muted/20 overflow-hidden active:scale-[0.99]"
      )}
      onClick={onClick}
    >
      {/* Compact Header */}
      <div className="flex items-stretch min-h-[40px]">
        {/* Total Box */}
        <div
          className={clsx(
            "flex items-center justify-center min-w-[45px] font-bold text-lg border-r border-border/40 shrink-0 shadow-inner",
            roll.advantageState === "advantage" ? "text-green-500 bg-green-500/10" :
              roll.advantageState === "disadvantage" ? "text-red-500 bg-red-500/10" :
                "text-primary bg-primary/10"
          )}
        >
          {roll.result}
        </div>

        {/* Name & Time */}
        <div className="flex-1 flex flex-col justify-center px-3 py-1.5 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-bold uppercase tracking-tight text-foreground/80 truncate">
              {roll.formula || "Custom Roll"}
            </span>
            <span className="text-[10px] font-medium text-muted-foreground/60 whitespace-nowrap">
              {timeString}
            </span>
          </div>
          {/* {hasAdvDis && (
            <span className={clsx(
              "text-[10px] font-semibold uppercase tracking-widest",
              roll.advantageState === "advantage" ? "text-green-500/70" : 
              roll.advantageState === "disadvantage" ? "text-red-500/70" : ""
            )}>
              {roll.advantageState}
            </span>
          )} */}
        </div>
      </div>
    </button>
  );
};

