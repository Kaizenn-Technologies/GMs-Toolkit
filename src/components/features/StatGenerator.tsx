import { useEffect, useRef, useState } from "react";
import { RotateCcw, Settings, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation, useNavigate } from "react-router-dom";
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
import type { Ability, PrimaryStat } from "@/types";
import {
  SettingsProvider,
  SettingsOverlay,
  useSettings,
} from "@/components/features/SettingsOverlay";
import {
  AbilityNameCell,
  CenteredCellContent,
  ModifierDisplay,
  PoolStatus,
  StatGeneratorSelectorRow,
  TotalScoreDisplay,
} from "@/components/features/StatGeneratorParts";

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
const STANDARD_ARRAY_OPTIONS = [8, 10, 12, 13, 14, 15] as const;
const CHOOSE_STANDARD_CLASS = "Choose a class";
const STAT_TAB_ROUTES = {
  pointbuy: "/stat-generator/pointbuy",
  roll: "/stat-generator/rolled",
  standard: "/stat-generator/standard-array",
} as const;

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

function getClassStandardArrayByName(className: string): number[] | null {
  const entry = Object.values(classes).find((c) => c.name === className);
  return entry?.standardArray ?? null;
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

function makeScoresFromStandardArray(className: string): Record<Ability, number> {
  const classArray = getClassStandardArrayByName(className);
  const fallback = [...STANDARD_ARRAY_OPTIONS].sort((a, b) => b - a);
  const arrayToUse =
    classArray && classArray.length === ABILITIES.length ? classArray : fallback;

  return ABILITIES.reduce(
    (acc, ability, index) => {
      acc[ability] = arrayToUse[index];
      return acc;
    },
    {} as Record<Ability, number>,
  );
}

function makeUnfilledStandardScores(): Record<Ability, number | null> {
  return {
    Strength: null,
    Dexterity: null,
    Constitution: null,
    Intelligence: null,
    Wisdom: null,
    Charisma: null,
  };
}

// ─── Inner component (consumes settings context) ──────────────────────────────

function StatGeneratorInner() {
  const { settings, openSettings } = useSettings();
  const location = useLocation();
  const navigate = useNavigate();
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
  const [selectedStandardClass, setSelectedStandardClass] =
    useState<string>(CHOOSE_STANDARD_CLASS);
  const [standardScores, setStandardScores] = useState<
    Record<Ability, number | null>
  >(
    makeScoresFromStandardArray("Wizard"),
  );
  const [bgBonuses, setBgBonuses] = useState<Record<Ability, number>>(
    defaultBgBonuses(),
  );
  const [featBonusEnabled, setFeatBonusEnabled] = useState(false);
  const [manualBonuses, setManualBonuses] = useState<Record<Ability, number>>(
    defaultManualBonuses(),
  );
  const [copied, setCopied] = useState(false);
  // Rolled stats state
  const [rolledBoxes, setRolledBoxes] = useState<
    Record<Ability, { rolls: number[]; total: number }>
  >(() =>
    ABILITIES.reduce((acc, ability) => {
      acc[ability] = { rolls: [0, 0, 0, 0], total: 0 };
      return acc;
    }, {} as Record<Ability, { rolls: number[]; total: number }>),
  );
  const [showAssignPanel, setShowAssignPanel] = useState(false);

  const activeTab: "pointbuy" | "roll" | "standard" =
    location.pathname === STAT_TAB_ROUTES.standard
      ? "standard"
      : location.pathname === STAT_TAB_ROUTES.roll
        ? "roll"
        : "pointbuy";

  const spent = pointsUsed(scores, minPurchasable);
  const remaining = pointPool - spent;

  const activeClassForPrimary =
    // If on Standard tab with no class chosen, don't highlight
    activeTab === "standard" && selectedStandardClass === CHOOSE_STANDARD_CLASS
      ? ""
      : // Use selected standard class when on Standard tab
      activeTab === "standard"
        ? selectedStandardClass
        : // When assigning rolled stats, use the class selected in the
        // assignment UI so the primary highlight updates while assigning
        activeTab === "roll" && showAssignPanel
          ? selectedStandardClass
          : // Otherwise use the main selected class (point buy / default)
          selectedClass;
  const primaryStatInfo = getPrimaryStatInfo(activeClassForPrimary);
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

  const handleStandardClassChange = (val: string | null) => {
    if (!val) return;
    setSelectedStandardClass(val);
    if (val === CHOOSE_STANDARD_CLASS) {
      setStandardScores(makeUnfilledStandardScores());
      return;
    }
    setStandardScores(makeScoresFromStandardArray(val));
  };

  const handleStandardScoreChange = (
    ability: Ability,
    selectedValue: string | null,
  ) => {
    if (!selectedValue) return;
    const nextScore = Number.parseInt(selectedValue, 10);
    if (!STANDARD_ARRAY_OPTIONS.includes(nextScore as (typeof STANDARD_ARRAY_OPTIONS)[number])) {
      return;
    }

    const duplicateAbility = ABILITIES.find(
      (ab) => ab !== ability && standardScores[ab] === nextScore,
    );

    if (duplicateAbility) {
      setStandardScores((prev) => ({
        ...prev,
        [duplicateAbility]: prev[ability],
        [ability]: nextScore,
      }));
      return;
    }

    setStandardScores((prev) => ({ ...prev, [ability]: nextScore }));
  };

  const handleStandardReset = () => {
    if (selectedStandardClass === CHOOSE_STANDARD_CLASS) {
      setStandardScores(makeUnfilledStandardScores());
    } else {
      setStandardScores(makeScoresFromStandardArray(selectedStandardClass));
    }
    setBgBonuses(defaultBgBonuses());
    setFeatBonusEnabled(false);
    setManualBonuses(defaultManualBonuses());
  };

  const handleManualBonusChange = (ability: Ability, newVal: number) => {
    const clamped = Math.max(0, Math.min(MANUAL_BONUS_MAX, newVal));
    setManualBonuses((prev) => ({ ...prev, [ability]: clamped }));
  };

  const handleShareLink = async () => {
    const shareUrl = new URL(window.location.href);
    shareUrl.pathname = STAT_TAB_ROUTES[activeTab];
    shareUrl.search = "";

    const activeScores = activeTab === "standard" ? standardScores : scores;
    const params = shareUrl.searchParams;
    params.set(
      "class",
      activeTab === "standard"
        ? selectedStandardClass === CHOOSE_STANDARD_CLASS
          ? ""
          : selectedStandardClass
        : selectedClass,
    );
    params.set("background", selectedBackground);
    if (activeScores.Strength !== null) {
      params.set("str", String(activeScores.Strength));
    }
    if (activeScores.Dexterity !== null) {
      params.set("dex", String(activeScores.Dexterity));
    }
    if (activeScores.Constitution !== null) {
      params.set("con", String(activeScores.Constitution));
    }
    if (activeScores.Intelligence !== null) {
      params.set("int", String(activeScores.Intelligence));
    }
    if (activeScores.Wisdom !== null) {
      params.set("wis", String(activeScores.Wisdom));
    }
    if (activeScores.Charisma !== null) {
      params.set("cha", String(activeScores.Charisma));
    }
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
    if (!params.toString()) {
      if (activeTab === "standard") {
        setSelectedStandardClass(CHOOSE_STANDARD_CLASS);
        setStandardScores(makeUnfilledStandardScores());
      }
      return;
    }

    const classFromUrl = params.get("class");
    if (classFromUrl && classNames.includes(classFromUrl)) {
      setSelectedClass(classFromUrl);
      setSelectedStandardClass(classFromUrl);
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
    if (activeTab === "standard") {
      if (classFromUrl && classNames.includes(classFromUrl)) {
        setStandardScores(nextScores);
      } else {
        setSelectedStandardClass(CHOOSE_STANDARD_CLASS);
        setStandardScores(makeUnfilledStandardScores());
      }
    } else {
      setStandardScores(nextScores);
    }

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
  }, [
    activeTab,
    bgBonusPool,
    clampedMax,
    clampedMin,
    location.search,
    minPurchasable,
  ]);

  // --- Roll helpers ---
  const rollDie = () => Math.floor(Math.random() * 6) + 1;

  const computeTotalFromRolls = (rolls: number[]) => {
    if (!rolls.length) return 0;
    const sum = rolls.reduce((s, v) => s + v, 0);
    const min = Math.min(...rolls);
    return sum - min;
  };

  const rollAllStats = () => {
    const next: Record<Ability, { rolls: number[]; total: number }> = {} as any;
    ABILITIES.forEach((ability) => {
      let rolls = Array.from({ length: 4 }, () => rollDie());
      if (settings.roll?.rerollOnes) {
        rolls = rolls.map((r) => (r === 1 ? rollDie() : r));
      }
      const total = computeTotalFromRolls(rolls);
      next[ability] = { rolls, total };
    });
    setRolledBoxes(next);
    setShowAssignPanel(false);
  };

  const getRolledTotals = () => ABILITIES.map((ab) => rolledBoxes[ab].total);

  const handleShuffleAssign = () => {
    const totals = getRolledTotals();
    const shuffled = totals.slice().sort(() => 0.5 - Math.random());
    const next = ABILITIES.reduce((acc, ability, idx) => {
      acc[ability] = shuffled[idx];
      return acc;
    }, {} as Record<Ability, number | null>);
    setStandardScores(next);
    setShowAssignPanel(true);
  };

  const handleAssignManually = () => {
    setStandardScores(makeUnfilledStandardScores());
    setShowAssignPanel(true);
  };

  const handleRolledAssignChange = (ability: Ability, selectedValue: string | null) => {
    if (!selectedValue) return;
    const nextScore = Number.parseInt(selectedValue, 10);
    // Count how many times this roll value exists in the pool
    const pool = getRolledTotals();
    const poolCount = pool.filter((p) => p === nextScore).length;

    // Count how many other abilities (excluding the current) already use it
    const usedByOthers = ABILITIES.filter(
      (ab) => ab !== ability && standardScores[ab] === nextScore,
    ).length;

    // If there are remaining instances in the pool, just assign without
    // touching the other ability that already has the same value.
    if (usedByOthers < poolCount) {
      setStandardScores((prev) => ({ ...prev, [ability]: nextScore }));
      return;
    }

    // Otherwise no free instance exists — fall back to swapping with the
    // first ability that currently holds the value so the selection stays
    // consistent with available rolls.
    const duplicateAbility = ABILITIES.find(
      (ab) => ab !== ability && standardScores[ab] === nextScore,
    );

    if (duplicateAbility) {
      setStandardScores((prev) => ({
        ...prev,
        [duplicateAbility]: prev[ability],
        [ability]: nextScore,
      }));
      return;
    }

    setStandardScores((prev) => ({ ...prev, [ability]: nextScore }));
  };

  const handleAssignmentReset = () => {
    setStandardScores(makeUnfilledStandardScores());
  };

  const handleShareAssigned = async () => {
    const shareUrl = new URL(window.location.href);
    shareUrl.pathname = STAT_TAB_ROUTES.standard;
    shareUrl.search = "";
    const params = shareUrl.searchParams;
    params.set("class", selectedStandardClass === CHOOSE_STANDARD_CLASS ? "" : selectedStandardClass);
    params.set("background", selectedBackground);
    if (standardScores.Strength !== null) params.set("str", String(standardScores.Strength));
    if (standardScores.Dexterity !== null) params.set("dex", String(standardScores.Dexterity));
    if (standardScores.Constitution !== null) params.set("con", String(standardScores.Constitution));
    if (standardScores.Intelligence !== null) params.set("int", String(standardScores.Intelligence));
    if (standardScores.Wisdom !== null) params.set("wis", String(standardScores.Wisdom));
    if (standardScores.Charisma !== null) params.set("cha", String(standardScores.Charisma));

    try {
      await navigator.clipboard.writeText(shareUrl.toString());
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch { }
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
          <Tabs
            value={activeTab}
            onValueChange={(value) => {
              const nextPath =
                value === "standard"
                  ? STAT_TAB_ROUTES.standard
                  : value === "roll"
                    ? STAT_TAB_ROUTES.roll
                    : STAT_TAB_ROUTES.pointbuy;
              if (location.pathname !== nextPath) {
                navigate(nextPath);
              }
            }}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="pointbuy">Point Buy</TabsTrigger>
              <TabsTrigger value="roll">Rolled Stats</TabsTrigger>
              <TabsTrigger value="standard">Standard Array</TabsTrigger>
            </TabsList>

            {/* ── POINT BUY TAB ── */}
            <TabsContent value="pointbuy" className="space-y-6">
              {/* Class + Background selectors */}
              <StatGeneratorSelectorRow
                classValue={selectedClass}
                onClassChange={setSelectedClass}
                classOptions={classNames}
                backgroundValue={selectedBackground}
                onBackgroundChange={handleBackgroundChange}
                backgroundOptions={backgroundNames}
                featBonusEnabled={featBonusEnabled}
                onFeatBonusChange={setFeatBonusEnabled}
                primaryDisplay={primaryStats.length > 0 ? primaryDisplay : undefined}
              />

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
                        <th className="text-center pb-2">Feat Bonus</th>
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

                      // Show background stepper based on the settings. When
                      // `enforceAsiFromBackground` is true, only show for the
                      // background's designated abilities; otherwise show for
                      // every ability.
                      const showBgStepper = enforceAsiFromBackground ? isBgAbility : true;

                      return (
                        <tr
                          key={ability}
                          className={`rounded-md transition-colors ${isPrimary
                            ? "bg-primary/8 dark:bg-primary/10"
                            : "hover:bg-muted/50"
                            }`}
                        >
                          {/* Ability name */}
                          <AbilityNameCell
                            ability={ability}
                            abilityAbbreviation={ABILITY_ABBR[ability]}
                            isPrimary={isPrimary}
                            primaryTooltip={`Primary stat for ${selectedClass}`}
                          />

                          {/* Stepper — base score */}
                          <td className="py-2 px-2">
                            <CenteredCellContent>
                              <StepperInput
                                className="rounded-none w-28"
                                value={score}
                                min={clampedMin}
                                max={clampedMax}
                                onChange={(val) =>
                                  handleScoreChange(ability, val)
                                }
                              />
                            </CenteredCellContent>
                          </td>

                          {/* Stepper — background bonus */}
                          <td className="py-2 px-2">
                            <CenteredCellContent>
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
                            </CenteredCellContent>
                          </td>

                          {featBonusEnabled && (
                            <td className="py-2 px-2">
                              <CenteredCellContent>
                                <StepperInput
                                  className="rounded-none w-28"
                                  value={manualBonus}
                                  min={0}
                                  max={MANUAL_BONUS_MAX}
                                  onChange={(val) =>
                                    handleManualBonusChange(ability, val)
                                  }
                                />
                              </CenteredCellContent>
                            </td>
                          )}

                          {/* Total score badge */}
                          <td className="py-2 px-2 text-center">
                            <TotalScoreDisplay value={total} highlight={isAboveMax} />
                          </td>

                          {/* Modifier */}
                          <td className="py-2 pr-3 text-center rounded-r-md">
                            <ModifierDisplay
                              value={formatModifier(modifier)}
                              className={modifier > 0
                                ? "text-[#00c93cff] dark:text-[#10ff58ff]"
                                : modifier < 0
                                  ? "text-[#ff3d3d]"
                                  : "text-muted-foreground"}
                            />
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
                  <Button variant="outline" size="sm" onClick={handleShareLink}>
                    {copied ? (
                      <Check className="w-3.5 h-3.5 mr-1.5" />
                    ) : (
                      <Copy className="w-3.5 h-3.5 mr-1.5" />
                    )}
                    {copied ? "Shared" : "Share"}
                  </Button>
                </div>

                <div className="flex items-center gap-6 text-sm font-medium flex-wrap">
                  {/* Background bonus pool */}
                  <PoolStatus
                    label="Background Points:"
                    value={bgBonusRemaining}
                    max={bgBonusPool}
                    valueClassName={bgPoolColor}
                  />

                  {/* Point buy pool */}
                  <PoolStatus
                    label="Points remaining:"
                    value={remaining}
                    max={pointPool}
                    valueClassName={pointsColor}
                  />
                </div>
              </div>

              {remaining < 0 && (
                <p className="text-xs text-[#ff3d3d] text-right -mt-3">
                  Over budget by {Math.abs(remaining)} point
                  {Math.abs(remaining) !== 1 ? "s" : ""}
                </p>
              )}
            </TabsContent>

            {/* ── ROLL TAB ── */}
            <TabsContent value="roll" className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {ABILITIES.map((ability) => {
                  const box = rolledBoxes[ability];
                  const rolls = box?.rolls ?? [0, 0, 0, 0];
                  const total = box?.total ?? 0;
                  const totalColorClass =
                    total === 18 ? "text-amber-400" : total === 3 ? "text-red-500" : "";
                  const displayed = settings.roll?.sortDescending
                    ? [...rolls].sort((a, b) => b - a)
                    : rolls;

                  return (
                    <div
                      key={ability}
                      className="bg-card border border-border rounded-md p-4 flex flex-col items-center"
                    >
                      <div className="text-sm text-muted-foreground mb-2">
                        {ability}
                      </div>
                      <div className={`text-3xl font-bold tabular-nums mb-2 ${totalColorClass}`}>{total}</div>
                      <div className="text-sm text-muted-foreground/80">
                        {displayed.map((d, i) => {
                          const isLast = i === displayed.length - 1;
                          const colorClass = settings.roll?.colorDice
                            ? d === 1
                              ? "text-red-500"
                              : d === 6
                                ? "text-emerald-500"
                                : ""
                            : "";
                          return (
                            <span
                              key={i}
                              className={`${colorClass} ${isLast ? "line-through" : ""} mx-0.5`}
                            >
                              {d}
                              {i < displayed.length - 1 ? "+" : ""}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center justify-between">
                <Button onClick={rollAllStats}>Roll Stats</Button>
                <div className="flex items-center gap-3">
                  <Button variant="outline" onClick={handleAssignManually}>
                    Assign manually
                  </Button>
                  <Button variant="outline" onClick={handleShuffleAssign}>
                    Shuffle
                  </Button>
                </div>
              </div>

              {showAssignPanel && (
                <div className="overflow-x-auto mt-6 pt-4 border-t">
                  <StatGeneratorSelectorRow
                    classValue={selectedStandardClass}
                    onClassChange={setSelectedStandardClass}
                    classOptions={[CHOOSE_STANDARD_CLASS, ...classNames]}
                    classPlaceholder={CHOOSE_STANDARD_CLASS}
                    backgroundValue={selectedBackground}
                    onBackgroundChange={handleBackgroundChange}
                    backgroundOptions={backgroundNames}
                    featBonusEnabled={featBonusEnabled}
                    onFeatBonusChange={setFeatBonusEnabled}
                    primaryDisplay={primaryDisplay}
                  />

                  {/* background pool + share/reset moved to footer below table */}
                  <table className="w-full text-sm border-separate border-spacing-y-1">
                    <thead>
                      <tr className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                        <th className="text-left pb-2 pl-2">Ability</th>
                        <th className="text-center pb-2">Score</th>
                        <th className="text-center pb-2">Background</th>
                        {featBonusEnabled && <th className="text-center pb-2">Feat Bonus</th>}
                        <th className="text-center pb-2">Total</th>
                        <th className="text-center pb-2">Modifier</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ABILITIES.map((ability) => {
                        const score = standardScores[ability];
                        const bgBonus = bgBonuses[ability];
                        const manualBonus = manualBonuses[ability];
                        const total = score === null ? null : score + bgBonus + (featBonusEnabled ? manualBonus : 0);
                        const modifier = total === null ? null : getModifier(total);

                        // Build a per-ability available pool: remove one instance for
                        // each value already assigned to *other* abilities so the
                        // dropdown shows only the remaining rolls. Keep the
                        // current ability's value available so it doesn't disappear
                        // while selected.
                        const pool = getRolledTotals();
                        const availablePool = pool.slice().sort((a, b) => b - a);
                        ABILITIES.forEach((ab) => {
                          if (ab === ability) return;
                          const assigned = standardScores[ab];
                          if (assigned === null) return;
                          const idx = availablePool.indexOf(assigned);
                          if (idx !== -1) availablePool.splice(idx, 1);
                        });
                        if (score !== null && availablePool.indexOf(score) === -1) {
                          availablePool.push(score);
                        }

                        const isBgAbility = bgAbilities.includes(ability);
                        const isPrimary = primaryStats.includes(ability);

                        return (
                          <tr key={ability} className={`rounded-md transition-colors ${isPrimary ? "bg-primary/8 dark:bg-primary/10" : "hover:bg-muted/50"}`}>
                            <AbilityNameCell
                              ability={ability}
                              abilityAbbreviation={ABILITY_ABBR[ability]}
                              isPrimary={isPrimary}
                              primaryTooltip="Primary stat for selected class"
                            />
                            <td className="py-2 px-2">
                              <CenteredCellContent>
                                <Select value={score === null ? "" : String(score)} onValueChange={(val) => handleRolledAssignChange(ability, val)}>
                                  <SelectTrigger className="rounded-none w-28">
                                    <SelectValue placeholder="Select" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {availablePool.map((option, idx) => (
                                      <SelectItem key={`${option}-${idx}`} value={String(option)}>
                                        {option}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </CenteredCellContent>
                            </td>

                            <td className="py-2 px-2">
                              <CenteredCellContent>
                                {isBgAbility ? (
                                  <StepperInput className="rounded-none w-28" value={bgBonus} min={0} max={BG_BONUS_MAX} onChange={(val) => handleBgBonusChange(ability, val)} />
                                ) : (
                                  <span className="inline-block w-28 text-center text-muted-foreground/40 select-none">—</span>
                                )}
                              </CenteredCellContent>
                            </td>

                            {featBonusEnabled && (
                              <td className="py-2 px-2">
                                <CenteredCellContent>
                                  <StepperInput className="rounded-none w-28" value={manualBonus} min={0} max={MANUAL_BONUS_MAX} onChange={(val) => handleManualBonusChange(ability, val)} />
                                </CenteredCellContent>
                              </td>
                            )}

                            <td className="py-2 px-2 text-center">
                              <TotalScoreDisplay value={total ?? "—"} />
                            </td>

                            <td className="py-2 pr-3 text-center rounded-r-md">
                              <ModifierDisplay
                                value={modifier === null ? "—" : formatModifier(modifier)}
                                className={modifier !== null && modifier > 0 ? "text-[#00c93cff] dark:text-[#10ff58ff]" : modifier !== null && modifier < 0 ? "text-[#ff3d3d]" : "text-muted-foreground"}
                              />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>

                  <div className="flex items-center justify-between mt-3 gap-3">
                    <div className="flex items-center gap-3">
                      <PoolStatus
                        label="Background Points:"
                        value={bgBonusRemaining}
                        max={bgBonusPool}
                        valueClassName={bgPoolColor}
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={handleShareAssigned}>{copied ? "Shared" : "Share"}</Button>
                      <Button variant="outline" size="sm" onClick={handleAssignmentReset}><RotateCcw className="w-3.5 h-3.5 mr-1.5" />Reset</Button>
                    </div>
                  </div>

                </div>
              )}
            </TabsContent>

            {/* ── STANDARD ARRAY TAB ── */}
            <TabsContent value="standard" className="space-y-6">
              <StatGeneratorSelectorRow
                classValue={selectedStandardClass}
                onClassChange={handleStandardClassChange}
                classOptions={[CHOOSE_STANDARD_CLASS, ...classNames]}
                classPlaceholder={CHOOSE_STANDARD_CLASS}
                backgroundValue={selectedBackground}
                onBackgroundChange={handleBackgroundChange}
                backgroundOptions={backgroundNames}
                featBonusEnabled={featBonusEnabled}
                onFeatBonusChange={setFeatBonusEnabled}
                primaryDisplay={primaryStats.length > 0 ? primaryDisplay : undefined}
              />

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
                        <th className="text-center pb-2">Feat Bonus</th>
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
                      const score = standardScores[ability];
                      const bgBonus = bgBonuses[ability];
                      const manualBonus = manualBonuses[ability];
                      const total =
                        score === null
                          ? null
                          : score + bgBonus + (featBonusEnabled ? manualBonus : 0);
                      const modifier = total === null ? null : getModifier(total);
                      const isPrimary = primaryStats.includes(ability);
                      const isBgAbility = bgAbilities.includes(ability);
                      const showBgStepper = enforceAsiFromBackground ? isBgAbility : true;

                      return (
                        <tr
                          key={ability}
                          className={`rounded-md transition-colors ${isPrimary
                            ? "bg-primary/8 dark:bg-primary/10"
                            : "hover:bg-muted/50"
                            }`}
                        >
                          <AbilityNameCell
                            ability={ability}
                            abilityAbbreviation={ABILITY_ABBR[ability]}
                            isPrimary={isPrimary}
                            primaryTooltip={`Primary stat for ${selectedStandardClass === CHOOSE_STANDARD_CLASS
                              ? "selected class"
                              : selectedStandardClass}`}
                          />

                          <td className="py-2 px-2">
                            <CenteredCellContent>
                              <Select
                                value={score === null ? "" : String(score)}
                                onValueChange={(val) =>
                                  handleStandardScoreChange(ability, val)
                                }
                              >
                                <SelectTrigger className="rounded-none w-28">
                                  <SelectValue placeholder="Select" />
                                </SelectTrigger>
                                <SelectContent>
                                  {STANDARD_ARRAY_OPTIONS.map((option) => {
                                    const inUseByOtherAbility = ABILITIES.some(
                                      (ab) =>
                                        ab !== ability &&
                                        standardScores[ab] !== null &&
                                        standardScores[ab] === option,
                                    );
                                    return (
                                      <SelectItem
                                        key={option}
                                        value={String(option)}
                                        disabled={inUseByOtherAbility}
                                      >
                                        {option}
                                      </SelectItem>
                                    );
                                  })}
                                </SelectContent>
                              </Select>
                            </CenteredCellContent>
                          </td>

                          <td className="py-2 px-2">
                            <CenteredCellContent>
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
                            </CenteredCellContent>
                          </td>

                          {featBonusEnabled && (
                            <td className="py-2 px-2">
                              <CenteredCellContent>
                                <StepperInput
                                  className="rounded-none w-28"
                                  value={manualBonus}
                                  min={0}
                                  max={MANUAL_BONUS_MAX}
                                  onChange={(val) =>
                                    handleManualBonusChange(ability, val)
                                  }
                                />
                              </CenteredCellContent>
                            </td>
                          )}

                          <td className="py-2 px-2 text-center">
                            <TotalScoreDisplay value={total ?? "—"} />
                          </td>

                          <td className="py-2 pr-3 text-center rounded-r-md">
                            <ModifierDisplay
                              value={modifier === null ? "—" : formatModifier(modifier)}
                              className={modifier !== null && modifier > 0
                                ? "text-[#00c93cff] dark:text-[#10ff58ff]"
                                : modifier !== null && modifier < 0
                                  ? "text-[#ff3d3d]"
                                  : "text-muted-foreground"}
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="flex items-center justify-between pt-2 border-t gap-4 flex-wrap">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleStandardReset}
                  >
                    <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
                    Reset
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleShareLink}>
                    {copied ? (
                      <Check className="w-3.5 h-3.5 mr-1.5" />
                    ) : (
                      <Copy className="w-3.5 h-3.5 mr-1.5" />
                    )}
                    {copied ? "Shared" : "Share"}
                  </Button>
                </div>

                <div className="flex items-center gap-6 text-sm font-medium flex-wrap">
                  <PoolStatus
                    label="Background Points:"
                    value={bgBonusRemaining}
                    max={bgBonusPool}
                    valueClassName={bgPoolColor}
                  />
                </div>
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
