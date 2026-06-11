import React from "react";
import type { RollObject } from "./types";
import { X, Clock } from "lucide-react";

interface RollSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  roll: RollObject | null;
}

// Pure formatter — uses only its parameter and Date global, so it belongs
// at module scope rather than being rebuilt on every render.
const formatDateTime = (ts: number) => {
  const d = new Date(ts);
  return d.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
};

export const RollSummaryModal: React.FC<RollSummaryModalProps> = ({
  isOpen,
  onClose,
  roll,
}) => {
  if (!isOpen || !roll) return null;

  // Extract label and raw formula
  const match = roll.formula.match(/^(.*?)\s*\((.*?)\)$/);
  const label = match ? match[1] : undefined;
  const rawFormula = match ? match[2] : roll.formula;

  // Determine advantage status layout
  const isAdvantage = roll.advantageState === "advantage";
  const isDisadvantage = roll.advantageState === "disadvantage";
  const hasDiscarded = !!roll.discardedRolls && roll.discardedRolls.length > 0;

  // Attempt to parse the primary dice size from the formula to highlight max values
  let primaryDiceSides = 20; // default
  const matchDice = rawFormula.match(/d(\d+)/i);
  if (matchDice) {
    primaryDiceSides = parseInt(matchDice[1], 10);
  }

  return (
    <div className="absolute inset-0 z-50 flex flex-col justify-end bg-black/75 backdrop-blur-xs select-none">
      {/* Tap outside to close */}
      <div className="flex-1 cursor-default" onClick={onClose} aria-hidden="true" />

      {/* Drawer content */}
      <div className="bg-card border-t border-border rounded-t-3xl max-h-[85%] overflow-y-auto p-2 space-y-6 shadow-2xl relative z-10 animate-in slide-in-from-bottom duration-300 ">

        {/* Header */}
        <div className="flex justify-between items-center border-b p-2">
          <div className="">
            <h2 className="text-sm font-extrabold tracking-tight text-foreground">
              {label || rawFormula}
            </h2>
            <div className="flex items-center gap-1 text-sm text-muted-foreground/60 font-semibold">
              <Clock className="size-3" />
              <span>{formatDateTime(roll.timestamp)}</span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="size-7 bg-muted border border-border flex items-center justify-center cursor-pointer hover:bg-muted/80 active:scale-90 select-none shrink-0"
            aria-label="Close details"
          >
            <X className="size-3.5 text-muted-foreground" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex flex-col items-center gap-5 py-2">

          {/* Large Result Counter */}
          <div className="flex flex-col items-center">
            <div
              className={`
                font-mono text-7xl font-black tracking-tighter leading-none
                ${isAdvantage ? "text-emerald-500" : ""}
                ${isDisadvantage ? "text-red-500" : ""}
                ${roll.advantageState === "none" ? "text-foreground" : ""}
              `}
            >
              {roll.result}
            </div>
          </div>

          {/* Dice Comparison / Breakdown */}
          <div className="w-full border border-border/60 bg-muted/15 rounded-2xl p-4 space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-border/20">
              <span className="text-sm font-bold uppercase tracking-wider text-muted-foreground/60">
                Roll Details
              </span>
              <span className="font-mono text-sm font-extrabold text-muted-foreground/80">
                {rawFormula}
              </span>
            </div>

            {/* Individual Dice Display */}
            <div className="flex flex-col items-center justify-center gap-3 py-2 w-full">
              {hasDiscarded ? (
                <div className="flex flex-col items-center gap-3 w-full">
                  {/* Kept */}
                  <div className="flex flex-col items-center gap-1 w-full">
                    <div className="flex flex-wrap justify-center gap-1.5 w-full">
                      {roll.rolls.map((val, idx) => {
                        const isMax = val === primaryDiceSides;
                        const isMin = val === 1;
                        return (
                          <div
                            key={`kept-${val}-${idx}`}
                            className={`
                              size-9 rounded-lg font-mono text-sm font-extrabold flex items-center justify-center border
                              ${isMax
                                ? "bg-emerald-500/10 border-emerald-500 text-emerald-500 dark:text-emerald-400"
                                : isMin
                                  ? "bg-red-500/10 border-red-500 text-red-500 dark:text-red-400"
                                  : "bg-card border-border/80 text-foreground"
                              }
                            `}
                          >
                            {val}
                          </div>
                        );
                      })}
                    </div>
                    <span className="text-xs pt-1 font-bold uppercase tracking-wider text-muted-foreground/50">
                      Kept Set ({roll.rolls.reduce((a, b) => a + b, 0)})
                    </span>
                  </div>

                  <div className="text-muted-foreground font-black text-md uppercase tracking-widest">vs</div>

                  {/* Discarded */}
                  <div className="flex flex-col items-center gap-1 w-full">
                    <div className="flex flex-wrap justify-center gap-1.5 w-full">
                      {roll.discardedRolls?.map((val, idx) => {
                        const isDark = document.documentElement.classList.contains("dark");
                        return (
                          <div
                            key={`discarded-${val}-${idx}`}
                            className="
                              size-9 rounded-lg font-mono text-sm font-bold flex items-center justify-center border
                              border-red-500/20 text-muted-foreground/35 line-through
                            "
                            style={{
                              backgroundColor: isDark ? "rgba(255, 86, 86, 0.04)" : "rgba(255, 86, 86, 0.08)",
                              backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ff5656' fill-opacity='0.2' fill-rule='evenodd'%3E%3Cpath d='M0 40L40 0H20L0 20M40 40V20L20 40'/%3E%3C/g%3E%3C/svg%3E")`,
                              backgroundSize: '10px 10px'
                            }}
                          >
                            {val}
                          </div>
                        );
                      })}
                    </div>
                    <span className="text-xs pt-1 font-bold uppercase tracking-wider text-muted-foreground/45">
                      Discarded Set ({roll.discardedRolls?.reduce((a, b) => a + b, 0)})
                    </span>
                  </div>
                </div>
              ) : (
                <div className="flex flex-wrap items-center justify-center gap-1.5 max-w-xs w-full">
                  {roll.rolls.map((dieVal, idx) => {
                    const isMax = dieVal === primaryDiceSides;
                    const isMin = dieVal === 1;
                    return (
                      <div
                        key={`roll-${dieVal}-${idx}`}
                        className={`
                          size-9 rounded-lg font-mono text-sm font-bold flex items-center justify-center border
                          ${isMax
                            ? "bg-emerald-500/10 border-emerald-500 text-emerald-500 dark:text-emerald-400"
                            : isMin
                              ? "bg-red-500/10 border-red-500 text-red-500 dark:text-red-400"
                              : "bg-card border-border/80 text-foreground"
                          }
                        `}
                      >
                        {dieVal}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Math breakdown */}
              {/* <div className="text-center font-mono text-xs text-muted-foreground/80 font-medium pt-1">
                {hasDiscarded ? (
                  <>
                    Kept Set ({roll.rolls.reduce((a, b) => a + b, 0)})
                    {roll.modifier !== 0 && ` ${roll.modifier > 0 ? "+" : "-"} ${Math.abs(roll.modifier)} (modifier)`}
                    {` = ${roll.result}`}
                  </>
                ) : (
                  <>
                    ({roll.rolls.join(" + ")})
                    {roll.modifier !== 0 && ` ${roll.modifier > 0 ? "+" : "-"} ${Math.abs(roll.modifier)} (modifier)`}
                    {` = ${roll.result}`}
                  </>
                )}
              </div> */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
