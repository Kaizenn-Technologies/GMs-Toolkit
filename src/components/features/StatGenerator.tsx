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
import { backgrounds, backgroundNames } from "@/lib/backgrounds";
import type { Ability } from "@/types";
import {
  SettingsProvider,
  SettingsOverlay,
  useSettings,
} from "@/components/features/SettingsOverlay";

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

const BG_BONUS_MAX = 2;

// ─── Point-cost helpers ───────────────────────────────────────────────────────

/**
 * Returns the *cumulative* point cost to bring a stat from minPurchasable to
 * the given score (positive = points spent, negative = points gained).
 *
 * Cost table (relative to minPurchasable):
 *   +0–+5  → 1 pt per increment
 *   +6–+7  → 2 pt per increment  (i.e., scores 14–15 when min=8)
 *   +8+    → 3 pt per increment
 *
 * Going below minPurchasable:
 *   -1, -2 → gain 1 pt per decrement
 *   -3, -4 → gain 2 pt per decrement
 *   -5+    → gain 3 pt per decrement
 */
function cumulativeCost(score: number, minPurchasable: number): number {
  let cost = 0;
  if (score >= minPurchasable) {
    for (let s = minPurchasable + 1; s <= score; s++) {
      const delta = s - minPurchasable;
      if (delta <= 5) cost += 1;
      else if (delta <= 7) cost += 2;
      else cost += 3;
    }
  } else {
    for (let s = minPurchasable - 1; s >= score; s--) {
      const delta = minPurchasable - s;
      if (delta <= 2) cost -= 1;
      else if (delta <= 4) cost -= 2;
      else cost -= 3;
    }
  }
  return cost;
}

