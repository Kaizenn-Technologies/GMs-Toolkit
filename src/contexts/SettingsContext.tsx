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
}

export interface AppSettings {
  sitewide: SitewideSettings;
  pointBuy: PointBuySettings;
  roll: RollSettings;
  hp: HpSettings;
  diceRoller: DiceRollerSettings;
}

export interface RollSettings {
  rerollOnes: boolean;
  sortDescending: boolean;
  colorDice: boolean;
  rollingAnimation: boolean;
}

export interface HpSettings {
  advanceShareMenu: boolean;
  showRollCounter: boolean;
  rollingAnimation: boolean;
}

// ─── Defaults ─────────────────────────────────────────────────────────────────

export const DEFAULT_SITEWIDE_SETTINGS: SitewideSettings = {
  darkMode: true,
  showHeader: true,
  showFooter: true,
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
};

export const DEFAULT_HP_SETTINGS: HpSettings = {
  advanceShareMenu: false,
  showRollCounter: true,
  rollingAnimation: true,
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
  updateHp: (patch: Partial<HpSettings>) => void;
  updateDiceRoller: (patch: Partial<DiceRollerSettings>) => void;
  resetSitewide: () => void;
  resetPointBuy: () => void;
  resetRoll: () => void;
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
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse saved settings", e);
      }
    }
    return {
      sitewide: { ...DEFAULT_SITEWIDE_SETTINGS },
      pointBuy: { ...DEFAULT_POINT_BUY_SETTINGS },
      roll: { ...DEFAULT_ROLL_SETTINGS },
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
        updateHp,
        updateDiceRoller,
        resetSitewide,
        resetPointBuy,
        resetRoll,
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

