import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PointBuySettings {
  /** Total points available to spend */
  pointPool: number;
  /** Highest score purchasable via point buy */
  maxPurchasable: number;
  /** Lowest score purchasable via point buy */
  minPurchasable: number;
  /** Total background bonus points to distribute */
  bgBonusPool: number;
  /**
   * When true:  background bonus steppers only appear on the background's
   *             designated abilities.
   * When false: bonus steppers appear on every ability.
   */
  enforceAsiFromBackground: boolean;
}

export interface DiceRollerSettings {
  manualNotation: boolean;
  autoClearLogs: boolean;
  daggerheartMode: boolean;
}

export interface SitewideSettings {
  darkMode: boolean;
  showHeader: boolean;
  showFooter: boolean;
  showSkills: boolean;
  showProgression: boolean;
  disableSharePrompt: boolean;
  enforceClassSkills: boolean;
  maximizeSpace: boolean;
}

export interface AppSettings {
  sitewide: SitewideSettings;
  pointBuy: PointBuySettings;
  roll: RollSettings;
  standard: StandardSettings;
  hp: HpSettings;
  diceRoller: DiceRollerSettings;
}

export interface StandardSettings {
  bgBonusPool: number;
  enforceAsiFromBackground: boolean;
}

export interface RollSettings {
  rerollOnes: boolean;
  sortDescending: boolean;
  colorDice: boolean;
  rollingAnimation: boolean;
  diceShake: boolean;
  bgBonusPool: number;
  enforceAsiFromBackground: boolean;
}

export interface HpSettings {
  showRollCounter: boolean;
  rollingAnimation: boolean;
  showBreakdown: boolean;
}

// ─── Defaults ─────────────────────────────────────────────────────────────────

export const DEFAULT_SITEWIDE_SETTINGS: SitewideSettings = {
  darkMode: true,
  showHeader: true,
  showFooter: true,
  showSkills: true,
  showProgression: true,
  disableSharePrompt: false,
  enforceClassSkills: true,
  maximizeSpace: false,
};

export const DEFAULT_POINT_BUY_SETTINGS: PointBuySettings = {
  pointPool: 27,
  maxPurchasable: 15,
  minPurchasable: 8,
  bgBonusPool: 3,
  enforceAsiFromBackground: true,
};

export const DEFAULT_ROLL_SETTINGS: RollSettings = {
  rerollOnes: false,
  sortDescending: true,
  colorDice: true,
  rollingAnimation: true,
  diceShake: true,
  bgBonusPool: 3,
  enforceAsiFromBackground: true,
};

export const DEFAULT_STANDARD_SETTINGS: StandardSettings = {
  bgBonusPool: 3,
  enforceAsiFromBackground: true,
};

export const DEFAULT_HP_SETTINGS: HpSettings = {
  showRollCounter: true,
  rollingAnimation: true,
  showBreakdown: true,
};

export const DEFAULT_DICE_ROLLER_SETTINGS: DiceRollerSettings = {
  manualNotation: true,
  autoClearLogs: false,
  daggerheartMode: false,
};

// ─── Context ──────────────────────────────────────────────────────────────────

