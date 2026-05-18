import { useState, useMemo, useEffect, useRef } from "react";
import type { ClassSelection } from "@/types";
import { classNames } from "@/lib/classes";
import { calculateHP } from "@/lib/calculations";
import { CUSTOM_CLASS_NAME, CUSTOM_HIT_DIE_OPTIONS } from "@/lib/constants";
import {
  buildCoreData,
  buildRollEntries,
  classSelectionsToClassInput,
} from "@/utils/coreDataEncoder";
import { decodedClassesToSelections, parseCoreData } from "@/utils/coreDataDecoder";
import { useSettings } from "@/contexts/SettingsContext";
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";

export const hpClassOptions = [CUSTOM_CLASS_NAME, ...classNames];
const INITIAL_CLASS_SELECTIONS: ClassSelection[] = [{ id: "1", className: "Wizard", level: 1 }];

function generateRolledValues(classSelections: ClassSelection[]): number[] {
  return calculateHP(classSelections, 0, false, false, false).rolls ?? [];
}

function buildClassComboKey(classSelections: ClassSelection[]): string {
  const normalized = [...classSelections]
    .map((selection) => {
      const customDie =
        selection.className === CUSTOM_CLASS_NAME
          ? String(selection.customHitDie ?? CUSTOM_HIT_DIE_OPTIONS[0])
          : "";
      return `${selection.className}:${selection.level}:${customDie}`;
    })
    .sort();

  return normalized.join("|");
}

function getInitialHpState() {
  const fallback = {
    classSelections: INITIAL_CLASS_SELECTIONS,
    conModifier: 0,
    tough: false,
    hillDwarf: false,
    activeTab: "average" as const,
    rolledValues: generateRolledValues(INITIAL_CLASS_SELECTIONS),
    initialRerolls: 0,
    sharedName: "",
  };

  try {
    const params = new URLSearchParams(window.location.search);
    const core = params.get("core");
    if (!core) return fallback;

    const decoded = parseCoreData(core);
    const nextSelections = decodedClassesToSelections(decoded.classes);
    const classSelections = nextSelections.length > 0 ? nextSelections : INITIAL_CLASS_SELECTIONS;
    const hasRolls = decoded.rolls.length > 0;

    return {
      classSelections,
      conModifier: decoded.conMod,
      tough: decoded.tough,
      hillDwarf: decoded.hillDwarf,
      activeTab: hasRolls ? ("rolled" as const) : ("average" as const),
      rolledValues: hasRolls
        ? decoded.rolls.map((entry) => entry.value)
        : generateRolledValues(classSelections),
      initialRerolls: decoded.metadata?.rerolls ?? 0,
      sharedName: decoded.metadata?.name ?? "",
    };
  } catch {
    return fallback;
  }
}

