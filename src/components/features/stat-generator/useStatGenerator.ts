/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useRef, useState, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { classes, classNames } from "@/lib/classes";
import { backgrounds, backgroundNames } from "@/lib/backgrounds";
import {
  ABILITIES,
  createAbilityRecord,
  getModifier,
} from "@/lib/stat-generator";
import {
  backgroundBonusParamKeys,
  manualBonusParamKeys,
  parseClampedIntParam,
  scoreParamKeys,
} from "@/lib/stat-generator-url";
import type { Ability, PrimaryStat } from "@/types";
import { useSettings } from "@/contexts/SettingsContext";
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";
import { randomInt } from "@/utils/rng";
import {
  encodeCharacter,
} from "@/utils/encoding";
import {
  decodeCharacter,
  matchRolledBoxesToAssignments,
} from "@/utils/decoding";
import type {
  PointBuyData,
  RolledData,
  SkillsData,
} from "@/utils/encoding";

export const BG_BONUS_MAX = 2;
export const MANUAL_BONUS_MAX = 20;
export const STANDARD_ARRAY_OPTIONS = [8, 10, 12, 13, 14, 15] as const;
export const CHOOSE_STANDARD_CLASS = "Choose a class";
export const CHOOSE_BACKGROUND = "Choose a background";
const ROLLED_POOL_PARAM = "rpool";
export const STAT_TAB_ROUTES = {
  pointbuy: "/stat-generator/pointbuy",
  roll: "/stat-generator/rolled",
  standard: "/stat-generator/standard-array",
} as const;

const rollDie = () => randomInt(1, 6);

const computeTotalFromRolls = (rolls: number[]) => {
  if (!rolls.length) return 0;
  const sum = rolls.reduce((s, v) => s + v, 0);
  const min = Math.min(...rolls);
  return sum - min;
};

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

function makeDefaultScores(defaultScore: number): Record<Ability, number> {
  return createAbilityRecord(defaultScore);
}

function defaultBgBonuses(): Record<Ability, number> {
  return createAbilityRecord(0);
}

function defaultManualBonuses(): Record<Ability, number> {
  return createAbilityRecord(0);
}

function makeScoresFromStandardArray(className: string): Record<Ability, number> {
  const classArray = getClassStandardArrayByName(className);
  const fallback = STANDARD_ARRAY_OPTIONS.toSorted((a, b) => b - a);
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
  return createAbilityRecord<number | null>(null);
}


function decodeRolledPool(
  raw: string,
): Record<Ability, { rolls: number[]; total: number }> | null {
  if (!raw) return null;
  const chunks = raw.split("_");
  if (chunks.length !== ABILITIES.length) return null;

  const next = {} as Record<Ability, { rolls: number[]; total: number }>;
  for (let index = 0; index < ABILITIES.length; index++) {
    const ability = ABILITIES[index];
    const rolls = chunks[index].split(".").map((value) => Number.parseInt(value, 10));
    if (
      rolls.length !== 4 ||
      rolls.some((roll) => Number.isNaN(roll) || roll < 1 || roll > 6)
    ) {
      return null;
    }

    const sum = rolls.reduce((total, roll) => total + roll, 0);
    const min = Math.min(...rolls);
    next[ability] = { rolls, total: sum - min };
  }

  return next;
}