interface SettingsContextValue {
  settings: AppSettings;
  updateSitewide: (patch: Partial<SitewideSettings>) => void;
  updatePointBuy: (patch: Partial<PointBuySettings>) => void;
  updateRoll: (patch: Partial<RollSettings>) => void;
  updateStandard: (patch: Partial<StandardSettings>) => void;
  updateHp: (patch: Partial<HpSettings>) => void;
  updateDiceRoller: (patch: Partial<DiceRollerSettings>) => void;
  resetSitewide: () => void;
  resetPointBuy: () => void;
  resetRoll: () => void;
  resetStandard: () => void;
  resetHp: () => void;
  resetDiceRoller: () => void;
  isOpen: boolean;
  openSettings: () => void;
  closeSettings: () => void;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(() => {
    // Try to load from localStorage if available, or use defaults
    const saved = localStorage.getItem("dnd_tools_settings");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          sitewide: { ...DEFAULT_SITEWIDE_SETTINGS, ...parsed.sitewide },
          pointBuy: { ...DEFAULT_POINT_BUY_SETTINGS, ...parsed.pointBuy },
          roll: { ...DEFAULT_ROLL_SETTINGS, ...parsed.roll },
          standard: { ...DEFAULT_STANDARD_SETTINGS, ...parsed.standard },
          hp: { ...DEFAULT_HP_SETTINGS, ...parsed.hp },
          diceRoller: { ...DEFAULT_DICE_ROLLER_SETTINGS, ...parsed.diceRoller },
        };
      } catch (e) {
        console.error("Failed to parse saved settings", e);
      }
    }
    return {
      sitewide: { ...DEFAULT_SITEWIDE_SETTINGS },
      pointBuy: { ...DEFAULT_POINT_BUY_SETTINGS },
      roll: { ...DEFAULT_ROLL_SETTINGS },
      standard: { ...DEFAULT_STANDARD_SETTINGS },
      hp: { ...DEFAULT_HP_SETTINGS },
      diceRoller: { ...DEFAULT_DICE_ROLLER_SETTINGS },
    };
  });

  const [isOpen, setIsOpen] = useState(false);

  // Persistence
  useEffect(() => {
    localStorage.setItem("dnd_tools_settings", JSON.stringify(settings));
  }, [settings]);

  // Dark mode effect
  useEffect(() => {
    if (settings.sitewide.darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [settings.sitewide.darkMode]);

  const updateSitewide = (patch: Partial<SitewideSettings>) =>
    setSettings((prev) => ({
      ...prev,
      sitewide: { ...prev.sitewide, ...patch },
    }));

  const updatePointBuy = (patch: Partial<PointBuySettings>) =>
    setSettings((prev) => ({
      ...prev,
      pointBuy: { ...prev.pointBuy, ...patch },
    }));

  const updateRoll = (patch: Partial<RollSettings>) =>
    setSettings((prev) => ({
      ...prev,
      roll: { ...prev.roll, ...patch },
    }));

  const updateStandard = (patch: Partial<StandardSettings>) =>
    setSettings((prev) => ({
      ...prev,
      standard: { ...prev.standard, ...patch },
    }));

  const updateHp = (patch: Partial<HpSettings>) =>
    setSettings((prev) => ({
      ...prev,
      hp: { ...prev.hp, ...patch },
    }));

  const updateDiceRoller = (patch: Partial<DiceRollerSettings>) =>
    setSettings((prev) => ({
      ...prev,
      diceRoller: { ...prev.diceRoller, ...patch },
    }));

  const resetSitewide = () =>
    setSettings((prev) => ({
      ...prev,
      sitewide: { ...DEFAULT_SITEWIDE_SETTINGS },
    }));

  const resetPointBuy = () =>
    setSettings((prev) => ({
      ...prev,
      pointBuy: { ...DEFAULT_POINT_BUY_SETTINGS },
    }));

  const resetRoll = () =>
    setSettings((prev) => ({
      ...prev,
      roll: { ...DEFAULT_ROLL_SETTINGS },
    }));

  const resetStandard = () =>
    setSettings((prev) => ({
      ...prev,
      standard: { ...DEFAULT_STANDARD_SETTINGS },
    }));

  const resetHp = () =>
    setSettings((prev) => ({
      ...prev,
      hp: { ...DEFAULT_HP_SETTINGS },
    }));

  const resetDiceRoller = () =>
    setSettings((prev) => ({
      ...prev,
      diceRoller: { ...DEFAULT_DICE_ROLLER_SETTINGS },
    }));

  return (
    <SettingsContext.Provider
      value={{
        settings,
        updateSitewide,
        updatePointBuy,
        updateRoll,
        updateStandard,
        updateHp,
        updateDiceRoller,
        resetSitewide,
        resetPointBuy,
        resetRoll,
        resetStandard,
        resetHp,
        resetDiceRoller,
        isOpen,
        openSettings: () => setIsOpen(true),
        closeSettings: () => setIsOpen(false),
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings must be used inside <SettingsProvider>");
  return ctx;
}

