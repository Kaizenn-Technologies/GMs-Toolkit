import React from "react";
import type { RollObject } from "./types";
import { Clock, Sparkles, ShieldAlert, Trash2 } from "lucide-react";

// Pure formatters — use only their parameters and globals, so they belong
// at module scope rather than being rebuilt on every render.
const formatTime = (timestamp: number) => {
  const date = new Date(timestamp);
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  const seconds = date.getSeconds().toString().padStart(2, "0");
  return `${hours}:${minutes}:${seconds}`;
};

const getAdvantageBadge = (state: RollObject["advantageState"]) => {
  if (state === "advantage") {
    return (
      <span className="inline-flex items-center gap-0.5 text-[8px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-indigo-600/10 text-indigo-400 border border-indigo-500/15">
        <Sparkles className="size-2" /> ADV
      </span>
    );
  }
  if (state === "disadvantage") {
    return (
      <span className="inline-flex items-center gap-0.5 text-[8px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-amber-600/10 text-amber-400 border border-amber-500/15">
        <ShieldAlert className="size-2" /> DIS
      </span>
    );
  }
  return null;
};

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
          history.map((roll) => {
            // Border and result text coloring
            let resultColor = "text-primary";
            let borderColor = "border-border/40 hover:border-primary/20";
            if (roll.advantageState === "advantage") {
              resultColor = "text-indigo-400";
              borderColor = "border-indigo-500/10 hover:border-indigo-500/30 hover:bg-indigo-600/5";
            } else if (roll.advantageState === "disadvantage") {
              resultColor = "text-amber-400";
              borderColor = "border-amber-500/10 hover:border-amber-500/30 hover:bg-amber-600/5";
            }

            return (
              <button
                type="button"
                key={roll.id}
                onClick={() => {
                  onSelectRoll(roll);
                  onOpenDetails();
                }}
                className={`
                  w-full text-left bg-card border rounded-xl p-3 flex items-center justify-between
                  cursor-pointer select-none transition-all duration-200 active:scale-[0.99]
                  ${borderColor}
                `}
              >
                {/* Details */}
                <div className="space-y-1 pr-4 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-extrabold text-xs text-foreground truncate max-w-[160px]">
                      {roll.formula}
                    </span>
                    {getAdvantageBadge(roll.advantageState)}
                  </div>
                  <div className="flex items-center gap-1 text-[9px] text-muted-foreground/80 font-medium">
                    <Clock className="size-2.5" />
                    <span>{formatTime(roll.timestamp)}</span>
                    <span className="text-muted-foreground/30">•</span>
                    <span className="truncate max-w-[120px]">
                      Rolls: {roll.rolls.join(", ")}
                    </span>
                  </div>
                </div>

                {/* Big Pill Result */}
                <div className="flex items-center gap-2 pl-2 border-l border-border/40 shrink-0">
                  <div className={`font-mono text-xl font-black ${resultColor}`}>
                    {roll.result}
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
};