function pointsUsed(
  scores: Record<Ability, number>,
  minPurchasable: number,
): number {
  return ABILITIES.reduce(
    (total, ab) => total + cumulativeCost(scores[ab], minPurchasable),
    0,
  );
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

// ─── Background helpers ───────────────────────────────────────────────────────

function getBackgroundByName(name: string) {
  return Object.values(backgrounds).find((b) => b.name === name) ?? null;
}

function getBackgroundAbilities(bgName: string): Ability[] {
  return getBackgroundByName(bgName)?.abilityScores ?? [];
}

// ─── Default scores ───────────────────────────────────────────────────────────

function makeDefaultScores(defaultScore: number): Record<Ability, number> {
  return {
    Strength: defaultScore,
    Dexterity: defaultScore,
    Constitution: defaultScore,
    Intelligence: defaultScore,
    Wisdom: defaultScore,
    Charisma: defaultScore,
  };
}

function defaultBgBonuses(): Record<Ability, number> {
  return {
    Strength: 0,
    Dexterity: 0,
    Constitution: 0,
    Intelligence: 0,
    Wisdom: 0,
    Charisma: 0,
  };
}

// ─── Inner component (consumes settings context) ──────────────────────────────

function StatGeneratorInner() {
  const { settings, openSettings } = useSettings();
  const pb = settings.pointBuy;

  const {
    pointPool,
    maxPurchasable,
    minPurchasable,
    bgBonusPool,
    enforceAsiFromBackground,
  } = pb;

  const [selectedClass, setSelectedClass] = useState<string>("Wizard");
  const [selectedBackground, setSelectedBackground] = useState<string>("Sage");
  const [scores, setScores] = useState<Record<Ability, number>>(
    makeDefaultScores(minPurchasable),
  );
  const [bgBonuses, setBgBonuses] = useState<Record<Ability, number>>(
    defaultBgBonuses(),
  );

  const spent = pointsUsed(scores, minPurchasable);
  const remaining = pointPool - spent;

  const primaryStats = getPrimaryStats(selectedClass);
  const bgAbilities = getBackgroundAbilities(selectedBackground);

  const bgBonusSpent = ABILITIES.reduce((sum, ab) => sum + bgBonuses[ab], 0);
  const bgBonusRemaining = bgBonusPool - bgBonusSpent;

  // Clamp scores to current settings whenever they change
  const clampedMax = Math.max(minPurchasable, maxPurchasable);
  const clampedMin = Math.min(minPurchasable, maxPurchasable);

  const handleScoreChange = (ability: Ability, newScore: number) => {
    const clamped = Math.max(3, Math.min(18, newScore));
    const tentativeScores = { ...scores, [ability]: clamped };
    const tentativeSpent = pointsUsed(tentativeScores, minPurchasable);

    if (tentativeSpent <= pointPool || clamped < scores[ability]) {
      setScores(tentativeScores);
    }
  };

  const handleBgBonusChange = (ability: Ability, newVal: number) => {
    const clamped = Math.max(0, Math.min(BG_BONUS_MAX, newVal));
    const tentativeBonuses = { ...bgBonuses, [ability]: clamped };
    const tentativeSpent = ABILITIES.reduce(
      (sum, ab) => sum + tentativeBonuses[ab],
      0,
    );

    if (tentativeSpent <= bgBonusPool || clamped < bgBonuses[ability]) {
      setBgBonuses(tentativeBonuses);
    }
  };

  const handleReset = () => {
    setScores(makeDefaultScores(minPurchasable));
    setBgBonuses(defaultBgBonuses());
  };

  const handleBackgroundChange = (val: string) => {
    if (!val) return;
    setSelectedBackground(val);
    setBgBonuses(defaultBgBonuses());
  };

  const pointsColor =
    remaining < 0
      ? "text-[#ff3d3d]"
      : remaining === 0
        ? "text-[#00c93cff] dark:text-[#10ff58ff]"
        : "text-foreground";

  const bgPoolColor =
    bgBonusRemaining < 0
      ? "text-[#ff3d3d]"
      : bgBonusRemaining === 0
        ? "text-[#00c93cff] dark:text-[#10ff58ff]"
        : "text-foreground";

  return (
    <>
      {/* ── Page Header ── */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">D&D 5.5e Stat Generator</h1>
          <p className="text-muted-foreground">
            Generate ability scores using Point Buy, dice rolls, or the Standard
            Array.
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
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Open settings"
                    onClick={openSettings}
                  >
                    <Settings className="w-5 h-5" />
                  </Button>
                }
              />
              <TooltipContent>
                <p>Settings</p>
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
              {/* Class + Background selectors */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 flex-wrap">
                {/* Class */}
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

                {/* Background */}
                <label className="text-sm font-semibold shrink-0">
                  Background:
                </label>
                <div className="flex-1 max-w-xs">
                  <Select
                    value={selectedBackground}
                    onValueChange={handleBackgroundChange}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {backgroundNames.map((name) => (
                        <SelectItem key={name} value={name}>
                          {name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {primaryStats.length > 0 && (
                  <p className="text-xs text-muted-foreground sm:ml-auto">
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
                      <th className="text-center pb-2">
                        <TooltipProvider delay={100}>
                          <Tooltip>
                            <TooltipTrigger
                              render={
                                <span className="cursor-help border-b border-dashed border-muted-foreground">
                                  Background Bonus
                                </span>
                              }
                            />
                            <TooltipContent>
                              <p>Max +{BG_BONUS_MAX} on one ability</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </th>
                      <th className="text-center pb-2">Total</th>
                      <th className="text-center pb-2">
                        <TooltipProvider delay={100}>
                          <Tooltip>
                            <TooltipTrigger
                              render={
                                <span className="cursor-help border-b border-dashed border-muted-foreground">
                                  Modifier
                                </span>
                              }
                            />
                            <TooltipContent>
                              <p>Modifier=(Score - 10) / 2 (Rounded Down)</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {ABILITIES.map((ability) => {
                      const score = scores[ability];
                      const bgBonus = bgBonuses[ability];
                      const total = score + bgBonus;
                      const modifier = getModifier(total);
                      const isPrimary = primaryStats.includes(ability);
                      const isBgAbility = bgAbilities.includes(ability);
                      const isAboveMax = score > clampedMax;

                      // Show the bonus stepper when:
                      //   - enforce is on → only for the bg's abilities
                      //   - enforce is off → for every ability
                      const showBgStepper =
                        enforceAsiFromBackground ? isBgAbility : true;

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

                          {/* Stepper — base score */}
                          <td className="py-2 px-2">
                            <div className="flex justify-center">
                              <StepperInput
                                className="rounded-none w-28"
                                value={score}
                                min={clampedMin}
                                max={clampedMax}
                                onChange={(val) =>
                                  handleScoreChange(ability, val)
                                }
                              />
                            </div>
                          </td>

                          {/* Stepper — background bonus */}
                          <td className="py-2 px-2">
                            <div className="flex justify-center">
                              {showBgStepper ? (
                                <StepperInput
                                  className="rounded-none w-28"
                                  value={bgBonus}
                                  min={0}
                                  max={BG_BONUS_MAX}
                                  onChange={(val) =>
                                    handleBgBonusChange(ability, val)
                                  }
                                />
                              ) : (
                                <span className="inline-block w-28 text-center text-muted-foreground/40 select-none">
                                  —
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Total score badge */}
                          <td className="py-2 px-2 text-center">
                            <span
                              className={`inline-block w-10 text-center font-bold text-base ${
                                isAboveMax ? "text-amber-500" : ""
                              }`}
                            >
                              {total}
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

              {/* Footer row: Reset + Points counters */}
              <div className="flex items-center justify-between pt-2 border-t gap-4 flex-wrap">
                <Button variant="outline" size="sm" onClick={handleReset}>
                  <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
                  Reset
                </Button>

                <div className="flex items-center gap-6 text-sm font-medium flex-wrap">
                  {/* Background bonus pool */}
                  <div>
                    Bg bonus:{" "}
                    <span className={`font-bold tabular-nums ${bgPoolColor}`}>
                      {bgBonusRemaining}
                    </span>
                    <span className="text-muted-foreground">/{bgBonusPool}</span>
                  </div>

                  {/* Point buy pool */}
                  <div>
                    Points remaining:{" "}
                    <span className={`font-bold tabular-nums ${pointsColor}`}>
                      {remaining}
                    </span>
                    <span className="text-muted-foreground">/{pointPool}</span>
                  </div>
                </div>
              </div>

              {remaining < 0 && (
                <p className="text-xs text-[#ff3d3d] text-right -mt-3">
                  Over budget by {Math.abs(remaining)} point
                  {Math.abs(remaining) !== 1 ? "s" : ""}
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

      {/* ── Settings overlay ── */}
      <SettingsOverlay />
    </>
  );
}

// ─── Public export (wraps provider) ──────────────────────────────────────────

export function StatGenerator() {
  return (
    <SettingsProvider>
      <StatGeneratorInner />
    </SettingsProvider>
  );
}
