import { useEffect, useRef, useState } from "react";
import { Star, RotateCcw, Settings, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation } from "react-router-dom";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { StepperInput } from "@/components/ui/stepper-input";
import { classes, classNames } from "@/lib/classes";
import { backgrounds, backgroundNames } from "@/lib/backgrounds";
import type { Ability, PrimaryStat } from "@/types";
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
const MANUAL_BONUS_MAX = 20;

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

function getPrimaryStatInfo(className: string): {
  type: PrimaryStat["type"];
  abilities: Ability[];
} {
  const entry = Object.values(classes).find((c) => c.name === className);
  if (!entry) return { type: "single", abilities: [] };
  const ps = entry.primaryStat;
  if (ps.type === "single") return { type: ps.type, abilities: [ps.value] };
  if (ps.type === "multiple") return { type: ps.type, abilities: ps.values };
  if (ps.type === "choice") return { type: ps.type, abilities: ps.options };
  return { type: "single", abilities: [] };
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

function defaultManualBonuses(): Record<Ability, number> {
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
  const location = useLocation();
  const hasHydratedFromUrl = useRef(false);
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
  const [featBonusEnabled, setFeatBonusEnabled] = useState(false);
  const [manualBonuses, setManualBonuses] = useState<Record<Ability, number>>(
    defaultManualBonuses(),
  );
  const [copied, setCopied] = useState(false);

  const spent = pointsUsed(scores, minPurchasable);
  const remaining = pointPool - spent;

  const primaryStatInfo = getPrimaryStatInfo(selectedClass);
  const primaryStats = primaryStatInfo.abilities;
  const primaryDisplay =
    primaryStats.length === 0
      ? ""
      : primaryStatInfo.type === "choice"
        ? primaryStats.join(" or ")
        : primaryStatInfo.type === "multiple"
          ? primaryStats.join(" & ")
          : primaryStats[0];
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
    setFeatBonusEnabled(false);
    setManualBonuses(defaultManualBonuses());
  };

  const handleBackgroundChange = (val: string | null) => {
    if (!val) return;
    setSelectedBackground(val);
    setBgBonuses(defaultBgBonuses());
  };

  const handleManualBonusChange = (ability: Ability, newVal: number) => {
    const clamped = Math.max(0, Math.min(MANUAL_BONUS_MAX, newVal));
    setManualBonuses((prev) => ({ ...prev, [ability]: clamped }));
  };

  const handleCopyLink = async () => {
    const shareUrl = new URL(window.location.href);
    shareUrl.pathname = "/stat-generator";
    shareUrl.search = "";

    const params = shareUrl.searchParams;
    params.set("class", selectedClass);
    params.set("background", selectedBackground);
    params.set("str", String(scores.Strength));
    params.set("dex", String(scores.Dexterity));
    params.set("con", String(scores.Constitution));
    params.set("int", String(scores.Intelligence));
    params.set("wis", String(scores.Wisdom));
    params.set("cha", String(scores.Charisma));
    params.set("bstr", String(bgBonuses.Strength));
    params.set("bdex", String(bgBonuses.Dexterity));
    params.set("bcon", String(bgBonuses.Constitution));
    params.set("bint", String(bgBonuses.Intelligence));
    params.set("bwis", String(bgBonuses.Wisdom));
    params.set("bcha", String(bgBonuses.Charisma));
    params.set("feat", featBonusEnabled ? "1" : "0");
    params.set("mstr", String(manualBonuses.Strength));
    params.set("mdex", String(manualBonuses.Dexterity));
    params.set("mcon", String(manualBonuses.Constitution));
    params.set("mint", String(manualBonuses.Intelligence));
    params.set("mwis", String(manualBonuses.Wisdom));
    params.set("mcha", String(manualBonuses.Charisma));

    try {
      await navigator.clipboard.writeText(shareUrl.toString());
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      // If clipboard permissions are blocked, fail quietly.
    }
  };

  useEffect(() => {
    if (hasHydratedFromUrl.current) return;
    hasHydratedFromUrl.current = true;

    const params = new URLSearchParams(location.search);
    if (!params.toString()) return;

    const classFromUrl = params.get("class");
    if (classFromUrl && classNames.includes(classFromUrl)) {
      setSelectedClass(classFromUrl);
    }

    const bgFromUrl = params.get("background");
    if (bgFromUrl && backgroundNames.includes(bgFromUrl)) {
      setSelectedBackground(bgFromUrl);
    }

    const toScore = (val: string | null) => {
      if (!val) return null;
      const parsed = Number.parseInt(val, 10);
      if (Number.isNaN(parsed)) return null;
      return Math.max(clampedMin, Math.min(clampedMax, parsed));
    };

    const nextScores = makeDefaultScores(minPurchasable);
    const str = toScore(params.get("str"));
    const dex = toScore(params.get("dex"));
    const con = toScore(params.get("con"));
    const int = toScore(params.get("int"));
    const wis = toScore(params.get("wis"));
    const cha = toScore(params.get("cha"));

    if (str !== null) nextScores.Strength = str;
    if (dex !== null) nextScores.Dexterity = dex;
    if (con !== null) nextScores.Constitution = con;
    if (int !== null) nextScores.Intelligence = int;
    if (wis !== null) nextScores.Wisdom = wis;
    if (cha !== null) nextScores.Charisma = cha;
    setScores(nextScores);

    const toBgBonus = (val: string | null) => {
      if (!val) return null;
      const parsed = Number.parseInt(val, 10);
      if (Number.isNaN(parsed)) return null;
      return Math.max(0, Math.min(BG_BONUS_MAX, parsed));
    };

    const nextBonuses = defaultBgBonuses();
    let remainingBonusPool = bgBonusPool;
    const bstr = toBgBonus(params.get("bstr"));
    const bdex = toBgBonus(params.get("bdex"));
    const bcon = toBgBonus(params.get("bcon"));
    const bint = toBgBonus(params.get("bint"));
    const bwis = toBgBonus(params.get("bwis"));
    const bcha = toBgBonus(params.get("bcha"));

    if (bstr !== null) {
      nextBonuses.Strength = Math.min(bstr, remainingBonusPool);
      remainingBonusPool -= nextBonuses.Strength;
    }
    if (bdex !== null) {
      nextBonuses.Dexterity = Math.min(bdex, remainingBonusPool);
      remainingBonusPool -= nextBonuses.Dexterity;
    }
    if (bcon !== null) {
      nextBonuses.Constitution = Math.min(bcon, remainingBonusPool);
      remainingBonusPool -= nextBonuses.Constitution;
    }
    if (bint !== null) {
      nextBonuses.Intelligence = Math.min(bint, remainingBonusPool);
      remainingBonusPool -= nextBonuses.Intelligence;
    }
    if (bwis !== null) {
      nextBonuses.Wisdom = Math.min(bwis, remainingBonusPool);
      remainingBonusPool -= nextBonuses.Wisdom;
    }
    if (bcha !== null) {
      nextBonuses.Charisma = Math.min(bcha, remainingBonusPool);
      remainingBonusPool -= nextBonuses.Charisma;
    }

    setBgBonuses(nextBonuses);

    const featFromUrl = params.get("feat");
    setFeatBonusEnabled(featFromUrl === "1");

    const toManualBonus = (val: string | null) => {
      if (!val) return null;
      const parsed = Number.parseInt(val, 10);
      if (Number.isNaN(parsed)) return null;
      return Math.max(0, Math.min(MANUAL_BONUS_MAX, parsed));
    };

    const nextManualBonuses = defaultManualBonuses();
    const mstr = toManualBonus(params.get("mstr"));
    const mdex = toManualBonus(params.get("mdex"));
    const mcon = toManualBonus(params.get("mcon"));
    const mint = toManualBonus(params.get("mint"));
    const mwis = toManualBonus(params.get("mwis"));
    const mcha = toManualBonus(params.get("mcha"));

    if (mstr !== null) nextManualBonuses.Strength = mstr;
    if (mdex !== null) nextManualBonuses.Dexterity = mdex;
    if (mcon !== null) nextManualBonuses.Constitution = mcon;
    if (mint !== null) nextManualBonuses.Intelligence = mint;
    if (mwis !== null) nextManualBonuses.Wisdom = mwis;
    if (mcha !== null) nextManualBonuses.Charisma = mcha;
    setManualBonuses(nextManualBonuses);
  }, [bgBonusPool, clampedMax, clampedMin, location.search, minPurchasable]);

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
            {/* <Tooltip>
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
            </Tooltip> */}

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

                <div className="flex items-center gap-2 shrink-0">
                <TooltipProvider delay={100}>
                          <Tooltip>
                            <TooltipTrigger
                              render={
                                <span className="cursor-help border-b border-dashed border-muted-foreground">
                                  Feat Bonus
                                </span>
                              }
                            />
                            <TooltipContent>
                              <p>Manually add a bonus to ability scores granted by feats.</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                  <Switch
                    size="sm"
                    checked={featBonusEnabled}
                    onCheckedChange={setFeatBonusEnabled}
                    aria-label="Toggle feat bonus"
                  />
                </div>

                {primaryStats.length > 0 && (
                  <p className="text-xs text-muted-foreground sm:ml-auto">
                    Primary:{" "}
                    <span className="font-semibold text-foreground">
                      {primaryDisplay}
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
                      {featBonusEnabled && (
                        <th className="text-center pb-2">Manual Bonus</th>
                      )}
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
                      const manualBonus = manualBonuses[ability];
                      const total =
                        score + bgBonus + (featBonusEnabled ? manualBonus : 0);
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

                          {featBonusEnabled && (
                            <td className="py-2 px-2">
                              <div className="flex justify-center">
                                <StepperInput
                                  className="rounded-none w-28"
                                  value={manualBonus}
                                  min={0}
                                  max={MANUAL_BONUS_MAX}
                                  onChange={(val) =>
                                    handleManualBonusChange(ability, val)
                                  }
                                />
                              </div>
                            </td>
                          )}

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
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={handleReset}>
                    <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
                    Reset
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleCopyLink}>
                    {copied ? (
                      <Check className="w-3.5 h-3.5 mr-1.5" />
                    ) : (
                      <Copy className="w-3.5 h-3.5 mr-1.5" />
                    )}
                    {copied ? "Copied" : "Copy Link"}
                  </Button>
                </div>

                <div className="flex items-center gap-6 text-sm font-medium flex-wrap">
                  {/* Background bonus pool */}
                  <div>
                    Background Points:{" "}
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
