/**
 * Settings overlay for the D&D Ability Score.
 *
 * Renders as a full-screen backdrop with a slide-in panel.
 */

import { useState, type ReactNode } from "react";
import { X, SlidersHorizontal, RotateCcw, Sun, Moon, ChevronDown, ChevronRight, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { StepperInput } from "@/components/ui/stepper-input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSettings } from "@/contexts/SettingsContext";
import { useLocation } from "react-router-dom";

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
          className="w-28 h-8"
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
          className="w-28 h-8"
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
          className="w-28 h-8"
          value={pb.minPurchasable}
          min={3}
          max={pb.maxPurchasable - 1}
          onChange={(v) => updatePointBuy({ minPurchasable: v })}
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
    resetStandard,
    resetHp,
    resetDiceRoller,
  } = useSettings();
  const location = useLocation();

  const getInitialTab = (): SettingsTabKey => {
    const path = location.pathname;
    if (path.includes("/stat-generator/pointbuy")) return "pointbuy";
    if (path.includes("/stat-generator/rolled")) return "roll";
    if (path.includes("/stat-generator/standard-array")) return "standard";
    if (path.includes("/hp-calculator")) return "hp";
    if (path.includes("/dm-dice-roller")) return "dice";
    return enabledTabs[0] ?? "pointbuy";
  };

  const initialTab = getInitialTab();
  const shouldShowPointBuy = enabledTabs.includes("pointbuy");
  const shouldShowRoll = enabledTabs.includes("roll");
  const shouldShowStandard = enabledTabs.includes("standard");
  const shouldShowHp = enabledTabs.includes("hp");
  const shouldShowDice = enabledTabs.includes("dice");

  const isAbilityScorePage = shouldShowPointBuy || shouldShowRoll || shouldShowStandard;
  const isHpPage = shouldShowHp;

  if (!isOpen) return null;

  return (
    /* Backdrop */
    <dialog
      open
      className="fixed inset-0 z-50 flex justify-end m-0 bg-transparent border-none outline-none w-full h-full max-w-none max-h-none"
      aria-label="Settings"
    >
      {/* Click-away area */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={closeSettings}
        aria-hidden="true"
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
            <SlidersHorizontal className="size-5 text-primary" />
            <h2 className="text-lg font-semibold">Settings</h2>
          </div>
          <Button variant="ghost" size="icon" onClick={closeSettings} aria-label="Close settings">
            <X className="size-5" />
          </Button>
        </div>

        {/* Tabbed body */}
        <div className="flex-1 overflow-y-auto">
          {/* 1. Sitewide Settings Section */}
          <SitewideSettingsPanel />

          {/* 2. Page Specific Settings Section */}
          {(isAbilityScorePage || isHpPage) && (
            <PageSpecificSettingsPanel
              isAbilityScorePage={isAbilityScorePage}
              isHpPage={isHpPage}
              initialTab={initialTab}
            />
          )}

          {/* 3. Tab Specific Settings Section */}
          <Tabs key={`${isOpen}-${initialTab}`} defaultValue={initialTab} className="flex flex-col pt-2">
            {/* Hidden if there is only one tab, e.g. enabledTabs.length <= 1 */}
            {enabledTabs.length > 1 && (
              <div className="px-4 pt-2 shrink-0">
                <TabsList
                  className={`grid w-full ${enabledTabs.length === 2
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
            )}

            {/* Point Buy */}
            {shouldShowPointBuy && (
              <TabsContent value="pointbuy" className="flex-1 px-6 pb-2 mt-0">
                <PointBuySettingsPanel />
              </TabsContent>
            )}

            {/* Roll settings */}
            {shouldShowRoll && (
              <TabsContent value="roll" className="flex-1 px-6 pb-2 mt-0">
                <RollSettingsPanel />
              </TabsContent>
            )}

            {/* Standard */}
            {shouldShowStandard && (
              <TabsContent value="standard" className="flex-1 px-4 pb-2 mt-0">
                <div className="flex flex-col items-center justify-center p-6 text-center text-muted-foreground border border-dashed rounded-lg bg-muted/15 mt-2">
                  <Info className="size-6 text-muted-foreground/60 mb-2" />
                  <p className="text-xs font-semibold">Standard Array Configuration</p>
                  <p className="text-[11px] text-muted-foreground/80 mt-1 max-w-[240px]">
                    All Standard Array settings (Background Point Pool and ASI enforcement) have been moved to the page-wide settings section above.
                  </p>
                </div>
              </TabsContent>
            )}

            {/* HP */}
            {shouldShowHp && (
              <TabsContent value="hp" className="flex-1 px-6">
                <HpSettingsPanel />
              </TabsContent>
            )}

            {/* Dice Roller */}
            {shouldShowDice && (
              <TabsContent value="dice" className="flex-1 px-4">
                <DiceSettingsPanel />
              </TabsContent>
            )}
          </Tabs>
        </div>

        {/* Footer */}
        <div className="shrink-0 px-6 py-4 border-t border-border flex items-center justify-between gap-3 bg-muted/10">
          <Button
            variant="secondary"
            size="sm"
            className="text-muted-foreground hover:text-foreground"
            onClick={() => {
              resetSitewide();
              if (shouldShowPointBuy) resetPointBuy();
              if (shouldShowRoll) resetRoll();
              if (shouldShowStandard) resetStandard();
              if (shouldShowHp) resetHp();
              if (shouldShowDice) resetDiceRoller();
            }}
          >
            <RotateCcw className="size-3.5 mr-1.5" />
            Reset to defaults
          </Button>
          <Button variant="outline" size="sm" onClick={closeSettings}>
            Done
          </Button>
        </div>
      </div>
    </dialog>
  );
}

// ─── Sub Settings Panels ──────────────────────────────────────────────────────

function SitewideSettingsPanel() {
  const { settings, updateSitewide } = useSettings();
  const [appearanceExpanded, setAppearanceExpanded] = useState(false);

  return (
    <div className="border-b border-border/50 bg-muted/30">
      <div className="">
        {/* Appearance Collapsible */}
        <div className="border border-border/60 rounded-lg bg-background/50 shadow-sm transition-all duration-200 ">
          <button
            type="button"
            onClick={() => setAppearanceExpanded(!appearanceExpanded)}
            className="flex items-center justify-between w-full text-sm font-semibold text-foreground hover:text-primary transition-colors focus:outline-none"
            aria-expanded={appearanceExpanded}
          >
            <span className="flex items-center gap-2 px-4 py-2">
              Appearance
            </span>
            {appearanceExpanded ? (
              <ChevronDown className="size-4 text-muted-foreground transition-transform duration-200" />
            ) : (
              <ChevronRight className="size-4 text-muted-foreground transition-transform duration-200" />
            )}
          </button>
          {appearanceExpanded && (
            <div className="w-full mt-2 px-4 bg-muted/30 space-y-1 divide-y divide-border/40 animate-in fade-in slide-in-from-top-1 duration-200">
              <SettingRow
                label="Theme Mode"
                description={settings.sitewide.darkMode ? "Dark Mode" : "Light Mode"}
              >
                <div className="flex items-center gap-1 bg-background border rounded-lg p-0.5 shadow-sm shrink-0">
                  <Button
                    variant={!settings.sitewide.darkMode ? "secondary" : "ghost"}
                    size="sm"
                    className="h-6 px-2 text-[11px] gap-1"
                    onClick={() => updateSitewide({ darkMode: false })}
                  >
                    <Sun className="size-3" />
                    Light
                  </Button>
                  <Button
                    variant={settings.sitewide.darkMode ? "secondary" : "ghost"}
                    size="sm"
                    className="h-6 px-2 text-[11px] gap-1"
                    onClick={() => updateSitewide({ darkMode: true })}
                  >
                    <Moon className="size-3" />
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

              <SettingRow
                label="Maximize Space"
                description="Removes page titles, footers, and margins to maximize visible area."
              >
                <Switch
                  checked={settings.sitewide.maximizeSpace}
                  onCheckedChange={(v) => updateSitewide({ maximizeSpace: v })}
                />
              </SettingRow>
            </div>
          )}
        </div>

        {/* Not under Appearance */}
        <div className="pt-1.5 px-4 pb-2">
          <SettingRow
            label="Disable Share Prompt"
            description="Directly copy the share link to clipboard with a blank character name, bypassing the share modal."
          >
            <Switch
              checked={settings.sitewide.disableSharePrompt}
              onCheckedChange={(v) => updateSitewide({ disableSharePrompt: v })}
            />
          </SettingRow>
        </div>
      </div>
    </div>
  );
}

function PageSpecificSettingsPanel({
  isAbilityScorePage,
  isHpPage,
  initialTab,
}: {
  isAbilityScorePage: boolean;
  isHpPage: boolean;
  initialTab: string;
}) {
  const { settings, updateSitewide, updatePointBuy, updateRoll, updateStandard, updateHp } = useSettings();

  const activeBgBonusPool =
    initialTab === "pointbuy"
      ? settings.pointBuy.bgBonusPool
      : initialTab === "roll"
        ? settings.roll.bgBonusPool
        : settings.standard.bgBonusPool;

  const activeEnforceAsi =
    initialTab === "pointbuy"
      ? settings.pointBuy.enforceAsiFromBackground
      : initialTab === "roll"
        ? settings.roll.enforceAsiFromBackground
        : settings.standard.enforceAsiFromBackground;

  const handleBgBonusPoolChange = (v: number) => {
    updatePointBuy({ bgBonusPool: v });
    updateRoll({ bgBonusPool: v });
    updateStandard({ bgBonusPool: v });
  };

  const handleEnforceAsiChange = (v: boolean) => {
    updatePointBuy({ enforceAsiFromBackground: v });
    updateRoll({ enforceAsiFromBackground: v });
    updateStandard({ enforceAsiFromBackground: v });
  };

  return (
    <div className="px-6 py-4 border-b border-border/50 bg-muted/10">
      <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">
        {isAbilityScorePage ? "Ability Score Settings" : "HP Calculator Settings"}
      </h3>
      <div className="space-y-1 divide-y divide-border/40">
        {isAbilityScorePage && (
          <>
            <SettingRow
              label="Background Point Pool"
              description="Points to distribute as background ability bonuses."
            >
              <StepperInput
                className="w-28 h-8 bg-background"
                value={activeBgBonusPool}
                min={0}
                max={20}
                onChange={handleBgBonusPoolChange}
              />
            </SettingRow>

            <SettingRow
              label="Enforce ASI from Background"
              description={
                activeEnforceAsi
                  ? "Bonus steppers only appear on the background's designated abilities."
                  : "Bonus steppers appear on every ability regardless of background."
              }
            >
              <Switch
                checked={activeEnforceAsi}
                onCheckedChange={handleEnforceAsiChange}
              />
            </SettingRow>

            <SettingRow
              label="Show Skills & Saving Throws"
              description="Show or hide the Skills & Saving Throws section."
            >
              <Switch
                checked={settings.sitewide.showSkills}
                onCheckedChange={(v) => updateSitewide({ showSkills: v })}
              />
            </SettingRow>

            <SettingRow
              label="Enforce Class Skill Proficiencies"
              description="Restrict skill selections to the chosen class's proficiencies list (when available)."
            >
              <Switch
                checked={settings.sitewide.enforceClassSkills}
                onCheckedChange={(v) => updateSitewide({ enforceClassSkills: v })}
              />
            </SettingRow>

            <SettingRow
              label="Show Progression & Gear Reference"
              description="Show or hide the Progression & Gear Reference section."
            >
              <Switch
                checked={settings.sitewide.showProgression}
                onCheckedChange={(v) => updateSitewide({ showProgression: v })}
              />
            </SettingRow>
          </>
        )}

        {isHpPage && (
          <SettingRow
            label="Show Breakdown"
            description="Show or hide the per-level HP breakdown panel."
          >
            <Switch
              checked={settings.hp.showBreakdown}
              onCheckedChange={(v) => updateHp({ showBreakdown: v })}
            />
          </SettingRow>
        )}
      </div>
    </div>
  );
}

function RollSettingsPanel() {
  const { settings, updateRoll } = useSettings();
  return (
    <div className="space-y-1 divide-y divide-border/60">
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

      <SettingRow
        label="Rolling animation"
        description="Enable a dynamic roll animation on the randomized text."
      >
        <Switch
          checked={settings.roll.rollingAnimation}
          onCheckedChange={(v) => updateRoll({ rollingAnimation: v })}
        />
      </SettingRow>

      <SettingRow
        label="Dice shake animation"
        description="Enable the physical shake animation on individual cards when rolling."
      >
        <Switch
          checked={settings.roll.diceShake}
          onCheckedChange={(v) => updateRoll({ diceShake: v })}
        />
      </SettingRow>
    </div>
  );
}

function HpSettingsPanel() {
  const { settings, updateHp } = useSettings();
  return (
    <div className="space-y-2">
      <SettingRow
        label="Show Roll Counter"
        description="Show reroll count in the rolled result panel."
      >
        <Switch
          checked={settings.hp.showRollCounter}
          onCheckedChange={(v) => updateHp({ showRollCounter: v })}
        />
      </SettingRow>

      <SettingRow
        label="Rolling animation"
        description="Enable a dynamic roll animation on the randomized text."
      >
        <Switch
          checked={settings.hp.rollingAnimation}
          onCheckedChange={(v) => updateHp({ rollingAnimation: v })}
        />
      </SettingRow>
    </div>
  );
}

function DiceSettingsPanel() {
  const { settings, updateDiceRoller } = useSettings();
  return (
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

      <SettingRow
        label="Daggerheart Mode"
        description="Replace the D20 quick roll with a 2d12 Hope & Fear roll."
      >
        <Switch
          checked={settings.diceRoller.daggerheartMode}
          onCheckedChange={(v) => updateDiceRoller({ daggerheartMode: v })}
        />
      </SettingRow>
    </div>
  );
}
