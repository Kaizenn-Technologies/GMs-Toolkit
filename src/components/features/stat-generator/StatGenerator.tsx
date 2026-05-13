import { Dices, Shuffle } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { classNames } from "@/lib/classes";
import { backgroundNames } from "@/lib/backgrounds";
import {
  ABILITIES,
  ABILITY_ABBR,
  formatModifier,
  getModifier,
  getModifierClass,
  getPoolStatusClass,
} from "@/lib/stat-generator";
import { SettingsOverlay } from "@/components/features/SettingsOverlay";
import { SettingsProvider } from "@/contexts/SettingsContext";
import { PageHeader } from "@/components/layout/PageHeader";
import { ResetButton, ShareButton } from "@/components/ui/action-buttons";

import { StatGeneratorSelectorRow } from "./StatGeneratorSelectorRow";
import {
  AbilityNameCell,
  CenteredCellContent,
  ModifierDisplay,
  PoolStatus,
  TotalScoreDisplay,
} from "./StatDisplayComponents";
import {
  useStatGenerator,
  BG_BONUS_MAX,
  MANUAL_BONUS_MAX,
  STANDARD_ARRAY_OPTIONS,
  CHOOSE_STANDARD_CLASS,
  STAT_TAB_ROUTES,
} from "./useStatGenerator";

function StatGeneratorInner() {
  const {
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
    rollAllStats,
    getRolledTotals,
    handleShuffleAssign,
    handleAssignManually,
    handleRolledAssignChange,
    handleAssignmentReset,
    handleShareAssigned,
  } = useStatGenerator();

  const pointsColor = getPoolStatusClass(remaining);
  const bgPoolColor = getPoolStatusClass(bgBonusRemaining);

  return (
    <>
      <PageHeader
        title="D&D 5.5e Stat Generator"
        description="Generate ability scores using Point Buy, dice rolls, or the Standard Array."
        onSettingsClick={openSettings}
      />

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

            <TabsContent value="pointbuy" className="space-y-6">
              <StatGeneratorSelectorRow
                classValue={selectedClass}
                onClassChange={(value) => {
                  if (value !== null) {
                    setSelectedClass(value);
                  }
                }}
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
                      const score = scores[ability];
                      const bgBonus = bgBonuses[ability];
                      const manualBonus = manualBonuses[ability];
                      const total =
                        score + bgBonus + (featBonusEnabled ? manualBonus : 0);
                      const modifier = getModifier(total);
                      const isPrimary = primaryStats.includes(ability);
                      const isBgAbility = bgAbilities.includes(ability);
                      const isAboveMax = score > clampedMax;

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
                            primaryTooltip={`Primary stat for ${selectedClass}`}
                          />

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
                            <TotalScoreDisplay value={total} highlight={isAboveMax} />
                          </td>

                          <td className="py-2 pr-3 text-center rounded-r-md">
                            <ModifierDisplay
                              value={formatModifier(modifier)}
                              className={getModifierClass(modifier)}
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
                  <ResetButton onClick={handleReset} />
                  <ShareButton onClick={handleShareLink} copied={copied} />
                </div>

                <div className="flex items-center gap-6 text-sm font-medium flex-wrap">
                  <PoolStatus
                    label="Background Points:"
                    value={bgBonusRemaining}
                    max={bgBonusPool}
                    valueClassName={bgPoolColor}
                  />

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
                <Button onClick={rollAllStats}>
                  <Dices className="w-4 h-4 mr-2" />
                  Roll Stats</Button>
                <div className="flex items-center gap-3">
                  <Button variant="outline" onClick={handleAssignManually}>
                    Assign manually
                  </Button>
                  <Button variant="outline" onClick={handleShuffleAssign}>
                    <Shuffle className="w-4 h-4 mr-2" />
                    Shuffle
                  </Button>
                </div>
              </div>

              {showAssignPanel && (
                <div className="overflow-x-auto mt-6 pt-4 border-t">
                  <StatGeneratorSelectorRow
                    classValue={selectedStandardClass}
                    onClassChange={(value) => {
                      if (value !== null) {
                        setSelectedStandardClass(value);
                      }
                    }}
                    classOptions={[CHOOSE_STANDARD_CLASS, ...classNames]}
                    classPlaceholder={CHOOSE_STANDARD_CLASS}
                    backgroundValue={selectedBackground}
                    onBackgroundChange={handleBackgroundChange}
                    backgroundOptions={backgroundNames}
                    featBonusEnabled={featBonusEnabled}
                    onFeatBonusChange={setFeatBonusEnabled}
                    primaryDisplay={primaryDisplay}
                  />

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
                                className={getModifierClass(modifier)}
                              />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>

                  <div className="flex items-center justify-between mt-3 gap-3">
                    <div className="flex items-center gap-2">
                      <ShareButton onClick={handleShareAssigned} copied={copied} />
                      <ResetButton onClick={handleAssignmentReset} />
                    </div>
                    <div className="flex items-center gap-3">
                      <PoolStatus
                        label="Background Points:"
                        value={bgBonusRemaining}
                        max={bgBonusPool}
                        valueClassName={bgPoolColor}
                      />
                    </div>
                  </div>
                </div>
              )}
            </TabsContent>

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
                              className={getModifierClass(modifier)}
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
                  <ResetButton onClick={handleStandardReset} />
                  <ShareButton onClick={handleShareLink} copied={copied} />
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

      <SettingsOverlay />
    </>
  );
}

export function StatGenerator() {
  return (
    <SettingsProvider>
      <StatGeneratorInner />
    </SettingsProvider>
  );
}
