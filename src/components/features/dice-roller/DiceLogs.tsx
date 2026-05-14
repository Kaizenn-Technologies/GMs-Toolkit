import React from "react";
import type { RollLog, RollResult } from "./types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash, Clock } from "@phosphor-icons/react";
import { clsx } from "clsx";

interface DiceLogsProps {
  logs: RollLog[];
  onClear: () => void;
}

export const DiceLogs: React.FC<DiceLogsProps> = ({ logs, onClear }) => {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between py-4 shrink-0">
        <CardTitle className="text-xl font-bold flex items-center gap-2">
          Roll History
        </CardTitle>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClear}
          className="text-muted-foreground hover:text-destructive transition-colors"
        >
          <Trash size={18} className="mr-2" />
          Clear
        </Button>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto px-4 pb-4 space-y-4">
        {logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground opacity-50 py-12">
            <Clock size={48} weight="light" className="mb-2" />
            <p>No rolls yet</p>
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

  return (
    <div className="p-3 rounded-lg bg-muted/30 border border-border/50 space-y-2">
      <div className="flex items-center justify-between text-xs font-medium">
        <span className="text-foreground/80">{log.name || "Roll"}</span>
        <div className="flex items-center gap-2 text-muted-foreground">
          {log.mode !== "normal" && (
            <span className={clsx(
              "px-1.5 py-0.5 rounded text-[10px] uppercase tracking-wider",
              log.mode === "advantage" ? "bg-green-500/10 text-green-500" : "bg-blue-500/10 text-blue-500"
            )}>
              {log.mode}
            </span>
          )}
          <span>{timeString}</span>
        </div>
      </div>

      <div className="space-y-1.5">
        {log.rolls.map((roll, idx) => (
          <RollDetail key={idx} roll={roll} />
        ))}
      </div>

      <div className="pt-1 flex items-center justify-between border-t border-border/50">
        <span className="text-xs font-bold text-muted-foreground uppercase">Total</span>
        <span className="text-lg font-bold text-primary">{log.total}</span>
      </div>
    </div>
  );
};

const RollDetail: React.FC<{ roll: RollResult }> = ({ roll }) => {
  const { config, results, kept, subtotal } = roll;
  
  return (
    <div className="text-sm">
      <div className="flex items-center justify-between">
        <span className="text-muted-foreground text-xs">
          {config.count}d{config.sides}
          {config.modifier ? (config.modifier > 0 ? ` + ${config.modifier}` : ` - ${Math.abs(config.modifier)}`) : ""}
        </span>
        <span className="font-mono font-medium">{subtotal}</span>
      </div>
      <div className="flex flex-wrap gap-1 mt-1">
        {results.map((val, idx) => {
          const isMax = val === config.sides;
          const isMin = val === 1;
          const isKept = kept[idx];

          return (
            <span
              key={idx}
              className={clsx(
                "inline-flex items-center justify-center w-6 h-6 text-[10px] font-bold rounded border",
                isKept ? "bg-background" : "bg-muted/50 text-muted-foreground line-through opacity-50",
                isKept && isMax && "text-green-500 border-green-500/50 bg-green-500/5",
                isKept && isMin && "text-red-500 border-red-500/50 bg-red-500/5",
                isKept && !isMax && !isMin && "border-border/50"
              )}
            >
              {val}
            </span>
          );
        })}
      </div>
      {config.rule && (
        <p className="text-[10px] text-muted-foreground mt-0.5 italic">
          ({config.rule.type} {config.rule.target} {config.rule.value})
        </p>
      )}
    </div>
  );
};