export function useHpCalculator() {
  const initialState = useMemo(() => getInitialHpState(), []);
  const { settings, openSettings } = useSettings();
  const [classSelections, setClassSelections] = useState<ClassSelection[]>(initialState.classSelections);
  const [conModifier, setConModifier] = useState(initialState.conModifier);
  const [tough, setTough] = useState(initialState.tough);
  const [hillDwarf, setHillDwarf] = useState(initialState.hillDwarf);
  const [activeTab, setActiveTab] = useState<"average" | "rolled">(initialState.activeTab);
  const [rolledValues, setRolledValues] = useState<number[]>(initialState.rolledValues);
  const { copied } = useCopyToClipboard();
  
  // Share Modal States
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [shareModalProps, setShareModalProps] = useState<any>(null);
  
  const [isRolling, setIsRolling] = useState(false);
  const rollIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (rollIntervalRef.current) {
        window.clearInterval(rollIntervalRef.current);
      }
    };
  }, []);
  
  const showRollCounter = settings.hp.showRollCounter;
  
  const initialComboKey = useMemo(
    () => buildClassComboKey(initialState.classSelections),
    [initialState.classSelections]
  );
  
  const [rerollCountsByCombo, setRerollCountsByCombo] = useState<Record<string, number>>(
    initialState.initialRerolls > 0 ? { [initialComboKey]: initialState.initialRerolls } : {}
  );
  
  const currentComboKey = useMemo(() => buildClassComboKey(classSelections), [classSelections]);
  const rerollCountForCurrentCombo = rerollCountsByCombo[currentComboKey] ?? 0;
  const sharedNameFromLink = initialState.sharedName.trim();
  const shouldShowMetaPanel = sharedNameFromLink.length > 0 || showRollCounter;

  const addClassSelection = () => {
    const newId = (Math.max(...classSelections.map((c) => parseInt(c.id)), 0) + 1).toString();
    const availableClass = hpClassOptions.find(name => !classSelections.some(c => c.className === name)) || "Wizard";

    const nextSelections = [
      ...classSelections,
      { id: newId, className: availableClass, level: 1 },
    ];
    setClassSelections(nextSelections);
    setRolledValues(generateRolledValues(nextSelections));
  };

  const handleResetClassSelections = () => {
    setClassSelections(INITIAL_CLASS_SELECTIONS);
    setRolledValues(generateRolledValues(INITIAL_CLASS_SELECTIONS));
    setConModifier(0);
    setRerollCountsByCombo({});
    setTough(false);
    setHillDwarf(false);
  };

  const removeClassSelection = (id: string) => {
    if (classSelections.length > 1) {
      const nextSelections = classSelections.filter((c) => c.id !== id);
      setClassSelections(nextSelections);
      setRolledValues(generateRolledValues(nextSelections));
    }
  };

  const updateClassSelection = (
    id: string,
    field: "className" | "level" | "customHitDie",
    value: string | number
  ) => {
    const nextSelections = classSelections.map((c) =>
      c.id === id
        ? field === "className"
          ? {
            ...c,
            className: value as string,
            customHitDie:
              value === CUSTOM_CLASS_NAME
                ? (c.customHitDie ?? CUSTOM_HIT_DIE_OPTIONS[0])
                : undefined,
          }
          : { ...c, [field]: value }
        : c
    );
    setClassSelections(nextSelections);
    setRolledValues(generateRolledValues(nextSelections));
  };

  const result = useMemo(
    () => calculateHP(classSelections, conModifier, tough, hillDwarf, true),
    [classSelections, conModifier, tough, hillDwarf]
  );
  
  const rolledResult = useMemo(
    () => calculateHP(classSelections, conModifier, tough, hillDwarf, false, rolledValues),
    [classSelections, conModifier, tough, hillDwarf, rolledValues]
  );

  const diff = rolledResult.totalHP - result.totalHP;
  const threshold = Math.abs(conModifier) + (tough ? 2 : 0) + (hillDwarf ? 1 : 0);

  let rollColorClass = "text-muted-foreground";
  let rollIcon = null;

  if (isRolling) {
    rollColorClass = "text-muted-foreground";
    rollIcon = null;
  } else if (diff > threshold) {
    rollColorClass = "text-[#00c93cff] dark:text-[#10ff58ff]";
    rollIcon = "▲";
  } else if (diff < -threshold) {
    rollColorClass = "text-[#ff3d3d]";
    rollIcon = "▼";
  }

  const handleRollAgain = () => {
    if (isRolling) return;
    setActiveTab("rolled");

    const finalRolledValues = generateRolledValues(classSelections);

    setRerollCountsByCombo((prev) => ({
      ...prev,
      [currentComboKey]: (prev[currentComboKey] ?? 0) + 1,
    }));

    if (!settings.hp.rollingAnimation) {
      setRolledValues(finalRolledValues);
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
        setRolledValues(finalRolledValues);
        setIsRolling(false);
      } else {
        setRolledValues(generateRolledValues(classSelections));
      }
    }, intervalTime);
  };

  const buildShareableCoreData = ({
    name,
    includeRolls,
  }: {
    name: string;
    includeRolls: boolean;
  }): string => {
    const encodedRolls = includeRolls
      ? buildRollEntries(classSelections, rolledValues)
      : undefined;

    return buildCoreData({
      classes: classSelectionsToClassInput(classSelections),
      conMod: conModifier,
      tough,
      hillDwarf,
      rolls: encodedRolls,
      metadata: {
        version: "v1",
        unixTime: Math.floor(Date.now() / 1000),
        rerolls: rerollCountForCurrentCombo,
        name,
      },
    });
  };

  const handleShareLink = (shareMode: "average" | "rolled") => {
    try {
      const isRandom = shareMode === "rolled";
      setShareModalProps({
        encodedData: "",
        characterName: sharedNameFromLink || "",
        isRandomized: isRandom,
        rollMeta: isRandom ? { rolls: rerollCountForCurrentCombo, timestamp: new Date().toISOString() } : undefined,
        onGenerateUrl: (name: string) => {
          const shareUrl = new URL(window.location.href);
          shareUrl.search = "";
          shareUrl.searchParams.set(
            "core",
            buildShareableCoreData({
              name: name.trim(),
              includeRolls: isRandom,
            })
          );
          return shareUrl.toString();
        }
      });
      setIsShareModalOpen(true);
    } catch (e) {
      console.error("Failed to generate HP share link:", e);
    }
  };

  return {
    classSelections,
    conModifier,
    setConModifier,
    tough,
    setTough,
    hillDwarf,
    setHillDwarf,
    activeTab,
    setActiveTab,
    result,
    rolledResult,
    diff,
    rollColorClass,
    rollIcon,
    copied,
    shouldShowMetaPanel,
    sharedNameFromLink,
    showRollCounter,
    rerollCountForCurrentCombo,
    openSettings,
    addClassSelection,
    handleResetClassSelections,
    removeClassSelection,
    updateClassSelection,
    handleRollAgain,
    handleShareLink,
    isRolling,
    isShareModalOpen,
    setIsShareModalOpen,
    shareModalProps,
  };
}
