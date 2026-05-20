import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import type { BreakdownItem } from "@/types";
import { useMemo } from "react";

interface ClassGroup {
  className: string;
  items: { item: BreakdownItem; index: number }[];
}

function groupByClass(items: BreakdownItem[]): ClassGroup[] {
  const groups: ClassGroup[] = [];
  let current: ClassGroup | null = null;

  items.forEach((item, index) => {
    // Label format: "ClassName Level N"
    const match = item.label.match(/^(.+)\s+Level\s+\d+$/i);
    const className = match ? match[1] : "Unknown";

    if (!current || current.className !== className) {
      current = { className, items: [] };
      groups.push(current);
    }
    current.items.push({ item, index });
  });

  return groups;
}

/** Parse a formula like "(12+2+3)" or "7+2-3" into { die, modifiers } */
function parseFormula(formula: string): { die: string; modifiers: string; isMax: boolean } {
  const trimmed = formula.trim();
  const isMax = trimmed.startsWith("(");
  // Strip parens
  const inner = trimmed.replace(/^\(/, "").replace(/\)$/, "");
  // The die is the leading number (possibly negative, though unlikely)
  const dieMatch = inner.match(/^(-?\d+)/);
  const die = dieMatch ? dieMatch[1] : inner;
  const modifiers = inner.slice(die.length); // e.g. "+2+3" or "-3" or "+2-1"
  return { die, modifiers, isMax };
}

/** Split modifier string "+2+3-1" into [{sign:"+", value:"2"}, ...] */
function splitModifiers(mods: string): { sign: string; value: string }[] {
  if (!mods) return [];
  const parts: { sign: string; value: string }[] = [];
  const regex = /([+-])(\d+)/g;
  let m;
  while ((m = regex.exec(mods)) !== null) {
    parts.push({ sign: m[1], value: m[2] });
  }
  return parts;
}

// Deterministic color for each class group
const CLASS_ACCENTS = [
  { dot: "bg-violet-500", tag: "text-violet-400", badge: "bg-violet-500/15 text-violet-400 border-violet-500/25" },
  { dot: "bg-amber-500",  tag: "text-amber-400",  badge: "bg-amber-500/15 text-amber-400 border-amber-500/25"   },
  { dot: "bg-emerald-500", tag: "text-emerald-400", badge: "bg-emerald-500/15 text-emerald-400 border-emerald-500/25" },
  { dot: "bg-rose-500",   tag: "text-rose-400",   badge: "bg-rose-500/15 text-rose-400 border-rose-500/25"     },
  { dot: "bg-sky-500",    tag: "text-sky-400",    badge: "bg-sky-500/15 text-sky-400 border-sky-500/25"       },
];

