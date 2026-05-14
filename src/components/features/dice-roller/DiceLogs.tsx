import React, { useState } from "react";
import type { RollLog, RollResult } from "./types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, Dices, Logs, ChevronDown, ChevronUp } from "lucide-react";
import { clsx } from "clsx";

interface DiceLogsProps {
  logs: RollLog[];
  onClear: () => void;
}

export const DiceLogs: React.FC<DiceLogsProps> = ({ logs, onClear }) => {
  return (
    <Card className="h-full flex flex-col gap-0 py-0 border-border/50 bg-card/30">
      <CardHeader className="flex flex-row items-center justify-between shrink-0 border-b border-border/50 py-3">
        <CardTitle className="text-sm font-bold flex items-center gap-2">
          <Logs size={14} className="text-primary" />
          Roll History
        </CardTitle>
        <Button
          variant="outline"
          size="sm"
          onClick={onClear}
          className="h-7 text-[10px] text-muted-foreground hover:text-destructive transition-colors px-2"
        >
          <Trash2 size={12} className="mr-1.5" />
          Clear
        </Button>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto px-2 py-1 space-y-2 scrollbar-thin scrollbar-thumb-primary/10 hover:scrollbar-thumb-primary/20">
        {logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground opacity-50 py-8">
            <Dices size={32} strokeWidth={1} className="mb-2" />
            <p className="text-[10px] uppercase font-semibold tracking-widest">No rolls yet</p>
          </div>
        ) : (
          logs.map((log) => <LogEntry key={log.id} log={log} />)
        )}
      </CardContent>
    </Card>
  );
};

const LogEntry: React.FC<{ log: RollLog }> = ({ log }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const timeString = new Date(log.timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  const hasAdvDis = log.mode && log.mode !== "normal";

  return (
    <div
      className={clsx(
        "group cursor-pointer rounded border border-border/40 bg-muted/10 transition-all hover:bg-muted/20 overflow-hidden",
        isExpanded && "border-primary/30 bg-primary/5"
      )}
      onClick={() => setIsExpanded(!isExpanded)}
    >
      {/* Compact Header: | [TOTAL] | Name Time | */}
      <div className="flex items-stretch min-h-[40px]">
        {/* Total Box */}
        <div
          className={clsx(
            "flex items-center justify-center min-w-[45px] font-bold text-lg border-r border-border/40 shrink-0 shadow-inner",
            log.mode === "advantage" ? "text-green-500 bg-green-500/10" :
              log.mode === "disadvantage" ? "text-red-500 bg-red-500/10" :
                "text-primary bg-primary/10"
          )}
        >
          {log.total}
        </div>

        {/* Name & Time */}
        <div className="flex-1 flex flex-col justify-center px-3 py-1.5 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-bold uppercase tracking-tight text-foreground/80 truncate">
              {log.name || "Custom Roll"}
            </span>
            <span className="text-[10px] font-medium text-muted-foreground/60 whitespace-nowrap">
              {timeString}
            </span>
          </div>
          {hasAdvDis && (
            <span className={clsx(
              "text-[10px] font-semibold uppercase tracking-widest",
              log.mode === "advantage" ? "text-green-500/70" : "text-red-500/70"
            )}>
              {log.mode}
            </span>
          )}
        </div>

        {/* Chevron */}
        <div className="flex items-center px-2 text-muted-foreground/40 group-hover:text-primary/60 transition-colors">
          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </div>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="border-t border-border/40 bg-background/40 p-3 space-y-2 animate-in fade-in slide-in-from-top-1 duration-200">
          <div className="space-y-2">
            {log.rolls.map((roll, idx) => (
              <div key={idx} className="flex flex-col gap-1 border-b border-border/10 pb-2 last:border-0 last:pb-0">
                <div className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-tight text-muted-foreground/80">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="truncate">{roll.config.name || `Roll ${idx + 1}`}</span>
                    <span className="text-primary/50 font-mono text-[11px]">
                      [{roll.config.count}d{roll.config.sides}{roll.config.modifier ? (roll.config.modifier > 0 ? `+${roll.config.modifier}` : `-${Math.abs(roll.config.modifier)}`) : ""}]
                    </span>
                    <CriteriaBadges config={roll.config} />
                  </div>
                  <span className="text-primary ml-2 shrink-0 text-xs font-bold">= {roll.subtotal}</span>
                </div>

                {/* Table-like row 2: The Rolls */}
                <div className="flex flex-col gap-2 pl-1">
                  <RollSet roll={roll} isRejected={false} />
                  {log.rejectedRolls && log.rejectedRolls[idx] && (
                    <div className="flex items-start gap-2">
                      <span className="text-[9px] font-semibold uppercase text-muted-foreground/40 mt-1 shrink-0">Discarded</span>
                      <RollSet roll={log.rejectedRolls[idx]} isRejected={true} />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const RollSet: React.FC<{ roll: RollResult, isRejected: boolean }> = ({ roll, isRejected }) => {
  return (
    <div className={clsx("flex flex-wrap gap-1", isRejected && "opacity-40 grayscale")}>
      {roll.results.map((val, idx) => {
        const isMax = val === roll.config.sides;
        const isMin = val === 1;
        const isKept = roll.kept[idx];

        return (
          <span
            key={idx}
            className={clsx(
              "inline-flex items-center justify-center min-w-[20px] h-[20px] px-1 text-[10px] font-bold rounded border transition-colors",
              isKept ? "bg-background/80" : "bg-muted/50 text-muted-foreground/50 line-through opacity-30",
              isKept && isMax && "text-green-500 border-green-500/40 bg-green-500/10",
              isKept && isMin && "text-red-500 border-red-500/40 bg-red-500/10",
              isKept && !isMax && !isMin && "border-border/30",
              isRejected && "border-muted-foreground/20"
            )}
          >
            {val}
          </span>
        );
      })}
      {isRejected && <span className="text-[10px] font-semibold ml-1 text-muted-foreground/60">= {roll.subtotal}</span>}
    </div>
  );
};

const CriteriaBadges: React.FC<{ config: any }> = ({ config }) => {
  const { rule, explode, reroll } = config;
  if (!rule && !explode && !reroll) return null;

  return (
    <div className="flex items-center gap-1 ml-1.5 shrink-0">
      {rule && (
        <span className="text-[9px] font-bold uppercase tracking-tighter text-amber-500/80 bg-amber-500/5 px-1 rounded border border-amber-500/20">
          {rule.type} {rule.value} {rule.target}
        </span>
      )}
      {explode && (
        <span className="text-[9px] font-bold uppercase tracking-tighter text-orange-500/80 bg-orange-500/5 px-1 rounded border border-orange-500/20">
          Explode {explode}
        </span>
      )}
      {reroll && (
        <span className="text-[9px] font-bold uppercase tracking-tighter text-blue-500/80 bg-blue-500/5 px-1 rounded border border-blue-500/20">
          Reroll {reroll.threshold}
        </span>
      )}
    </div>
  );
};
