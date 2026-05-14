/**
 * Settings overlay for the D&D Stat Generator.
 *
 * Renders as a full-screen backdrop with a slide-in panel.
 */

import type { ReactNode } from "react";
import { X, SlidersHorizontal, RotateCcw, Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { StepperInput } from "@/components/ui/stepper-input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSettings } from "@/contexts/SettingsContext";

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

type SettingsTabKey = "pointbuy" | "roll" | "standard" | "hp" | "dice";

interface SettingsOverlayProps {
  enabledTabs?: SettingsTabKey[];
}

export function SettingsOverlay({
  enabledTabs = ["pointbuy", "roll", "standard"],
}: SettingsOverlayProps) {
  const {
    isOpen,
    closeSettings,
    resetSitewide,
    resetPointBuy,
    resetRoll,
    resetHp,
    resetDiceRoller,
    settings,
    updateSitewide,
    updateRoll,
    updateHp,
    updateDiceRoller,
  } = useSettings();
  const defaultTab = enabledTabs[0] ?? "pointbuy";
  const shouldShowPointBuy = enabledTabs.includes("pointbuy");
  const shouldShowRoll = enabledTabs.includes("roll");
  const shouldShowStandard = enabledTabs.includes("standard");
  const shouldShowHp = enabledTabs.includes("hp");
  const shouldShowDice = enabledTabs.includes("dice");

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
          {/* Sitewide Settings Section */}
          <div className="px-6 py-4 border-b border-border/50 bg-muted/30">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">
              Sitewide Settings
            </h3>
            <div className="space-y-1 divide-y divide-border/40">
              <SettingRow
                label="Appearance"
                description={settings.sitewide.darkMode ? "Dark Mode" : "Light Mode"}
              >
                <div className="flex items-center gap-2 bg-background border rounded-lg p-1">
                  <Button
                    variant={!settings.sitewide.darkMode ? "secondary" : "ghost"}
                    size="sm"
                    className="h-7 px-2 text-xs gap-1"
                    onClick={() => updateSitewide({ darkMode: false })}
                  >
                    <Sun className="w-3.5 h-3.5" />
                    Light
                  </Button>
                  <Button
                    variant={settings.sitewide.darkMode ? "secondary" : "ghost"}
                    size="sm"
                    className="h-7 px-2 text-xs gap-1"
                    onClick={() => updateSitewide({ darkMode: true })}
                  >
                    <Moon className="w-3.5 h-3.5" />
                    Dark
                  </Button>
                </div>
              </SettingRow>

              <SettingRow
                label="Show Page Titles"
                description="Show or hide the title and description at the top of each page."
              >
                <Switch
                  checked={settings.sitewide.showHeader}
                  onCheckedChange={(v) => updateSitewide({ showHeader: v })}
                />
              </SettingRow>

              <SettingRow
                label="Show Footer"
                description="Show or hide the sitewide footer."
              >
                <Switch
                  checked={settings.sitewide.showFooter}
                  onCheckedChange={(v) => updateSitewide({ showFooter: v })}
                />
              </SettingRow>
            </div>
          </div>

          <Tabs defaultValue={defaultTab} className="h-full flex flex-col">
            <div className="px-6 pt-4 shrink-0">
              <TabsList
                className={`grid w-full ${
                  enabledTabs.length <= 1
                    ? "grid-cols-1"
                    : enabledTabs.length === 2
                      ? "grid-cols-2"
                      : enabledTabs.length === 3
                        ? "grid-cols-3"
                        : enabledTabs.length === 4
                          ? "grid-cols-4"
                          : "grid-cols-5"
                }`}
              >
                {shouldShowPointBuy && (
                  <TabsTrigger value="pointbuy" className="gap-1.5">
                    Point Buy
                  </TabsTrigger>
                )}
                {shouldShowRoll && (
                  <TabsTrigger value="roll" className="gap-1.5">
                    Roll
                  </TabsTrigger>
                )}
                {shouldShowStandard && (
                  <TabsTrigger value="standard" className="gap-1.5">
                    Standard
                  </TabsTrigger>
                )}
                {shouldShowHp && (
                  <TabsTrigger value="hp" className="gap-1.5">
                    HP
                  </TabsTrigger>
                )}
                {shouldShowDice && (
                  <TabsTrigger value="dice" className="gap-1.5">
                    Dice
                  </TabsTrigger>
                )}
              </TabsList>
            </div>

            {/* Point Buy */}
            {shouldShowPointBuy && (
              <TabsContent value="pointbuy" className="flex-1 px-6 pb-6 mt-0 pt-2">
                <PointBuySettingsPanel />
              </TabsContent>
            )}

            {/* Roll settings */}
            {shouldShowRoll && (
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
            )}

            {/* Standard — placeholder */}
            {shouldShowStandard && (
              <TabsContent value="standard" className="flex-1 px-6 pb-6 mt-0 pt-2">
                <div className="flex flex-col items-center justify-center h-48 gap-3 text-muted-foreground">
                  <span className="text-4xl opacity-30">📋</span>
                  <p className="text-sm">Standard Array settings — coming soon!</p>
                </div>
              </TabsContent>
            )}

            {shouldShowHp && (
              <TabsContent value="hp" className="flex-1 px-6 pb-6 mt-0 pt-2">
                <div className="space-y-2">
                  <SettingRow
                    label="Advance Share Menu"
                    description="Prompt for character name before copying a share link."
                  >
                    <Switch
                      checked={settings.hp.advanceShareMenu}
                      onCheckedChange={(v) => updateHp({ advanceShareMenu: v })}
                    />
                  </SettingRow>

                  <SettingRow
                    label="Show Roll Counter"
                    description="Show reroll count in the rolled result panel."
                  >
                    <Switch
                      checked={settings.hp.showRollCounter}
                      onCheckedChange={(v) => updateHp({ showRollCounter: v })}
                    />
                  </SettingRow>
                </div>
              </TabsContent>
            )}

            {shouldShowDice && (
              <TabsContent value="dice" className="flex-1 px-6 pb-6 mt-0 pt-2">
                <div className="space-y-2">
                  <SettingRow
                    label="Manual Notation"
                    description="Enable the manual dice notation input field."
                  >
                    <Switch
                      checked={settings.diceRoller.manualNotation}
                      onCheckedChange={(v) => updateDiceRoller({ manualNotation: v })}
                    />
                  </SettingRow>

                  <SettingRow
                    label="Auto-clear Logs"
                    description="Automatically clear roll history on page refresh."
                  >
                    <Switch
                      checked={settings.diceRoller.autoClearLogs}
                      onCheckedChange={(v) => updateDiceRoller({ autoClearLogs: v })}
                    />
                  </SettingRow>
                </div>
              </TabsContent>
            )}
          </Tabs>
        </div>

        {/* Footer */}
        <div className="shrink-0 px-6 py-4 border-t border-border flex items-center justify-between gap-3">
          <Button
            variant="secondary"
            size="sm"
            className="text-muted-foreground hover:text-foreground"
            onClick={() => {
              resetSitewide();
              if (shouldShowPointBuy) resetPointBuy();
              if (shouldShowRoll) resetRoll();
              if (shouldShowHp) resetHp();
              if (shouldShowDice) resetDiceRoller();
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
