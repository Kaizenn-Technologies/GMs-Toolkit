import React from "react";
import type { RollLog, RollResult } from "./types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, Clock } from "lucide-react";
import { clsx } from "clsx";

interface DiceLogsProps {
  logs: RollLog[];
  onClear: () => void;
}

export const DiceLogs: React.FC<DiceLogsProps> = ({ logs, onClear }) => {
  return (
    <Card className="h-full flex flex-col border-border/50 bg-card/30">
      <CardHeader className="flex flex-row items-center justify-between py-2 px-4 shrink-0 border-b border-border/50">
        <CardTitle className="text-sm font-bold flex items-center gap-2">
          <Clock size={14} className="text-primary" />
          Roll History
        </CardTitle>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClear}
          className="h-7 text-[10px] text-muted-foreground hover:text-destructive transition-colors px-2"
        >
          <Trash2 size={12} className="mr-1.5" />
          Clear
        </Button>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto p-2 space-y-2 scrollbar-thin scrollbar-thumb-primary/10 hover:scrollbar-thumb-primary/20">
        {logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground opacity-50 py-8">
            <Clock size={32} strokeWidth={1} className="mb-2" />
            <p className="text-[10px] uppercase font-bold tracking-widest">No rolls yet</p>
          </div>
        ) : (
          logs.map((log) => <LogEntry key={log.id} log={log} />)
        )}
      </CardContent>
    </Card>
  );
};

const LogEntry: React.FC<{ log: RollLog }> = ({ log }) => {
  const timeString = new Date(log.timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  const hasAdvDis = log.mode && log.mode !== "normal";

  return (
    <div className="p-2 rounded border border-border/40 bg-muted/10 space-y-2">
      {/* Header: Name | Time */}
      <div className="flex items-center justify-between text-[9px] font-bold uppercase tracking-tight text-muted-foreground/60 border-b border-border/20 pb-1">
        <span className="truncate">{log.name || "Custom Roll"}</span>
        <span>{timeString}</span>
      </div>

      <div className="flex gap-3">
        {/* BIG TOTAL [N] */}
        <div 
          className={clsx(
            "flex items-center justify-center min-w-[50px] h-[50px] rounded border-2 font-black text-2xl shadow-inner",
            log.mode === "advantage" ? "border-green-500/50 text-green-500 bg-green-500/5" : 
            log.mode === "disadvantage" ? "border-red-500/50 text-red-500 bg-red-500/5" : 
            "border-primary/20 text-primary bg-primary/5"
          )}
        >
          {log.total}
        </div>

        {/* ROLL DETAILS */}
        <div className="flex-1 min-w-0 space-y-2 py-0.5">
          {log.rolls.map((roll, idx) => (
            <div key={idx} className="space-y-1">
              {/* If Adv/Dis, show BOTH sets if this was a single config roll or if we have rejected rolls */}
              {hasAdvDis && log.rejectedRolls && log.rejectedRolls[idx] ? (
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-[9px] font-bold text-muted-foreground/40 uppercase">
                    <span className="bg-primary/10 px-1 rounded-[2px]">{log.mode}</span>
                    <span>{roll.config.count}d{roll.config.sides}{roll.config.modifier ? (roll.config.modifier > 0 ? `+${roll.config.modifier}` : `-${Math.abs(roll.config.modifier)}`) : ""}</span>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    {/* Picked Set */}
                    <RollSet roll={roll} isRejected={false} />
                    {/* Rejected Set */}
                    <RollSet roll={log.rejectedRolls[idx]} isRejected={true} />
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between gap-2 min-w-0">
                   <div className="flex items-center gap-1.5 min-w-0 overflow-hidden">
                      <span className="text-[10px] font-black text-muted-foreground/80 shrink-0">
                        {roll.config.count}d{roll.config.sides}{roll.config.modifier ? (roll.config.modifier > 0 ? `+${roll.config.modifier}` : `-${Math.abs(roll.config.modifier)}`) : ""}
                      </span>
                      <div className="h-px bg-border/20 flex-1 min-w-[10px]" />
                      <RollSet roll={roll} isRejected={false} />
                   </div>
                   <span className="text-[11px] font-black text-primary shrink-0">
                     = {roll.subtotal}
                   </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const RollSet: React.FC<{ roll: RollResult, isRejected: boolean }> = ({ roll, isRejected }) => {
  return (
    <div className={clsx("flex flex-wrap gap-0.5", isRejected && "opacity-30 grayscale")}>
      {roll.results.map((val, idx) => {
        const isMax = val === roll.config.sides;
        const isMin = val === 1;
        const isKept = roll.kept[idx];

        return (
          <span
            key={idx}
            className={clsx(
              "inline-flex items-center justify-center min-w-[16px] h-[16px] px-0.5 text-[8px] font-bold rounded-none border transition-colors",
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
      {isRejected && <span className="text-[9px] font-black ml-1 text-muted-foreground">= {roll.subtotal}</span>}
    </div>
  );
};
