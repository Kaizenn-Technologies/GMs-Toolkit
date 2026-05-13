import {
  createContext,
  useContext,
  useState,
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

export interface AppSettings {
  pointBuy: PointBuySettings;
  roll: RollSettings;
  hp: HpSettings;
}

export interface RollSettings {
  rerollOnes: boolean;
  sortDescending: boolean;
  colorDice: boolean;
}

export interface HpSettings {
  advanceShareMenu: boolean;
  showRollCounter: boolean;
}

// ─── Defaults ─────────────────────────────────────────────────────────────────

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
};

export const DEFAULT_HP_SETTINGS: HpSettings = {
  advanceShareMenu: false,
  showRollCounter: true,
};

// ─── Context ──────────────────────────────────────────────────────────────────

interface SettingsContextValue {
  settings: AppSettings;
  updatePointBuy: (patch: Partial<PointBuySettings>) => void;
  updateRoll: (patch: Partial<RollSettings>) => void;
  updateHp: (patch: Partial<HpSettings>) => void;
  resetPointBuy: () => void;
  resetRoll: () => void;
  resetHp: () => void;
  isOpen: boolean;
  openSettings: () => void;
  closeSettings: () => void;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>({
    pointBuy: { ...DEFAULT_POINT_BUY_SETTINGS },
    roll: { ...DEFAULT_ROLL_SETTINGS },
    hp: { ...DEFAULT_HP_SETTINGS },
  });
  const [isOpen, setIsOpen] = useState(false);

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

  return (
    <SettingsContext.Provider
      value={{
        settings,
        updatePointBuy,
        updateRoll,
        updateHp,
        resetPointBuy,
        resetRoll,
        resetHp,
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
