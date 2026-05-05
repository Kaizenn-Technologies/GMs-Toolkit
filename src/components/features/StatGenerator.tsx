import { useState } from "react";
import { Star, RotateCcw, BookOpen, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { StepperInput } from "@/components/ui/stepper-input";
import { classes, classNames } from "@/lib/classes";
import type { Ability } from "@/types";

// ─── Constants ────────────────────────────────────────────────────────────────

const ABILITIES: Ability[] = [
  "Strength",
  "Dexterity",
  "Constitution",
  "Intelligence",
  "Wisdom",
  "Charisma",
];

const ABILITY_ABBR: Record<Ability, string> = {
  Strength: "STR",
  Dexterity: "DEX",
  Constitution: "CON",
  Intelligence: "INT",
  Wisdom: "WIS",
  Charisma: "CHA",
};

const DEFAULT_SCORE = 8;
const DEFAULT_AVAILABLE_POINTS = 27;
const DEFAULT_MIN = 8;
const DEFAULT_MAX = 15;

// ─── Point-cost helpers ───────────────────────────────────────────────────────

/**
 * Returns the *cumulative* point cost to bring a stat from DEFAULT_MIN (8) to
 * the given score (positive = points spent, negative = points gained).
 *
 * Cost table (relative to 8):
 *   8–13  → 1 pt per increment
 *   14–15 → 2 pt per increment
 *   16–17 → 3 pt per increment  (above default ceiling)
 *   18    → 3 pt per increment
 *
 * Going below 8:
 *   7, 6  → gain 1 pt per decrement
 *   5, 4  → gain 2 pt per decrement
 *   3     → gain 3 pt per decrement
 */
function cumulativeCost(score: number): number {
  let cost = 0;
  if (score >= DEFAULT_MIN) {
    for (let s = DEFAULT_MIN + 1; s <= score; s++) {
      if (s <= 13) cost += 1;
      else if (s <= 15) cost += 2;
      else cost += 3; // 16, 17, 18
    }
  } else {
    for (let s = DEFAULT_MIN - 1; s >= score; s--) {
      if (s >= 6) cost -= 1;
      else if (s >= 4) cost -= 2;
      else cost -= 3; // 3
    }
  }
  return cost;
}

function pointsUsed(scores: Record<Ability, number>): number {
  return ABILITIES.reduce((total, ab) => total + cumulativeCost(scores[ab]), 0);
}

function getModifier(score: number): number {
  return Math.floor((score - 10) / 2);
}

function formatModifier(mod: number): string {
  return mod >= 0 ? `+${mod}` : `${mod}`;
}

// ─── Primary stat helpers ─────────────────────────────────────────────────────

function getPrimaryStats(className: string): Ability[] {
  const entry = Object.values(classes).find((c) => c.name === className);
  if (!entry) return [];
  const ps = entry.primaryStat;
  if (ps.type === "single") return [ps.value];
  if (ps.type === "multiple") return ps.values;
  if (ps.type === "choice") return ps.options;
  return [];
}

// ─── Default scores ───────────────────────────────────────────────────────────

function defaultScores(): Record<Ability, number> {
  return {
    Strength: DEFAULT_SCORE,
    Dexterity: DEFAULT_SCORE,
    Constitution: DEFAULT_SCORE,
    Intelligence: DEFAULT_SCORE,
    Wisdom: DEFAULT_SCORE,
    Charisma: DEFAULT_SCORE,
  };
}

// ─── Component ────────────────────────────────────────────────────────────────

export function StatGenerator() {
  const [selectedClass, setSelectedClass] = useState<string>("Wizard");
  const [scores, setScores] = useState<Record<Ability, number>>(defaultScores());

  const availablePoints = DEFAULT_AVAILABLE_POINTS;
  const spent = pointsUsed(scores);
  const remaining = availablePoints - spent;

  const primaryStats = getPrimaryStats(selectedClass);

  const handleScoreChange = (ability: Ability, newScore: number) => {
    const clampedScore = Math.max(3, Math.min(18, newScore));
    const tentativeScores = { ...scores, [ability]: clampedScore };
    const tentativeSpent = pointsUsed(tentativeScores);

    // Allow if within budget or if we're reducing (giving back points)
    if (tentativeSpent <= availablePoints || clampedScore < scores[ability]) {
      setScores(tentativeScores);
    }
  };

  const handleReset = () => {
    setScores(defaultScores());
  };

  const pointsColor =
    remaining < 0
      ? "text-[#ff3d3d]"
      : remaining === 0
      ? "text-[#00c93cff] dark:text-[#10ff58ff]"
      : "text-foreground";

  return (
    <>
      {/* ── Page Header ── */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">D&amp;D 5.5e Stat Generator</h1>
          <p className="text-muted-foreground">
            Generate ability scores using Point Buy, dice rolls, or the Standard Array.
          </p>
        </div>

        {/* Book + Settings icons */}
        <div className="flex items-center gap-1 mt-1">
          <TooltipProvider delay={100}>
            <Tooltip>
              <TooltipTrigger
                render={
                  <Button variant="ghost" size="icon" disabled>
                    <BookOpen className="w-5 h-5" />
                  </Button>
                }
              />
              <TooltipContent>
                <p>Rules (coming soon)</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger
                render={
                  <Button variant="ghost" size="icon" disabled>
                    <Settings className="w-5 h-5" />
                  </Button>
                }
              />
              <TooltipContent>
                <p>Settings (coming soon)</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {/* ── Main Card with Tabs ── */}
      <Card>
        <CardContent className="pt-2">
          <Tabs defaultValue="pointbuy" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="pointbuy">Point Buy</TabsTrigger>
              <TabsTrigger value="roll">Roll</TabsTrigger>
              <TabsTrigger value="standard">Standard Array</TabsTrigger>
            </TabsList>

            {/* ── POINT BUY TAB ── */}
            <TabsContent value="pointbuy" className="space-y-6">
              {/* Class selector */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <label className="text-sm font-semibold shrink-0 sm:w-28">
                  Select Class:
                </label>
                <div className="flex-1 max-w-xs">
                  <Select
                    value={selectedClass}
                    onValueChange={(val) => val && setSelectedClass(val)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {classNames.map((name) => (
                        <SelectItem key={name} value={name}>
                          {name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {primaryStats.length > 0 && (
                  <p className="text-xs text-muted-foreground">
                    Primary:{" "}
                    <span className="font-semibold text-foreground">
                      {primaryStats.join(" / ")}
                    </span>
                  </p>
                )}
              </div>

              {/* Ability score table */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-separate border-spacing-y-1">
                  <thead>
                    <tr className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      <th className="text-left pb-2 pl-2">Ability</th>
                      <th className="text-center pb-2">Score</th>
                      <th className="text-center pb-2">Total</th>
                      <th className="text-center pb-2">Modifier</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ABILITIES.map((ability) => {
                      const score = scores[ability];
                      const modifier = getModifier(score);
                      const isPrimary = primaryStats.includes(ability);
                      const isAboveMax = score > DEFAULT_MAX;

                      return (
                        <tr
                          key={ability}
                          className={`rounded-md transition-colors ${
                            isPrimary
                              ? "bg-primary/8 dark:bg-primary/10"
                              : "hover:bg-muted/50"
                          }`}
                        >
                          {/* Ability name */}
                          <td className="py-2 pl-3 pr-4 font-medium rounded-l-md">
                            <div className="flex items-center gap-1.5">
                              <span className="hidden sm:inline">{ability}</span>
                              <span className="sm:hidden text-xs font-bold">
                                {ABILITY_ABBR[ability]}
                              </span>
                              {isPrimary && (
                                <TooltipProvider delay={100}>
                                  <Tooltip>
                                    <TooltipTrigger
                                      render={
                                        <span className="cursor-help">
                                          <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                                        </span>
                                      }
                                    />
                                    <TooltipContent>
                                      <p>Primary stat for {selectedClass}</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              )}
                            </div>
                          </td>

                          {/* Stepper */}
                          <td className="py-2 px-2">
                            <div className="flex justify-center">
                              <StepperInput
                                className="rounded-none w-28"
                                value={score}
                                min={3}
                                max={18}
                                onChange={(val) => handleScoreChange(ability, val)}
                              />
                            </div>
                          </td>

                          {/* Total score badge */}
                          <td className="py-2 px-2 text-center">
                            <span
                              className={`inline-block w-10 text-center font-bold text-base ${
                                isAboveMax ? "text-amber-500" : ""
                              }`}
                            >
                              {score}
                            </span>
                          </td>

                          {/* Modifier */}
                          <td className="py-2 pr-3 text-center rounded-r-md">
                            <span
                              className={`inline-block w-10 text-center text-sm font-semibold ${
                                modifier > 0
                                  ? "text-[#00c93cff] dark:text-[#10ff58ff]"
                                  : modifier < 0
                                  ? "text-[#ff3d3d]"
                                  : "text-muted-foreground"
                              }`}
                            >
                              {formatModifier(modifier)}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Footer row: Reset + Points counter */}
              <div className="flex items-center justify-between pt-2 border-t">
                <Button variant="outline" size="sm" onClick={handleReset}>
                  <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
                  Reset
                </Button>

                <div className="text-sm font-medium">
                  Points remaining:{" "}
                  <span className={`font-bold tabular-nums ${pointsColor}`}>
                    {remaining}
                  </span>
                  <span className="text-muted-foreground">
                    /{availablePoints}
                  </span>
                </div>
              </div>

              {remaining < 0 && (
                <p className="text-xs text-[#ff3d3d] text-right -mt-3">
                  Over budget by {Math.abs(remaining)} point{Math.abs(remaining) !== 1 ? "s" : ""}
                </p>
              )}
            </TabsContent>

            {/* ── ROLL TAB (placeholder) ── */}
            <TabsContent value="roll">
              <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-3">
                <span className="text-4xl">🎲</span>
                <p className="text-sm">Rolled stats — coming soon!</p>
              </div>
            </TabsContent>

            {/* ── STANDARD ARRAY TAB (placeholder) ── */}
            <TabsContent value="standard">
              <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-3">
                <span className="text-4xl">📋</span>
                <p className="text-sm">Standard Array — coming soon!</p>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </>
  );
}