export function useStatGenerator() {
  const { settings, openSettings, updatePointBuy, updateRoll, updateStandard } = useSettings();
  const location = useLocation();
  const navigate = useNavigate();
  const hasHydratedFromUrl = useRef(false);
  const ignoreClassChangeRef = useRef(false);
  const pb = settings.pointBuy;

  const {
    pointPool,
    maxPurchasable,
    minPurchasable,
  } = pb;

  const activeTab: "pointbuy" | "roll" | "standard" =
    location.pathname === STAT_TAB_ROUTES.standard
      ? "standard"
      : location.pathname === STAT_TAB_ROUTES.roll
        ? "roll"
        : "pointbuy";

  const bgBonusPool =
    activeTab === "pointbuy"
      ? settings.pointBuy.bgBonusPool
      : activeTab === "roll"
        ? settings.roll.bgBonusPool
        : settings.standard.bgBonusPool;

  const enforceAsiFromBackground =
    activeTab === "pointbuy"
      ? settings.pointBuy.enforceAsiFromBackground
      : activeTab === "roll"
        ? settings.roll.enforceAsiFromBackground
        : settings.standard.enforceAsiFromBackground;

  const [selectedClass, setSelectedClass] = useState<string>(CHOOSE_STANDARD_CLASS);
  const [selectedBackground, setSelectedBackground] = useState<string>(CHOOSE_BACKGROUND);
  const [scores, setScores] = useState<Record<Ability, number>>(
    () => makeDefaultScores(minPurchasable)
  );
  const [selectedStandardClass, setSelectedStandardClass] =
    useState<string>(CHOOSE_STANDARD_CLASS);
  const [standardScores, setStandardScores] = useState<
    Record<Ability, number | null>
  >(() => makeUnfilledStandardScores());
  const [bgBonuses, setBgBonuses] = useState<Record<Ability, number>>(
    () => defaultBgBonuses()
  );
  const [featBonusEnabled, setFeatBonusEnabled] = useState(false);
  const [manualBonuses, setManualBonuses] = useState<Record<Ability, number>>(
    () => defaultManualBonuses()
  );
  const { copied, copyToClipboard } = useCopyToClipboard();

  // Share Modal States
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [shareModalProps, setShareModalProps] = useState<any>(null);
  const sharedNameRef = useRef("");
  const sharedRollsRef = useRef<number | null>(null);
  const [sharedTimestamp, setSharedTimestamp] = useState("");
  const [sharedTimezone, setSharedTimezone] = useState("");

  // Rolled stats state
  const [rolledBoxes, setRolledBoxes] = useState<
    Record<Ability, { rolls: number[]; total: number }>
  >(() =>
    ABILITIES.reduce((acc, ability) => {
      acc[ability] = { rolls: [0, 0, 0, 0], total: 0 };
      return acc;
    }, {} as Record<Ability, { rolls: number[]; total: number }>),
  );
  const [isRolling, setIsRolling] = useState(false);
  const [rollCount, setRollCount] = useState<number>(() => {
    if (typeof window === 'undefined') return 0;
    const params = new URLSearchParams(location.search);
    const codeFromUrl = params.get("code");
    if (codeFromUrl) {
      try {
        const decoded = decodeCharacter(codeFromUrl);
        return decoded.metadata?.rollCount ?? 0;
      } catch (e) {}
    }
    return 0;
  });
  const rollIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    const ref = rollIntervalRef;
    return () => {
      if (ref.current) {
        window.clearInterval(ref.current);
      }
    };
  }, []);

  const [showAssignPanel, setShowAssignPanel] = useState(false);

  // Skills and Saving Throws state
  const [level, setLevel] = useState<number>(1);
  const [skillsState, setSkillsState] = useState<Record<string, "none" | "prof" | "expertise">>(() => {
    return {
      Athletics: "none",
      Acrobatics: "none",
      "Sleight of Hand": "none",
      Stealth: "none",
      Arcana: "none",
      History: "none",
      Investigation: "none",
      Nature: "none",
      Religion: "none",
      "Animal Handling": "none",
      Insight: "none",
      Medicine: "none",
      Perception: "none",
      Survival: "none",
      Deception: "none",
      Intimidation: "none",
      Performance: "none",
      Persuasion: "none",
    };
  });

  const [savingThrowsState, setSavingThrowsState] = useState<Record<Ability, "none" | "prof" | "expertise">>(() => {
    return {
      Strength: "none",
      Dexterity: "none",
      Constitution: "none",
      Intelligence: "none",
      Wisdom: "none",
      Charisma: "none",
    };
  });

  const activeClass =
    location.pathname === STAT_TAB_ROUTES.standard && selectedStandardClass === CHOOSE_STANDARD_CLASS
      ? ""
      : location.pathname === STAT_TAB_ROUTES.standard
        ? selectedStandardClass
        : location.pathname === STAT_TAB_ROUTES.roll && showAssignPanel
          ? selectedStandardClass
          : selectedClass;

  const prevActiveClassRef = useRef(activeClass);
  // Autofill saving throws when active class changes
  if (activeClass !== prevActiveClassRef.current) {
    if (ignoreClassChangeRef.current) {
      ignoreClassChangeRef.current = false;
    } else {
      if (!activeClass || activeClass === CHOOSE_STANDARD_CLASS) {
        setSavingThrowsState({
          Strength: "none",
          Dexterity: "none",
          Constitution: "none",
          Intelligence: "none",
          Wisdom: "none",
          Charisma: "none",
        });
      } else {
        const activeClassData = Object.values(classes).find((c) => c.name === activeClass);
        const activeSavingThrows = (activeClassData?.savingThrows ?? []) as Ability[];

        setSavingThrowsState((prev) => {
          const next = { ...prev };
          ABILITIES.forEach((ability) => {
            if (activeSavingThrows.includes(ability)) {
              next[ability] = "prof";
            } else {
              next[ability] = "none";
            }
          });
          return next;
        });
      }
    }
    prevActiveClassRef.current = activeClass;
  }

  const handleSkillsReset = () => {
    setSkillsState({
      Athletics: "none",
      Acrobatics: "none",
      "Sleight of Hand": "none",
      Stealth: "none",
      Arcana: "none",
      History: "none",
      Investigation: "none",
      Nature: "none",
      Religion: "none",
      "Animal Handling": "none",
      Insight: "none",
      Medicine: "none",
      Perception: "none",
      Survival: "none",
      Deception: "none",
      Intimidation: "none",
      Performance: "none",
      Persuasion: "none",
    });

    if (!activeClass || activeClass === CHOOSE_STANDARD_CLASS) {
      setSavingThrowsState({
        Strength: "none",
        Dexterity: "none",
        Constitution: "none",
        Intelligence: "none",
        Wisdom: "none",
        Charisma: "none",
      });
    } else {
      const activeClassData = Object.values(classes).find((c) => c.name === activeClass);
      const activeSavingThrows = (activeClassData?.savingThrows ?? []) as Ability[];
      setSavingThrowsState(() => {
        const next: Record<Ability, "none" | "prof" | "expertise"> = {
          Strength: "none",
          Dexterity: "none",
          Constitution: "none",
          Intelligence: "none",
          Wisdom: "none",
          Charisma: "none",
        };
        ABILITIES.forEach((ability) => {
          if (activeSavingThrows.includes(ability)) {
            next[ability] = "prof";
          }
        });
        return next;
      });
    }
    setLevel(1);
  };

  // activeTab is resolved dynamically at the top of the hook

  const spent = pointsUsed(scores, minPurchasable);
  const remaining = pointPool - spent;

  const activeClassForPrimary =
    activeTab === "standard" && selectedStandardClass === CHOOSE_STANDARD_CLASS
      ? ""
      : activeTab === "standard"
        ? selectedStandardClass
        : activeTab === "roll" && showAssignPanel
          ? selectedStandardClass
          : selectedClass;

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
    if (selectedValue === null || selectedValue === "") {
      setStandardScores((prev) => ({ ...prev, [ability]: null }));
      return;
    }
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

  const getEncodedCodeForCurrentState = (method: "point_buy" | "rolled", name?: string): string => {
    let stats: PointBuyData | RolledData;

    if (method === "point_buy") {
      const activeScores = activeTab === "standard" ? standardScores : scores;
      const abilityScores = {} as Record<Ability, number>;
      for (const ab of ABILITIES) {
        abilityScores[ab] = (activeScores[ab] !== null ? activeScores[ab] : minPurchasable) as number;
      }

      stats = {
        method: "point_buy",
        className: activeTab === "standard" ? selectedStandardClass : selectedClass,
        backgroundName: selectedBackground,
        asiEnabled: enforceAsiFromBackground,
        abilityScores,
        backgroundBonus: bgBonuses,
        featBonus: featBonusEnabled ? manualBonuses : createAbilityRecord(0),
      };
    } else {
      const rolls = matchRolledBoxesToAssignments(rolledBoxes, standardScores);
      stats = {
        method: "rolled",
        rolls,
      };
    }

    // 2. Skills
    const proficiencies: string[] = [];
    const expertises: string[] = [];

    for (const [skillName, profState] of Object.entries(skillsState)) {
      if (profState === "prof" || profState === "expertise") {
        proficiencies.push(skillName);
      }
      if (profState === "expertise") {
        expertises.push(skillName);
      }
    }

    const savingThrows: Ability[] = [];
    for (const ab of ABILITIES) {
      if (savingThrowsState[ab] === "prof" || savingThrowsState[ab] === "expertise") {
        savingThrows.push(ab);
      }
    }

    // Determine CON modifier
    let conMod = 0;
    const activeScores = activeTab === "standard" ? standardScores : scores;
    const baseScore = method === "point_buy" ? activeScores.Constitution : standardScores.Constitution;
    if (baseScore !== null) {
      const bgBonus = bgBonuses.Constitution || 0;
      const manualBonus = manualBonuses.Constitution || 0;
      const total = baseScore + bgBonus + (featBonusEnabled ? manualBonus : 0);
      conMod = getModifier(total);
    }

    const skillsData: SkillsData = {
      isBard: (activeTab === "standard" ? selectedStandardClass : selectedClass) === "Bard",
      conMod,
      savingThrows,
      proficiencies,
      expertises,
      level,
    };

    return encodeCharacter({
      stats,
      skills: skillsData,
      metadata: {
        name,
        rollCount: method === "point_buy" ? 0 : rollCount,
      }
    });
  };

  const handleShareLink = () => {
    try {
      const isRandom = activeTab === "roll";
      if (settings.sitewide.disableSharePrompt) {
        const shareUrl = new URL(window.location.origin + window.location.pathname);
        shareUrl.pathname = STAT_TAB_ROUTES[activeTab];
        shareUrl.search = "";
        
        const code = getEncodedCodeForCurrentState(isRandom ? "rolled" : "point_buy", "");
        shareUrl.searchParams.set("code", code);
        copyToClipboard(shareUrl.toString());
        return;
      }

      setShareModalProps({
        encodedData: "",
        characterName: sharedNameRef.current || "",
        isRandomized: isRandom,
        rollMeta: isRandom ? { rolls: rollCount, timestamp: new Date().toISOString() } : undefined,
        onGenerateUrl: (name: string) => {
          const shareUrl = new URL(window.location.origin + window.location.pathname);
          shareUrl.pathname = STAT_TAB_ROUTES[activeTab];
          shareUrl.search = "";
          
          const code = getEncodedCodeForCurrentState(isRandom ? "rolled" : "point_buy", name.trim());
          shareUrl.searchParams.set("code", code);
          return shareUrl.toString();
        }
      });
      setIsShareModalOpen(true);
    } catch (e) {
      console.error("Failed to generate code:", e);
    }
  };

  const hydrateFromUrl = useCallback(() => {
    const params = new URLSearchParams(location.search);
    const codeFromUrl = params.get("code");

    if (codeFromUrl) {
      try {
        ignoreClassChangeRef.current = true;
        const decoded = decodeCharacter(codeFromUrl);

        if (decoded.metadata) {
          if (decoded.metadata.name) sharedNameRef.current = decoded.metadata.name;
          if (decoded.metadata.rollCount !== undefined) {
            sharedRollsRef.current = decoded.metadata.rollCount;
          }
          if (decoded.metadata.unixTime) {
            setSharedTimestamp(new Date(decoded.metadata.unixTime * 1000).toISOString());
          }
          if (decoded.metadata.offset) {
            setSharedTimezone(decoded.metadata.offset);
          }
        }

        // Hydrate Stats
        if (decoded.stats.method === "point_buy") {
          const pbData = decoded.stats;

          if (pbData.className && pbData.className !== "z") {
            setSelectedClass(pbData.className);
            setSelectedStandardClass(pbData.className);
          }
          if (pbData.backgroundName && pbData.backgroundName !== "z") {
            setSelectedBackground(pbData.backgroundName);
          }

          setScores(pbData.abilityScores);
          setStandardScores(pbData.abilityScores);
          setBgBonuses(pbData.backgroundBonus);

          // Feats
          const hasFeatBonus = ABILITIES.some((ab) => pbData.featBonus[ab] > 0);
          setFeatBonusEnabled(hasFeatBonus);
          setManualBonuses(pbData.featBonus);

          // System setting enforcement (Section 2.4)
          if (pbData.asiEnabled && !enforceAsiFromBackground) {
            if (activeTab === "pointbuy") {
              updatePointBuy({ enforceAsiFromBackground: true });
            } else if (activeTab === "roll") {
              updateRoll({ enforceAsiFromBackground: true });
            } else if (activeTab === "standard") {
              updateStandard({ enforceAsiFromBackground: true });
            }
          }

        } else if (decoded.stats.method === "rolled") {
          const rolledData = decoded.stats;
          const nextRolledBoxes = {} as Record<Ability, { rolls: number[]; total: number }>;
          const nextStandardScores = createAbilityRecord<number | null>(null);

          rolledData.rolls.forEach((r, idx) => {
            const ab = ABILITIES[idx];
            const rollsArr = r.roll.split("").map(Number);
            const sum = rollsArr.reduce((s, v) => s + v, 0);
            const min = Math.min(...rollsArr);
            const total = sum - min;

            nextRolledBoxes[ab] = { rolls: rollsArr, total };

            if (r.assignment !== "unassigned") {
              nextStandardScores[r.assignment] = total;
            }
          });

          setRolledBoxes(nextRolledBoxes);
          setStandardScores(nextStandardScores);
          setShowAssignPanel(true);
        }

        // Hydrate Skills and Saving Throws
        const classNameToUse = decoded.stats.method === "point_buy" ? decoded.stats.className : "";
        const activeClassData = Object.values(classes).find((c) => c.name === classNameToUse);
        const defaultSaves = (activeClassData?.savingThrows ?? []) as Ability[];

        const nextSaves: Record<Ability, "none" | "prof" | "expertise"> = {
          Strength: "none",
          Dexterity: "none",
          Constitution: "none",
          Intelligence: "none",
          Wisdom: "none",
          Charisma: "none",
        };

        const nextSkills: Record<string, "none" | "prof" | "expertise"> = {
          Athletics: "none",
          Acrobatics: "none",
          "Sleight of Hand": "none",
          Stealth: "none",
          Arcana: "none",
          History: "none",
          Investigation: "none",
          Nature: "none",
          Religion: "none",
          "Animal Handling": "none",
          Insight: "none",
          Medicine: "none",
          Perception: "none",
          Survival: "none",
          Deception: "none",
          Intimidation: "none",
          Performance: "none",
          Persuasion: "none",
        };

        // Apply class defaults (saving throws)
        defaultSaves.forEach((ability) => {
          nextSaves[ability] = "prof";
        });

        // If skills suffix exists, fully hydrate from URL (overriding defaults if present)
        if (decoded.skills) {
          const sk = decoded.skills;

          // Apply decoded saving throws (reset saves to "none" first, then apply decoded saves)
          ABILITIES.forEach((ability) => {
            nextSaves[ability] = "none";
          });
          sk.savingThrows.forEach((ability) => {
            nextSaves[ability] = "prof";
          });

          // Apply proficiencies and expertises
          sk.proficiencies.forEach((skill) => {
            nextSkills[skill] = "prof";
          });
          sk.expertises.forEach((skill) => {
            nextSkills[skill] = "expertise";
          });

          if (sk.level !== undefined) {
            setLevel(sk.level);
          }
        }

        setSavingThrowsState(nextSaves);
        setSkillsState(nextSkills);

        return; // Hydrated successfully!
      } catch (error) {
        console.error("Failed to decode share code:", error);
      }
    }
    if (!params.toString()) {
      if (activeTab === "standard") {
        setSelectedStandardClass(CHOOSE_STANDARD_CLASS);
        setStandardScores(makeUnfilledStandardScores());
      }
      return;
    }

    const classFromUrl = params.get("class");
    const matchedClass = classFromUrl
      ? classNames.find((c) => c.toLowerCase() === classFromUrl.toLowerCase())
      : null;

    if (matchedClass) {
      setSelectedClass(matchedClass);
      setSelectedStandardClass(matchedClass);
    }

    const bgFromUrl = params.get("background");
    const matchedBg = bgFromUrl
      ? backgroundNames.find((b) => b.toLowerCase() === bgFromUrl.toLowerCase())
      : null;

    if (matchedBg) {
      setSelectedBackground(matchedBg);
    }

    const scoreMinForTab = activeTab === "pointbuy" ? clampedMin : 3;
    const scoreMaxForTab = activeTab === "pointbuy" ? clampedMax : 18;
    const nextScores = makeDefaultScores(minPurchasable);
    const str = parseClampedIntParam(params.get(scoreParamKeys.Strength), scoreMinForTab, scoreMaxForTab);
    const dex = parseClampedIntParam(params.get(scoreParamKeys.Dexterity), scoreMinForTab, scoreMaxForTab);
    const con = parseClampedIntParam(params.get(scoreParamKeys.Constitution), scoreMinForTab, scoreMaxForTab);
    const int = parseClampedIntParam(params.get(scoreParamKeys.Intelligence), scoreMinForTab, scoreMaxForTab);
    const wis = parseClampedIntParam(params.get(scoreParamKeys.Wisdom), scoreMinForTab, scoreMaxForTab);
    const cha = parseClampedIntParam(params.get(scoreParamKeys.Charisma), scoreMinForTab, scoreMaxForTab);

    if (str !== null) nextScores.Strength = str;
    if (dex !== null) nextScores.Dexterity = dex;
    if (con !== null) nextScores.Constitution = con;
    if (int !== null) nextScores.Intelligence = int;
    if (wis !== null) nextScores.Wisdom = wis;
    if (cha !== null) nextScores.Charisma = cha;
    setScores(nextScores);

    if (activeTab === "standard") {
      if (matchedClass) {
        setStandardScores(nextScores);
      } else {
        setSelectedStandardClass(CHOOSE_STANDARD_CLASS);
        setStandardScores(makeUnfilledStandardScores());
      }
    } else {
      setStandardScores(nextScores);
    }

    if (activeTab === "roll") {
      const decodedRolledPool = decodeRolledPool(params.get(ROLLED_POOL_PARAM) ?? "");
      if (decodedRolledPool) {
        setRolledBoxes(decodedRolledPool);
      }

      const hasAssignedStats = ABILITIES.some(
        (ability) => params.get(scoreParamKeys[ability]) !== null,
      );
      if (decodedRolledPool || hasAssignedStats) {
        setShowAssignPanel(true);
      }
    }

    const nextBonuses = defaultBgBonuses();
    let remainingBonusPool = bgBonusPool;
    const bstr = parseClampedIntParam(params.get(backgroundBonusParamKeys.Strength), 0, BG_BONUS_MAX);
    const bdex = parseClampedIntParam(params.get(backgroundBonusParamKeys.Dexterity), 0, BG_BONUS_MAX);
    const bcon = parseClampedIntParam(params.get(backgroundBonusParamKeys.Constitution), 0, BG_BONUS_MAX);
    const bint = parseClampedIntParam(params.get(backgroundBonusParamKeys.Intelligence), 0, BG_BONUS_MAX);
    const bwis = parseClampedIntParam(params.get(backgroundBonusParamKeys.Wisdom), 0, BG_BONUS_MAX);
    const bcha = parseClampedIntParam(params.get(backgroundBonusParamKeys.Charisma), 0, BG_BONUS_MAX);

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
    }

    setBgBonuses(nextBonuses);

    const featFromUrl = params.get("feat");
    setFeatBonusEnabled(featFromUrl === "1");

    const nextManualBonuses = defaultManualBonuses();
    const mstr = parseClampedIntParam(params.get(manualBonusParamKeys.Strength), 0, MANUAL_BONUS_MAX);
    const mdex = parseClampedIntParam(params.get(manualBonusParamKeys.Dexterity), 0, MANUAL_BONUS_MAX);
    const mcon = parseClampedIntParam(params.get(manualBonusParamKeys.Constitution), 0, MANUAL_BONUS_MAX);
    const mint = parseClampedIntParam(params.get(manualBonusParamKeys.Intelligence), 0, MANUAL_BONUS_MAX);
    const mwis = parseClampedIntParam(params.get(manualBonusParamKeys.Wisdom), 0, MANUAL_BONUS_MAX);
    const mcha = parseClampedIntParam(params.get(manualBonusParamKeys.Charisma), 0, MANUAL_BONUS_MAX);

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
    enforceAsiFromBackground,
    updatePointBuy,
    updateRoll,
    updateStandard,
  ]);

  useEffect(() => {
    if (hasHydratedFromUrl.current) return;
    hasHydratedFromUrl.current = true;
    hydrateFromUrl();
  }, [hydrateFromUrl]);

  const rollAllStats = () => {
    if (isRolling) return;
    setShowAssignPanel(false);
    setRollCount((prev) => prev + 1);

    const finalRolls = {} as Record<Ability, { rolls: number[]; total: number }>;
    ABILITIES.forEach((ability) => {
      let rolls = Array.from({ length: 4 }, () => rollDie());
      if (settings.roll?.rerollOnes) {
        rolls = rolls.map((r) => (r === 1 ? rollDie() : r));
      }
      const total = computeTotalFromRolls(rolls);
      finalRolls[ability] = { rolls, total };
    });

    if (!settings.roll?.rollingAnimation) {
      setRolledBoxes(finalRolls);
      return;
    }

    setIsRolling(true);

    const duration = 800; // duration in ms
    const intervalTime = 60; // interval in ms
    const steps = duration / intervalTime;
    let currentStep = 0;

    if (rollIntervalRef.current) {
      window.clearInterval(rollIntervalRef.current);
    }

    rollIntervalRef.current = window.setInterval(() => {
      currentStep++;
      if (currentStep >= steps) {
        if (rollIntervalRef.current) {
          window.clearInterval(rollIntervalRef.current);
          rollIntervalRef.current = null;
        }
        setRolledBoxes(finalRolls);
        setIsRolling(false);
      } else {
        const tempRolls = {} as Record<Ability, { rolls: number[]; total: number }>;
        ABILITIES.forEach((ability) => {
          let rolls = Array.from({ length: 4 }, () => rollDie());
          if (settings.roll?.rerollOnes) {
            rolls = rolls.map((r) => (r === 1 ? rollDie() : r));
          }
          const total = computeTotalFromRolls(rolls);
          tempRolls[ability] = { rolls, total };
        });
        setRolledBoxes(tempRolls);
      }
    }, intervalTime);
  };

  const getRolledTotals = () => ABILITIES.map((ab) => rolledBoxes[ab].total);

  const handleShuffleAssign = () => {
    const totals = getRolledTotals();
    const shuffled = totals.slice();
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = randomInt(0, i);
      const temp = shuffled[i];
      shuffled[i] = shuffled[j];
      shuffled[j] = temp;
    }
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
    if (selectedValue === null || selectedValue === "") {
      setStandardScores((prev) => ({ ...prev, [ability]: null }));
      return;
    }
    const nextScore = Number.parseInt(selectedValue, 10);
    const pool = getRolledTotals();
    const poolCount = pool.filter((p) => p === nextScore).length;

    const usedByOthers = ABILITIES.filter(
      (ab) => ab !== ability && standardScores[ab] === nextScore,
    ).length;

    if (usedByOthers < poolCount) {
      setStandardScores((prev) => ({ ...prev, [ability]: nextScore }));
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

  const handleAssignmentReset = () => {
    setStandardScores(makeUnfilledStandardScores());
  };

  const handleRollsReset = () => {
    setRolledBoxes(
      ABILITIES.reduce((acc, ability) => {
        acc[ability] = { rolls: [0, 0, 0, 0], total: 0 };
        return acc;
      }, {} as Record<Ability, { rolls: number[]; total: number }>)
    );
    sharedRollsRef.current = null;
    sharedNameRef.current = "";
    setSharedTimestamp("");
    setSharedTimezone("");
    setRollCount(0);
    setShowAssignPanel(false);
    handleAssignmentReset();
  };

  const handleShareAssigned = () => {
    try {
      if (settings.sitewide.disableSharePrompt) {
        const shareUrl = new URL(window.location.origin + window.location.pathname);
        shareUrl.pathname = STAT_TAB_ROUTES.roll;
        shareUrl.search = "";
        
        const code = getEncodedCodeForCurrentState("rolled", "");
        shareUrl.searchParams.set("code", code);
        copyToClipboard(shareUrl.toString());
        return;
      }

      setShareModalProps({
        encodedData: "",
        characterName: sharedNameRef.current || "",
        isRandomized: true,
        rollMeta: { rolls: rollCount, timestamp: new Date().toISOString() },
        onGenerateUrl: (name: string) => {
          const shareUrl = new URL(window.location.origin + window.location.pathname);
          shareUrl.pathname = STAT_TAB_ROUTES.roll;
          shareUrl.search = "";
          
          const code = getEncodedCodeForCurrentState("rolled", name.trim());
          shareUrl.searchParams.set("code", code);
          return shareUrl.toString();
        }
      });
      setIsShareModalOpen(true);
    } catch (e) {
      console.error("Failed to generate code:", e);
    }
  };

  return {
    openSettings,
    settings,
    location,
    navigate,
    pb,
    activeTab,
    selectedClass,
    setSelectedClass,
    selectedBackground,
    scores,
    selectedStandardClass,
    setSelectedStandardClass,
    standardScores,
    bgBonuses,
    featBonusEnabled,
    setFeatBonusEnabled,
    manualBonuses,
    copied,
    rolledBoxes,
    showAssignPanel,
    remaining,
    pointPool,
    minPurchasable,
    maxPurchasable,
    clampedMin,
    clampedMax,
    bgBonusRemaining,
    bgBonusPool,
    primaryStats,
    primaryDisplay,
    bgAbilities,
    enforceAsiFromBackground,
    handleScoreChange,
    handleBgBonusChange,
    handleReset,
    handleBackgroundChange,
    handleStandardClassChange,
    handleStandardScoreChange,
    handleStandardReset,
    handleManualBonusChange,
    handleShareLink,
    isRolling,
    rollAllStats,
    getRolledTotals,
    handleShuffleAssign,
    handleAssignManually,
    handleRolledAssignChange,
    handleAssignmentReset,
    handleShareAssigned,
    handleRollsReset,
    rollCount,
    level,
    setLevel,
    skillsState,
    setSkillsState,
    savingThrowsState,
    setSavingThrowsState,
    handleSkillsReset,
    isShareModalOpen,
    setIsShareModalOpen,
    shareModalProps,
    sharedName: sharedNameRef.current,
    sharedRolls: sharedRollsRef.current,
    sharedTimestamp,
    sharedTimezone,
  };
}
