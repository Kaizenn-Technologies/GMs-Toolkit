import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import type { BreakdownItem } from "@/types";
import { useMemo } from "react";
import { classes } from "@/lib/classes";
import { getTransparentColor } from "@/lib/utils";

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
    const totals: number[] = [];
    let sum = 0;
    for (let i = 0; i < levelResults.length; i++) {
      sum += levelResults[i];
      totals.push(sum);
    }
    return totals;
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
        <span className="text-[11px] font-mono text-muted-foreground">
          {items.length} level{items.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Breakdown rows */}
      <TooltipProvider delay={100}>
        <div className="border border-border/60 divide-y divide-border/40 bg-muted/30">
          {groups.map((group) => {
            const classObj = Object.values(classes).find(
              (c) => c.name.toLowerCase() === group.className.toLowerCase()
            );
            const isCustomClass = group.className.toLowerCase() === "custom";
            const classColor = isCustomClass ? "#9ca3af" : classObj?.color;

            return (
              <div key={group.className} className="divide-y divide-border/20">
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
                      key={item.label}
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
                            ${!classColor ? "bg-primary/10 text-primary border-primary/20" : ""}
                          `}
                          style={
                            classColor
                              ? {
                                backgroundColor: getTransparentColor(classColor, 0.15),
                                borderColor: getTransparentColor(classColor, 0.25),
                                color: classColor,
                              }
                              : undefined
                          }
                        >
                          {levelNum}
                        </div>

                        {/* Class name — inline, shown on every row */}
                        {isMulticlass && (
                          <div className="flex items-center gap-1.5 flex-shrink-0">
                            <div
                              className={`w-1.5 h-1.5 rounded-full ${!classColor ? "bg-primary" : ""}`}
                              style={classColor ? { backgroundColor: classColor } : undefined}
                            />
                            <span
                              className={`text-[11px] font-semibold uppercase tracking-wider ${!classColor ? "text-primary" : ""}`}
                              style={classColor ? { color: classColor } : undefined}
                            >
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
                              {isMax && <span className="text-muted-foreground">(</span>}
                              <span className="text-foreground font-bold bg-primary/10 px-1 py-px -mx-px">
                                {die}
                              </span>
                              {isMax && <span className="text-muted-foreground">)</span>}

                              {/* Modifiers — subdued */}
                              {modParts.map((mod, modSeq) => (
                                <span key={`mod-${modSeq}-${mod.sign}-${mod.value}`} className="text-muted-foreground">
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
                          <span className="font-mono text-[10px] text-muted-foreground tabular-nums">
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
