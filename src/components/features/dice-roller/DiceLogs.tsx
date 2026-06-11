import React, { useState } from "react";
import type { RollLog, RollResult, DiceConfig } from "./types";
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
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground/80 py-8">
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
    <button
      type="button"
      className={clsx(
        "w-full text-left bg-transparent p-0 block focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 group cursor-pointer rounded border border-border/40 bg-muted/10 transition-all hover:bg-muted/20 overflow-hidden",
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
                log.mode === "daggerheart" ? (
                  log.daggerheart?.outcome === "critical" ? "text-amber-500 bg-amber-500/20" :
                  log.daggerheart?.outcome === "hope" ? "text-yellow-500 bg-yellow-500/10" :
                  "text-purple-500 bg-purple-500/10"
                ) :
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
          {(hasAdvDis || log.mode === "daggerheart") && (
            <span className={clsx(
              "text-[10px] font-semibold uppercase tracking-widest",
              log.mode === "advantage" ? "text-green-500/70" : 
              log.mode === "disadvantage" ? "text-red-500/70" :
              log.mode === "daggerheart" ? (
                log.daggerheart?.outcome === "critical" ? "text-amber-500" :
                log.daggerheart?.outcome === "hope" ? "text-yellow-500/80" : "text-purple-500/80"
              ) : ""
            )}>
              {log.mode === "daggerheart" ? (
                log.daggerheart?.outcome === "critical" ? "Critical Success!" :
                `with ${log.daggerheart?.outcome}`
              ) : log.mode}
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
            {log.rolls.map((roll, rollSeq) => (
              <div key={`${roll.configId || "roll"}-${rollSeq}`} className="flex flex-col gap-1 border-b border-border/10 pb-2 last:border-0 last:pb-0">
                <div className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-tight text-muted-foreground/80">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="truncate">{roll.config.name || `Roll ${rollSeq + 1}`}</span>
                    <span className="text-primary/50 font-mono text-[11px]">
                      [{roll.config.count}d{roll.config.sides}{roll.config.modifier ? (roll.config.modifier > 0 ? `+${roll.config.modifier}` : `-${Math.abs(roll.config.modifier)}`) : ""}]
                    </span>
                    <CriteriaBadges config={roll.config} />
                  </div>
                  <span className="text-primary ml-2 shrink-0 text-xs font-bold">= {roll.subtotal}</span>
                </div>

                {/* Table-like row 2: The Rolls */}
                <div className="flex flex-col gap-2 pl-1">
                  <RollSet roll={roll} isRejected={false} isDaggerheart={log.mode === "daggerheart"} />
                  {log.rejectedRolls && log.rejectedRolls[rollSeq] && (
                    <div className="flex items-start gap-2">
                      <span className="text-[9px] font-semibold uppercase text-muted-foreground/40 mt-1 shrink-0">Discarded</span>
                      <RollSet roll={log.rejectedRolls[rollSeq]} isRejected={true} />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </button>
  );
};

const RollSet: React.FC<{ roll: RollResult, isRejected: boolean, isDaggerheart?: boolean }> = ({ roll, isRejected, isDaggerheart }) => {
  return (
    <div className={clsx("flex flex-wrap gap-1", isRejected && "opacity-40 grayscale")}>
      {roll.results.map((val, resultSeq) => {
        const isMax = val === roll.config.sides;
        const isMin = val === 1;
        const isKept = roll.kept[resultSeq];

        // Daggerheart coloring: 0 is Hope (Golden), 1 is Fear (Purple)
        const isHopeDie = isDaggerheart && resultSeq === 0;
        const isFearDie = isDaggerheart && resultSeq === 1;

        return (
          <span
            key={`res-${roll.configId || "roll"}-${resultSeq}`}
            className={clsx(
              "inline-flex items-center justify-center min-w-[20px] h-[20px] px-1 text-[10px] font-bold rounded border transition-colors relative",
              isKept ? "bg-background/80" : "text-muted-foreground/50 line-through opacity-60",
              
              // Standard coloring
              !isDaggerheart && isKept && isMax && "text-green-500 border-green-500/40 bg-green-500/10",
              !isDaggerheart && isKept && isMin && "text-red-500 border-red-500/40 bg-red-500/10",
              !isDaggerheart && isKept && !isMax && !isMin && "border-border/30",
              
              // Daggerheart coloring
              isHopeDie && "text-yellow-600 border-yellow-500/50 bg-yellow-500/10 shadow-[0_0_8px_-2px_rgba(234,179,8,0.3)]",
              isFearDie && "text-purple-600 border-purple-500/50 bg-purple-500/10 shadow-[0_0_8px_-2px_rgba(168,85,247,0.3)]",
              
              isRejected && "border-muted-foreground/20"
            )}
            style={!isKept ? {
              backgroundColor: '#222222',
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ff5656' fill-opacity='0.4' fill-rule='evenodd'%3E%3Cpath d='M0 40L40 0H20L0 20M40 40V20L20 40'/%3E%3C/g%3E%3C/svg%3E")`,
              backgroundSize: '12px 12px'
            } : undefined}
          >
            {val}
            {/* {isHopeDie && <span className="absolute -top-2.5 left-0 text-[7px] text-yellow-600/70 font-black">H</span>} */}
            {/* {isFearDie && <span className="absolute -top-2.5 left-0 text-[7px] text-purple-600/70 font-black">F</span>} */}
          </span>
        );
      })}
      {isRejected && <span className="text-[10px] font-semibold ml-1 text-muted-foreground/60">= {roll.subtotal}</span>}
    </div>
  );
};


const CriteriaBadges: React.FC<{ config: DiceConfig }> = ({ config }) => {
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
