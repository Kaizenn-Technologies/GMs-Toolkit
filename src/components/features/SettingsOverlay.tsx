/**
 * Settings context + overlay for the D&D Stat Generator.
 *
 * Provides a React context so any descendant can read/write settings,
 * and exports <SettingsOverlay> which renders as a full-screen backdrop
 * with a slide-in panel.
 */

import {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from "react";
import { X, SlidersHorizontal, Dice5, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { StepperInput } from "@/components/ui/stepper-input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
}

export interface RollSettings {
  rerollOnes: boolean;
  sortDescending: boolean;
  colorDice: boolean;
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

// ─── Context ──────────────────────────────────────────────────────────────────

interface SettingsContextValue {
  settings: AppSettings;
  updatePointBuy: (patch: Partial<PointBuySettings>) => void;
  updateRoll: (patch: Partial<RollSettings>) => void;
  resetPointBuy: () => void;
  isOpen: boolean;
  openSettings: () => void;
  closeSettings: () => void;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>({
    pointBuy: { ...DEFAULT_POINT_BUY_SETTINGS },
    roll: { ...DEFAULT_ROLL_SETTINGS },
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

  const resetPointBuy = () =>
    setSettings((prev) => ({
      ...prev,
      pointBuy: { ...DEFAULT_POINT_BUY_SETTINGS },
    }));

  return (
    <SettingsContext.Provider
      value={{
        settings,
        updatePointBuy,
        updateRoll,
        resetPointBuy,
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

// ─── Helpers ──────────────────────────────────────────────────────────────────

function SettingRow({
  label,
  description,
  children,
}: {
  label: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <div className="min-w-0">
        <p className="text-sm font-medium leading-none">{label}</p>
        {description && (
          <p className="text-xs text-muted-foreground mt-1 leading-snug">
            {description}
          </p>
        )}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

function SectionDivider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2 py-2">
      <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        {label}
      </span>
      <div className="flex-1 h-px bg-border" />
    </div>
  );
}

// ─── Point Buy settings panel ─────────────────────────────────────────────────

function PointBuySettingsPanel() {
  const { settings, updatePointBuy } = useSettings();
  const pb = settings.pointBuy;

  return (
    <div className="space-y-1 divide-y divide-border/60">
      <SectionDivider label="Point Pool" />

      <SettingRow
        label="Point Budget"
        description="Total points available to distribute across abilities."
      >
        <StepperInput
          className="w-32"
          value={pb.pointPool}
          min={1}
          max={99}
          onChange={(v) => updatePointBuy({ pointPool: v })}
        />
      </SettingRow>

      <SectionDivider label="Score Limits" />

      <SettingRow
        label="Max Purchasable Score"
        description="The highest base score you can buy before bonuses."
      >
        <StepperInput
          className="w-32"
          value={pb.maxPurchasable}
          min={pb.minPurchasable + 1}
          max={18}
          onChange={(v) => updatePointBuy({ maxPurchasable: v })}
        />
      </SettingRow>

      <SettingRow
        label="Min Purchasable Score"
        description="The lowest base score you can buy."
      >
        <StepperInput
          className="w-32"
          value={pb.minPurchasable}
          min={3}
          max={pb.maxPurchasable - 1}
          onChange={(v) => updatePointBuy({ minPurchasable: v })}
        />
      </SettingRow>

      <SectionDivider label="Background Bonus" />

      <SettingRow
        label="Background Point Pool"
        description="Points to distribute as background ability bonuses."
      >
        <StepperInput
          className="w-32"
          value={pb.bgBonusPool}
          min={0}
          max={20}
          onChange={(v) => updatePointBuy({ bgBonusPool: v })}
        />
      </SettingRow>

      <SettingRow
        label="Enforce ASI from Background"
        description={
          pb.enforceAsiFromBackground
            ? "Bonus steppers only appear on the background's designated abilities."
            : "Bonus steppers appear on every ability regardless of background."
        }
      >
        <Switch
          checked={pb.enforceAsiFromBackground}
          onCheckedChange={(v) => updatePointBuy({ enforceAsiFromBackground: v })}
        />
      </SettingRow>
    </div>
  );
}

// ─── Overlay ──────────────────────────────────────────────────────────────────

export function SettingsOverlay() {
  const { isOpen, closeSettings, resetPointBuy, settings, updateRoll } = useSettings();

  if (!isOpen) return null;

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex justify-end"
      role="dialog"
      aria-modal="true"
      aria-label="Settings"
    >
      {/* Click-away area */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={closeSettings}
      />

      {/* Panel */}
      <div
        className={[
          "relative z-10 flex flex-col w-full max-w-md",
          "bg-background border-l border-border shadow-2xl",
          "animate-in slide-in-from-right duration-300",
        ].join(" ")}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold">Settings</h2>
          </div>
          <Button variant="ghost" size="icon" onClick={closeSettings} aria-label="Close settings">
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Tabbed body */}
        <div className="flex-1 overflow-y-auto">
          <Tabs defaultValue="pointbuy" className="h-full flex flex-col">
            <div className="px-6 pt-4 shrink-0">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="pointbuy" className="gap-1.5">
                  Point Buy
                </TabsTrigger>
                <TabsTrigger value="roll" className="gap-1.5">
                  Roll
                </TabsTrigger>
                <TabsTrigger value="standard" className="gap-1.5">
                  Standard
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Point Buy */}
            <TabsContent value="pointbuy" className="flex-1 px-6 pb-6 mt-0 pt-2">
              <PointBuySettingsPanel />
            </TabsContent>

            {/* Roll settings */}
            <TabsContent value="roll" className="flex-1 px-6 pb-6 mt-0 pt-2">
              <div className="space-y-2">
                <SettingRow
                  label="Reroll 1s"
                  description="If enabled, any die that comes up 1 will be rerolled once."
                >
                  <Switch
                    checked={settings.roll.rerollOnes}
                    onCheckedChange={(v) => updateRoll({ rerollOnes: v })}
                  />
                </SettingRow>

                <SettingRow
                  label="Sort dice roll"
                  description="Display dice in descending order when enabled."
                >
                  <Switch
                    checked={settings.roll.sortDescending}
                    onCheckedChange={(v) => updateRoll({ sortDescending: v })}
                  />
                </SettingRow>

                <SettingRow
                  label="Color dice roll"
                  description="Highlight 1s in red and 6s in green in the dice display."
                >
                  <Switch
                    checked={settings.roll.colorDice}
                    onCheckedChange={(v) => updateRoll({ colorDice: v })}
                  />
                </SettingRow>
              </div>
            </TabsContent>

            {/* Standard — placeholder */}
            <TabsContent value="standard" className="flex-1 px-6 pb-6 mt-0 pt-2">
              <div className="flex flex-col items-center justify-center h-48 gap-3 text-muted-foreground">
                <span className="text-4xl opacity-30">📋</span>
                <p className="text-sm">Standard Array settings — coming soon!</p>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Footer */}
        <div className="shrink-0 px-6 py-4 border-t border-border flex items-center justify-between gap-3">
          <Button
            variant="secondary"
            size="sm"
            className="text-muted-foreground hover:text-foreground"
            onClick={() => {
              resetPointBuy();
              updateRoll({ rerollOnes: DEFAULT_ROLL_SETTINGS.rerollOnes, sortDescending: DEFAULT_ROLL_SETTINGS.sortDescending, colorDice: DEFAULT_ROLL_SETTINGS.colorDice });
            }}
          >
            <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
            Reset to defaults
          </Button>
          <Button variant="outline" size="sm" onClick={closeSettings}>
            Done
          </Button>
        </div>
      </div>
    </div>
  );
}