export function HpBreakdown({ items }: { items: BreakdownItem[] }) {
  const groups = useMemo(() => groupByClass(items), [items]);
  const isMulticlass = groups.length > 1;

  // Per-level HP result
  const levelResults = useMemo(() => {
    return items.map((item) => {
      const match = item.value.match(/=\s*(-?\d+)/);
      return match ? parseInt(match[1], 10) : 0;
    });
  }, [items]);

  // Running total
  const runningTotals = useMemo(() => {
    let sum = 0;
    return levelResults.map((val) => {
      sum += val;
      return sum;
    });
  }, [levelResults]);

  const grandTotal = runningTotals.length > 0 ? runningTotals[runningTotals.length - 1] : 0;

  return (
    <div className="space-y-0">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-1 h-4 bg-primary rounded-full" />
          <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Breakdown
          </span>
        </div>
        <span className="text-[11px] font-mono text-muted-foreground/60">
          {items.length} level{items.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Breakdown rows */}
      <TooltipProvider delay={100}>
        <div className="border border-border/60 divide-y divide-border/40 bg-muted/30">
          {groups.map((group, gIdx) => {
            const accent = CLASS_ACCENTS[gIdx % CLASS_ACCENTS.length];

            return (
              <div key={gIdx} className="divide-y divide-border/20">
                {group.items.map(({ item, index }) => {
                  const eqParts = item.value.split("=");
                  const formula = eqParts.length > 1 ? eqParts.slice(0, -1).join("=").trim() : item.value;
                  const levelNum = item.label.match(/Level\s+(\d+)/)?.[1] ?? `${index + 1}`;
                  const isFirstLevel = index === 0;
                  const levelHP = levelResults[index];

                  // Parse dice vs modifiers
                  const { die, modifiers, isMax } = parseFormula(formula);
                  const modParts = splitModifiers(modifiers);


                  return (
                    <div
                      key={index}
                      className={`
                        group flex items-center gap-0 
                        hover:bg-muted/60 transition-colors duration-150
                        ${isFirstLevel ? "bg-primary/[0.04]" : ""}
                      `}
                    >
                      {/* LEFT: Level HP total — prominent */}
                      <div className={`
                        flex-shrink-0 w-14 flex items-center justify-center self-stretch
                        border-r border-border/40
                        ${isFirstLevel ? "bg-primary/[0.08]" : "bg-muted/40"}
                      `}>
                        <span className={`
                          font-mono text-base font-bold tabular-nums
                          ${isFirstLevel ? "text-primary" : "text-foreground"}
                        `}>
                          {levelHP}
                        </span>
                      </div>

                      {/* MIDDLE: Level info + formula */}
                      <div className="flex-1 min-w-0 flex items-center gap-2 px-3 py-1.5">
                        {/* Level badge */}
                        <div
                          className={`
                            flex-shrink-0 w-6 h-6 flex items-center justify-center
                            text-[10px] font-bold border
                            ${isMulticlass ? accent.badge : "bg-primary/10 text-primary border-primary/20"}
                          `}
                        >
                          {levelNum}
                        </div>

                        {/* Class name — inline, shown on every row */}
                        {isMulticlass && (
                          <div className="flex items-center gap-1.5 flex-shrink-0">
                            <div className={`w-1.5 h-1.5 rounded-full ${accent.dot}`} />
                            <span className={`text-[11px] font-semibold uppercase tracking-wider ${accent.tag}`}>
                              {group.className}
                            </span>
                          </div>
                        )}

                        {/* Formula: dice + modifiers */}
                        <div className="flex-1 min-w-0 text-left font-mono text-xs">
                          <Tooltip>
                            <TooltipTrigger
                              className="
                                inline-flex items-center gap-0 cursor-help
                                border-b border-dashed border-muted-foreground/30
                                hover:border-muted-foreground/60 transition-colors
                              "
                            >
                              {/* Die value — visually distinct */}
                              {isMax && <span className="text-muted-foreground/50">(</span>}
                              <span className="text-foreground font-bold bg-primary/10 px-1 py-px -mx-px">
                                {die}
                              </span>
                              {isMax && <span className="text-muted-foreground/50">)</span>}

                              {/* Modifiers — subdued */}
                              {modParts.map((mod, mIdx) => (
                                <span key={mIdx} className="text-muted-foreground">
                                  <span className="opacity-50">{mod.sign}</span>
                                  <span>{mod.value}</span>
                                </span>
                              ))}
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{item.tooltip}</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>

                        {/* Running total — far right */}
                        <div className="flex-shrink-0 ml-auto pl-2 border-l border-border/30">
                          <span className="font-mono text-[10px] text-muted-foreground/50 tabular-nums">
                            Σ{runningTotals[index]}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}

          {/* Grand total footer */}
          <div className="flex items-center justify-between px-3 py-2 bg-primary/[0.06]">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Total
            </span>
            <span className="font-mono text-sm font-bold text-primary tabular-nums">
              {grandTotal} HP
            </span>
          </div>
        </div>
      </TooltipProvider>
    </div>
  );
}
