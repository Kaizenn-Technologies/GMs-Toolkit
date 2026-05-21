import { Dices, Shuffle, BookOpen, Sparkles, Shield, AlertCircle, RotateCcw } from "lucide-react";
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
import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { StepperInput } from "@/components/ui/stepper-input";
import { classNames } from "@/lib/classes";
import { backgroundNames } from "@/lib/backgrounds";
import type { Ability } from "@/types";
import {
  ABILITIES,
  ABILITY_ABBR,
  formatModifier,
  getModifier,
  getModifierClass,
  getPoolStatusClass,
} from "@/lib/stat-generator";
import { PageHeader } from "@/components/layout/PageHeader";
import { ResetButton, ShareButton } from "@/components/ui/action-buttons";

import { ShareModal } from "@/components/features/ShareModal";
import { VerifiedLoadPanel } from "@/components/features/VerifiedLoadPanel";
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

export function StatGenerator() {
  const {
    settings,
    location,
    navigate,

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
    sharedName,
    sharedRolls,
    sharedTimestamp,
    sharedTimezone,
  } = useStatGenerator();

  const pointsColor = getPoolStatusClass(remaining);
  const bgPoolColor = getPoolStatusClass(bgBonusRemaining);

  const activeClass = activeTab === "pointbuy" ? selectedClass : selectedStandardClass;

  const profBonus = Math.floor((level - 1) / 4) + 2;

  const SKILL_MAPPING: Record<Ability, string[]> = {
    Strength: ["Athletics"],
    Dexterity: ["Acrobatics", "Sleight of Hand", "Stealth"],
    Constitution: [],
    Intelligence: ["Arcana", "History", "Investigation", "Nature", "Religion"],
    Wisdom: ["Animal Handling", "Insight", "Medicine", "Perception", "Survival"],
    Charisma: ["Deception", "Intimidation", "Performance", "Persuasion"],
  };

  const getAbilityModifier = (ability: Ability): number | null => {
    let baseScore: number | null;
    if (activeTab === "pointbuy") {
      baseScore = scores[ability];
    } else {
      // standard or roll
      baseScore = standardScores[ability];
    }

    if (baseScore === null) return null;

    const bgBonus = bgBonuses[ability] || 0;
    const manualBonus = manualBonuses[ability] || 0;
    const total = baseScore + bgBonus + (featBonusEnabled ? manualBonus : 0);
    return getModifier(total);
  };

  const getSavingThrowValueRaw = (ability: Ability): number | null => {
    const mod = getAbilityModifier(ability);
    if (mod === null) return null;

    const profState = savingThrowsState[ability] ?? "none";
    let bgBonusAmount = 0;
    if (profState === "prof") {
      bgBonusAmount = profBonus;
    } else if (profState === "expertise") {
      bgBonusAmount = 2 * profBonus;
    }

    return mod + bgBonusAmount;
  };

  const getSavingThrowValue = (ability: Ability): string => {
    const raw = getSavingThrowValueRaw(ability);
    return raw !== null ? formatModifier(raw) : "—";
  };

  const getSkillValueRaw = (ability: Ability, skillName: string): number | null => {
    const mod = getAbilityModifier(ability);
    if (mod === null) return null;

    const profState = skillsState[skillName] ?? "none";
    let bonus = 0;
    if (profState === "prof") {
      bonus = profBonus;
    } else if (profState === "expertise") {
      bonus = 2 * profBonus;
    } else if (profState === "none") {
      if (activeClass === "Bard") {
        bonus = Math.floor(profBonus / 2);
      }
    }

    return mod + bonus;
  };

  const getSkillValue = (ability: Ability, skillName: string): string => {
    const raw = getSkillValueRaw(ability, skillName);
    return raw !== null ? formatModifier(raw) : "—";
  };

  const handleSavingThrowChange = (ability: Ability, state: "none" | "prof" | "expertise") => {
    setSavingThrowsState((prev) => ({ ...prev, [ability]: state }));
  };

  const handleSkillChange = (skillName: string, state: "none" | "prof" | "expertise") => {
    setSkillsState((prev) => ({ ...prev, [skillName]: state }));
  };

  return (
    <div className="flex flex-col gap-3 ">
      <PageHeader
        title="D&D 5.5e Ability Score"
        description="Allocate ability scores using Point Buy, dice rolls, or the Standard Array. Followed by Skills & Saving Throws"
      />

      <VerifiedLoadPanel
        name={sharedName}
        rolls={sharedRolls}
        timestamp={sharedTimestamp}
        timezone={sharedTimezone}
      />

      <Card className="bg-card/45">
        <CardContent className="pt-1">
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
            <TabsList className="grid w-full grid-cols-3 mb-1">
              <TabsTrigger value="pointbuy">Point Buy</TabsTrigger>
              <TabsTrigger value="roll">Rolled Stats</TabsTrigger>
              <TabsTrigger value="standard">Standard Array</TabsTrigger>
            </TabsList>

            <TabsContent value="pointbuy" className="">
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

              {/* Mobile: 2-col card grid */}
              <div className="grid grid-cols-2 gap-2 md:hidden ">
                {ABILITIES.map((ability) => {
                  const score = scores[ability];
                  const bgBonus = bgBonuses[ability];
                  const manualBonus = manualBonuses[ability];
                  const total = score + bgBonus + (featBonusEnabled ? manualBonus : 0);
                  const modifier = getModifier(total);
                  const isPrimary = primaryStats.includes(ability);
                  const isBgAbility = bgAbilities.includes(ability);
                  const isAboveMax = score > clampedMax;
                  const showBgStepper = enforceAsiFromBackground ? isBgAbility : true;
                  return (
                    <div key={ability} className={`rounded-none border p-3 transition-colors flex flex-col h-full ${isPrimary ? "border-primary/40 bg-primary/8 dark:bg-primary/10" : "border-border bg-card"}`}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-1">
                          <span className="text-sm font-bold">{ABILITY_ABBR[ability]}</span>
                          {isPrimary && <span className="text-primary text-xs">★</span>}
                        </div>
                        <span className={`text-sm font-bold tabular-nums ${getModifierClass(modifier)}`}>{formatModifier(modifier)}</span>
                      </div>
                      <div>
                        <div className="flex-1 space-y-2">
                          <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Score</p>
                          <StepperInput className="rounded-none w-full" value={score} min={clampedMin} max={clampedMax} onChange={(val) => handleScoreChange(ability, val)} />
                        </div>
                        {showBgStepper && (
                          <div>
                            <p className="text-[10px] uppercase tracking-wide text-muted-foreground">BG Bonus</p>
                            <StepperInput className="rounded-none w-full" value={bgBonus} min={0} max={BG_BONUS_MAX} onChange={(val) => handleBgBonusChange(ability, val)} />
                          </div>
                        )}
                        {featBonusEnabled && (
                          <div>
                            <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Feat</p>
                            <StepperInput className="rounded-none w-full" value={manualBonus} min={0} max={MANUAL_BONUS_MAX} onChange={(val) => handleManualBonusChange(ability, val)} />
                          </div>
                        )}
                      </div>
                      <div className="flex items-center justify-between pt-1.5 border-t border-border/50 mt-2">
                        <span className="text-[10px] text-muted-foreground uppercase">Total</span>
                        <TotalScoreDisplay value={total} highlight={isAboveMax} />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Desktop: Table */}
              <div className="hidden md:block border border-border/60 rounded-none overflow-hidden bg-card/30">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-muted/50 text-[12px] font-bold text-muted-foreground uppercase tracking-widest border-b border-border/50">
                      <th className="text-left py-3 pl-4">Ability</th>
                      <th className="text-center">Score</th>
                      <th className="text-center">
                        <TooltipProvider delay={100}>
                          <Tooltip>
                            <TooltipTrigger
                              render={
                                <span className="cursor-help border-b border-dashed border-muted-foreground/50">
                                  Background
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
                        <th className="text-center">Feat Bonus</th>
                      )}
                      <th className="text-center">Total</th>
                      <th className="text-center ">
                        <TooltipProvider delay={100}>
                          <Tooltip>
                            <TooltipTrigger
                              render={
                                <span className="cursor-help border-b border-dashed border-muted-foreground/50">
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
                  <tbody className="divide-y divide-border/30">
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
                          className={`transition-colors ${isPrimary
                            ? "bg-primary/5 dark:bg-primary/10"
                            : "hover:bg-muted/30"
                            }`}
                        >
                          <AbilityNameCell
                            ability={ability}
                            abilityAbbreviation={ABILITY_ABBR[ability]}
                            isPrimary={isPrimary}
                            primaryTooltip={`Primary stat for ${selectedClass}`}
                          />

                          <td className="">
                            <CenteredCellContent>
                              <StepperInput
                                className="rounded-none w-28 bg-background/50"
                                value={score}
                                min={clampedMin}
                                max={clampedMax}
                                onChange={(val) =>
                                  handleScoreChange(ability, val)
                                }
                              />
                            </CenteredCellContent>
                          </td>

                          <td className="">
                            <CenteredCellContent>
                              {showBgStepper ? (
                                <StepperInput
                                  className="rounded-none w-28 bg-background/50"
                                  value={bgBonus}
                                  min={0}
                                  max={BG_BONUS_MAX}
                                  onChange={(val) =>
                                    handleBgBonusChange(ability, val)
                                  }
                                />
                              ) : (
                                <span className="inline-block w-28 text-center text-muted-foreground/30 select-none font-medium">
                                  —
                                </span>
                              )}
                            </CenteredCellContent>
                          </td>

                          {featBonusEnabled && (
                            <td className="">
                              <CenteredCellContent>
                                <StepperInput
                                  className="rounded-none w-28 bg-background/50"
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

                          <td className="text-center">
                            <TotalScoreDisplay value={total} highlight={isAboveMax} />
                          </td>

                          <td className="text-center rounded-none">
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

              <div className="flex flex-col sm:flex-row sm:items-center justify-between mt-2 gap-4">

                <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                  <PoolStatus
                    label="Background"
                    value={bgBonusRemaining}
                    max={bgBonusPool}
                    valueClassName={bgPoolColor}
                  />

                  <PoolStatus
                    label="Points"
                    value={remaining}
                    max={pointPool}
                    valueClassName={pointsColor}
                  />
                </div>
                <div className="flex flex-row justify-between gap-2">
                  <ResetButton onClick={handleReset} className="shadow-sm hover:shadow-md transition-all" />
                  <ShareButton onClick={handleShareLink} copied={copied} className="shadow-sm hover:shadow-md transition-all" />
                </div>
              </div>

              {remaining < 0 && (
                <p className="text-xs text-[#ff3d3d] text-right -mt-3">
                  Over budget by {Math.abs(remaining)} point
                  {Math.abs(remaining) !== 1 ? "s" : ""}
                </p>
              )}
            </TabsContent>

            <TabsContent value="roll" className="space-y-4">
              <div className="flex flex-row justify-between items-center border-b border-border/40 pb-2">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                  Ability Score Dice Pools (4d6 drop lowest)
                </p>
                <div className="flex items-center gap-1.5 font-mono text-[11px] text-muted-foreground bg-muted/40 border border-border/30 px-2 py-0.5 rounded-none">
                  <span className="font-semibold uppercase tracking-wider text-[9px] text-muted-foreground/80">Reroll Count:</span>
                  <span className="text-primary font-bold text-xs">{rollCount}</span>
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3">
                {ABILITIES.map((ability, index) => {
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
                      className={`bg-muted/20 border border-border/50 p-4 sm:p-6 flex flex-col items-center shadow-sm hover:border-border transition-colors group ${isRolling && settings.roll?.diceShake ? "animate-dice-shake" : ""}`}
                    >
                      <div className="text-[12px] font-bold uppercase tracking-widest text-muted-foreground mb-3 group-hover:text-foreground transition-colors">
                        Roll {index + 1}
                      </div>
                      <div className="flex flex-col gap-2 items-center justify-center mb-4">
                        <div className={`text-3xl sm:text-4xl font-bold tabular-nums ${totalColorClass} drop-shadow-sm ${total === 0 ? "text-muted-foreground/20" : ""} ${isRolling ? "animate-number-flicker" : ""}`}>
                          {total}
                        </div>
                        <div
                          className={`text-sm border border-muted-foreground/20 bg-background/30 px-2 py-1 rounded font-bold transition-all duration-200 tabular-nums ${total > 0
                            ? getModifier(total) > 0
                              ? "text-emerald-500"
                              : getModifier(total) < 0
                                ? "text-red-500"
                                : "text-muted-foreground/60"
                            : "invisible select-none opacity-0"
                            } ${isRolling ? "animate-number-flicker" : ""}`}
                        >
                          {total > 0 ? formatModifier(getModifier(total)) : "+0"}
                        </div>
                      </div>
                      <div className={`flex flex-row flex-nowrap justify-center items-center gap-1 text-xs font-medium text-muted-foreground/95 px-1 py-1 w-full ${isRolling ? "animate-number-flicker" : ""}`}>
                        {displayed.map((d, i) => {
                          const isLast = i === displayed.length - 1;
                          const colorClass = settings.roll?.colorDice
                            ? d === 1
                              ? "text-red-500 bg-red-500/10 border-red-500 rounded"
                              : d === 6
                                ? "text-emerald-500/70 bg-emerald-500/10 border-emerald-500/70"
                                : "border-white/20"
                            : "";
                          return (
                            <span
                              key={i}
                              className={`${colorClass} ${isLast ? "text-muted-foreground/95 opacity-60 border-dashed" : "bg-background/50"} rounded-none border border-border/30 px-2 py-1 ${d === 0 ? "text-muted-foreground/20" : ""}`}
                              style={isLast && d > 0 ? {
                                backgroundColor: settings.sitewide.darkMode ? '#222222ff' : '#fee2e2',
                                backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ff5656' fill-opacity='0.4' fill-rule='evenodd'%3E%3Cpath d='M0 40L40 0H20L0 20M40 40V20L20 40'/%3E%3C/g%3E%3C/svg%3E")`,
                                backgroundSize: '12px 12px'
                              } : undefined}
                            >
                              {d === 0 ? "⠿" : d}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-2">
                <div className="flex flex-wrap items-center justify-center gap-2">
                  <Button onClick={rollAllStats} disabled={isRolling} className="w-32">
                    <Dices className="w-4 h-4 mr-2" />
                    {isRolling ? "Rolling..." : "Roll Stats"}
                  </Button>
                  <Button variant="outline" onClick={handleRollsReset} disabled={isRolling}>
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Reset
                  </Button>
                </div>
                <div className="hidden md:block md:flex-1"></div>
                <div className="flex flex-wrap items-center justify-center gap-2">
                  <Button variant="outline" onClick={handleAssignManually} disabled={isRolling}>
                    Assign manually
                  </Button>
                  <Button variant="outline" onClick={handleShuffleAssign} disabled={isRolling}>
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

                  {/* Mobile: card grid */}
                  <div className="grid grid-cols-2 gap-2 md:hidden">
                    {ABILITIES.map((ability) => {
                      const score = standardScores[ability];
                      const bgBonus = bgBonuses[ability];
                      const manualBonus = manualBonuses[ability];
                      const total = score === null ? null : score + bgBonus + (featBonusEnabled ? manualBonus : 0);
                      const modifier = total === null ? null : getModifier(total);
                      const isBgAbility = bgAbilities.includes(ability);
                      const isPrimary = primaryStats.includes(ability);
                      const pool = getRolledTotals();
                      const availablePool = pool.slice().sort((a, b) => b - a);
                      ABILITIES.forEach((ab) => {
                        if (ab === ability) return;
                        const assigned = standardScores[ab];
                        if (assigned === null) return;
                        const idx = availablePool.indexOf(assigned);
                        if (idx !== -1) availablePool.splice(idx, 1);
                      });
                      if (score !== null && availablePool.indexOf(score) === -1) availablePool.push(score);
                      return (
                        <div key={ability} className={`rounded-none border p-3 transition-colors flex flex-col h-full ${isPrimary ? "border-primary/40 bg-primary/8 dark:bg-primary/10" : "border-border bg-card"}`}>
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-1">
                              <span className="text-sm font-bold">{ABILITY_ABBR[ability]}</span>
                              {isPrimary && <span className="text-primary text-xs">★</span>}
                            </div>
                            <span className={`text-sm font-bold tabular-nums ${getModifierClass(modifier)}`}>{modifier === null ? "—" : formatModifier(modifier)}</span>
                          </div>
                          <div className="flex-1 space-y-2">
                            <div>
                              <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1">Score</p>
                              <Select value={score === null ? "" : String(score)} onValueChange={(val) => handleRolledAssignChange(ability, val)}>
                                <SelectTrigger className="rounded-none w-full" aria-label={`Assign Score to ${ability}`}><SelectValue placeholder="—" /></SelectTrigger>
                                <SelectContent>
                                  <SelectItem
                                    value=""
                                    style={{
                                      position: "absolute",
                                      opacity: 0,
                                      pointerEvents: "none",
                                      height: 0,
                                      width: 0,
                                      padding: 0,
                                      margin: 0,
                                      overflow: "hidden",
                                      border: 0,
                                    }}
                                  >
                                    —
                                  </SelectItem>
                                  {availablePool.map((opt, idx) => <SelectItem key={`${opt}-${idx}`} value={String(opt)}>{opt}</SelectItem>)}
                                </SelectContent>
                              </Select>
                            </div>
                            {isBgAbility && (
                              <div>
                                <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1">BG Bonus</p>
                                <StepperInput className="rounded-none w-full" value={bgBonus} min={0} max={BG_BONUS_MAX} onChange={(val) => handleBgBonusChange(ability, val)} />
                              </div>
                            )}
                            {featBonusEnabled && (
                              <div>
                                <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1">Feat</p>
                                <StepperInput className="rounded-none w-full" value={manualBonus} min={0} max={MANUAL_BONUS_MAX} onChange={(val) => handleManualBonusChange(ability, val)} />
                              </div>
                            )}
                          </div>
                          <div className="flex items-center justify-between pt-1.5 border-t border-border/50 mt-2">
                            <span className="text-[10px] text-muted-foreground uppercase">Total</span>
                            <TotalScoreDisplay value={total ?? "—"} />
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Desktop: Table */}
                  <div className="hidden md:block border border-border/60 rounded-none overflow-hidden bg-card/30">
                    <table className="w-full text-sm border-collapse">
                      <thead>
                        <tr className="bg-muted/50 text-[12px] font-bold text-muted-foreground uppercase tracking-widest border-b border-border/50">
                          <th className="text-left py-3 pl-4">Ability</th>
                          <th className="text-center">Score</th>
                          <th className="text-center">
                            <TooltipProvider delay={100}>
                              <Tooltip>
                                <TooltipTrigger
                                  render={
                                    <span className="cursor-help border-b border-dashed border-muted-foreground/50">
                                      Background
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
                            <th className="text-center">Feat Bonus</th>
                          )}
                          <th className="text-center">Total</th>
                          <th className="text-center ">
                            <TooltipProvider delay={100}>
                              <Tooltip>
                                <TooltipTrigger
                                  render={
                                    <span className="cursor-help border-b border-dashed border-muted-foreground/50">
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
                      <tbody className="divide-y divide-border/30">
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
                            <tr key={ability} className={`transition-colors ${isPrimary ? "bg-primary/5 dark:bg-primary/10" : "hover:bg-muted/30"}`}>
                              <AbilityNameCell
                                ability={ability}
                                abilityAbbreviation={ABILITY_ABBR[ability]}
                                isPrimary={isPrimary}
                                primaryTooltip="Primary stat for selected class"
                              />
                              <td className="">
                                <CenteredCellContent>
                                  <Select value={score === null ? "" : String(score)} onValueChange={(val) => handleRolledAssignChange(ability, val)}>
                                    <SelectTrigger className="rounded-none w-28 bg-background/50" aria-label={`Assign Score to ${ability}`}>
                                      <SelectValue placeholder="Select" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem
                                        value=""
                                        style={{
                                          position: "absolute",
                                          opacity: 0,
                                          pointerEvents: "none",
                                          height: 0,
                                          width: 0,
                                          padding: 0,
                                          margin: 0,
                                          overflow: "hidden",
                                          border: 0,
                                        }}
                                      >
                                        Select
                                      </SelectItem>
                                      {availablePool.map((option, idx) => (
                                        <SelectItem key={`${option}-${idx}`} value={String(option)}>
                                          {option}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </CenteredCellContent>
                              </td>

                              <td className="">
                                <CenteredCellContent>
                                  {isBgAbility ? (
                                    <StepperInput className="rounded-none w-28 bg-background/50" value={bgBonus} min={0} max={BG_BONUS_MAX} onChange={(val) => handleBgBonusChange(ability, val)} />
                                  ) : (
                                    <span className="inline-block w-28 text-center text-muted-foreground/30 select-none font-medium">—</span>
                                  )}
                                </CenteredCellContent>
                              </td>

                              {featBonusEnabled && (
                                <td className="">
                                  <CenteredCellContent>
                                    <StepperInput className="rounded-none w-28 bg-background/50" value={manualBonus} min={0} max={MANUAL_BONUS_MAX} onChange={(val) => handleManualBonusChange(ability, val)} />
                                  </CenteredCellContent>
                                </td>
                              )}

                              <td className="text-center">
                                <TotalScoreDisplay value={total ?? "—"} />
                              </td>

                              <td className="text-center rounded-none">
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

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between mt-2">
                    <div className="flex items-center gap-3">
                      <PoolStatus
                        label="Background"
                        value={bgBonusRemaining}
                        max={bgBonusPool}
                        valueClassName={bgPoolColor}
                      />
                    </div>
                    <div className="flex flex-row justify-between gap-2">
                      <ShareButton onClick={handleShareAssigned} copied={copied} className="shadow-sm hover:shadow-md transition-all" />
                      <ResetButton onClick={handleAssignmentReset} className="shadow-sm hover:shadow-md transition-all" />
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

              {/* Mobile: card grid */}
              <div className="grid grid-cols-2 gap-2 md:hidden">
                {ABILITIES.map((ability) => {
                  const score = standardScores[ability];
                  const bgBonus = bgBonuses[ability];
                  const manualBonus = manualBonuses[ability];
                  const total = score === null ? null : score + bgBonus + (featBonusEnabled ? manualBonus : 0);
                  const modifier = total === null ? null : getModifier(total);
                  const isPrimary = primaryStats.includes(ability);
                  const isBgAbility = bgAbilities.includes(ability);
                  const showBgStepper = enforceAsiFromBackground ? isBgAbility : true;

                  return (
                    <div key={ability} className={`rounded-none border p-3 transition-colors flex flex-col h-full ${isPrimary ? "border-primary/40 bg-primary/8 dark:bg-primary/10" : "border-border bg-card"}`}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-1">
                          <span className="text-sm font-bold">{ABILITY_ABBR[ability]}</span>
                          {isPrimary && <span className="text-primary text-xs">★</span>}
                        </div>
                        <span className={`text-sm font-bold tabular-nums ${getModifierClass(modifier)}`}>{modifier === null ? "—" : formatModifier(modifier)}</span>
                      </div>
                      <div className="flex-1 space-y-2">
                        <div>
                          <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1">Score</p>
                          <Select
                            value={score === null ? "" : String(score)}
                            onValueChange={(val) => handleStandardScoreChange(ability, val)}
                          >
                            <SelectTrigger className="rounded-none w-full" aria-label={`Assign Standard Array to ${ability}`}>
                              <SelectValue placeholder="—" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem
                                value=""
                                style={{
                                  position: "absolute",
                                  opacity: 0,
                                  pointerEvents: "none",
                                  height: 0,
                                  width: 0,
                                  padding: 0,
                                  margin: 0,
                                  overflow: "hidden",
                                  border: 0,
                                }}
                              >
                                —
                              </SelectItem>
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
                        </div>
                        {showBgStepper && (
                          <div>
                            <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1">BG Bonus</p>
                            <StepperInput className="rounded-none w-full" value={bgBonus} min={0} max={BG_BONUS_MAX} onChange={(val) => handleBgBonusChange(ability, val)} />
                          </div>
                        )}
                        {featBonusEnabled && (
                          <div>
                            <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1">Feat</p>
                            <StepperInput className="rounded-none w-full" value={manualBonus} min={0} max={MANUAL_BONUS_MAX} onChange={(val) => handleManualBonusChange(ability, val)} />
                          </div>
                        )}
                      </div>
                      <div className="flex items-center justify-between pt-1.5 border-t border-border/50 mt-2">
                        <span className="text-[10px] text-muted-foreground uppercase">Total</span>
                        <TotalScoreDisplay value={total ?? "—"} />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Desktop: Table */}
              <div className="hidden md:block border border-border/60 rounded-none overflow-hidden bg-card/30 mb-0">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-muted/50 text-[12px] font-bold text-muted-foreground uppercase tracking-widest border-b border-border/50">
                      <th className="text-left py-3 pl-4">Ability</th>
                      <th className="text-center">Score</th>
                      <th className="text-center">
                        <TooltipProvider delay={100}>
                          <Tooltip>
                            <TooltipTrigger
                              render={
                                <span className="cursor-help border-b border-dashed border-muted-foreground/50">
                                  Background
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
                        <th className="text-center">Feat Bonus</th>
                      )}
                      <th className="text-center">Total</th>
                      <th className="text-center ">
                        <TooltipProvider delay={100}>
                          <Tooltip>
                            <TooltipTrigger
                              render={
                                <span className="cursor-help border-b border-dashed border-muted-foreground/50">
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
                  <tbody className="divide-y divide-border/30">
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
                          className={`transition-colors ${isPrimary
                            ? "bg-primary/5 dark:bg-primary/10"
                            : "hover:bg-muted/30"
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

                          <td className="">
                            <CenteredCellContent>
                              <Select
                                value={score === null ? "" : String(score)}
                                onValueChange={(val) =>
                                  handleStandardScoreChange(ability, val)
                                }
                              >
                                <SelectTrigger className="rounded-none w-28 bg-background/50" aria-label={`Assign Standard Array to ${ability}`}>
                                  <SelectValue placeholder="Select" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem
                                    value=""
                                    style={{
                                      position: "absolute",
                                      opacity: 0,
                                      pointerEvents: "none",
                                      height: 0,
                                      width: 0,
                                      padding: 0,
                                      margin: 0,
                                      overflow: "hidden",
                                      border: 0,
                                    }}
                                  >
                                    Select
                                  </SelectItem>
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

                          <td className="">
                            <CenteredCellContent>
                              {showBgStepper ? (
                                <StepperInput
                                  className="rounded-none w-28 bg-background/50"
                                  value={bgBonus}
                                  min={0}
                                  max={BG_BONUS_MAX}
                                  onChange={(val) =>
                                    handleBgBonusChange(ability, val)
                                  }
                                />
                              ) : (
                                <span className="inline-block w-28 text-center text-muted-foreground/30 select-none font-medium">
                                  —
                                </span>
                              )}
                            </CenteredCellContent>
                          </td>

                          {featBonusEnabled && (
                            <td className="">
                              <CenteredCellContent>
                                <StepperInput
                                  className="rounded-none w-28 bg-background/50"
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

                          <td className="text-center">
                            <TotalScoreDisplay value={total ?? "—"} />
                          </td>

                          <td className="text-center rounded-none">
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

              <div className="flex flex-col sm:flex-row sm:items-end justify-between mt-2">

                <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                  <PoolStatus
                    label="Background"
                    value={bgBonusRemaining}
                    max={bgBonusPool}
                    valueClassName={bgPoolColor}
                  />
                </div>
                <div className="flex flex-row justify-between gap-2 ">
                  <ResetButton onClick={handleStandardReset} className="shadow-sm hover:shadow-md transition-all" />
                  <ShareButton onClick={handleShareLink} copied={copied} className="shadow-sm hover:shadow-md transition-all" />
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Skills & Saving Throws Section */}
      {settings.sitewide.showSkills ? (
        <Card className="border-border bg-card/45 backdrop-blur-sm">
          <CardContent className="">
            <div className="flex flex-col md:flex-row md:items-center justify-between pb-2 mb-2 border-b border-border/40 gap-4">
              <div>
                <h2 className="text-lg font-bold tracking-tight">Skills &amp; Saving Throws</h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Select class for automatic saving throws.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2 px-3 py-1.5">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Character Level:</span>
                  <StepperInput
                    value={level}
                    onChange={setLevel}
                    min={1}
                    max={20}
                    className="w-24 bg-background/50 h-7"
                  />
                </div>

                <div className="flex items-center gap-2 px-3 py-1.5">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Proficiency Bonus:</span>
                  <span className="text-sm font-extrabold text-primary font-mono px-2 py-0.5 rounded border border-primary/20">
                    +{profBonus}
                  </span>
                </div>
                <ResetButton
                  onClick={handleSkillsReset}
                  className="shadow-sm hover:shadow-md transition-all h-8"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {ABILITIES.map((ability) => {
                const skills = SKILL_MAPPING[ability];

                return (
                  <div key={ability} className="flex flex-col border border-border bg-card/60 backdrop-blur-sm rounded-lg shadow-sm hover:shadow-md transition-all">
                    {/* Ability Header with Integrated Saving Throw */}
                    <div className="bg-muted/60 py-2 px-3 text-center border-b border-border/50 flex items-center justify-between rounded-t-lg">
                      <div className="flex items-center gap-2 min-w-0">
                        <SkillDropdown
                          state={savingThrowsState[ability]}
                          isBard={activeClass === "Bard"}
                          isSkill={false}
                          onChange={(state) => handleSavingThrowChange(ability, state)}
                        />
                        <span className="text-xs uppercase tracking-widest text-foreground font-bold truncate">
                          <span className="hidden sm:inline lg:hidden xl:inline">{ability}</span>
                          <span className="sm:hidden lg:inline xl:hidden">{ability.slice(0, 3)}</span> Saving Throw
                        </span>
                      </div>
                      <span className={`font-mono font-bold text-md bg-background/60 px-2 py-0.5 min-w-[32px] text-center rounded shrink-0 ${getModifierClass(getSavingThrowValueRaw(ability))}`}>
                        {getSavingThrowValue(ability)}
                      </span>
                    </div>

                    {/* Body with Skills (if any) */}
                    {skills.length > 0 && (
                      <div className="flex-1 p-3 ">
                        {skills.map((skill, index) => (
                          <div key={skill} className="flex items-center justify-between text-sm py-1">
                            <div className="flex items-center gap-1.5 min-w-0">
                              <SkillDropdown
                                state={skillsState[skill] || "none"}
                                isBard={activeClass === "Bard"}
                                isSkill={true}
                                onChange={(state) => handleSkillChange(skill, state)}
                                openUpward={index >= 2}
                              />
                              <span className="truncate" title={skill}>
                                {skill}
                              </span>
                            </div>
                            <div className="flex-1 mx-2 pt-1 border-b border-dashed border-muted-foreground/40 self-center" />
                            <span className={`font-mono font-bold text-xs bg-background/60 border border-border px-1.5 py-0.5 min-w-[28px] text-center rounded shrink-0 ${getModifierClass(getSkillValueRaw(ability, skill))}`}>
                              {getSkillValue(ability, skill)}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      ) : null}

      {/* Reference & Progression Helper */}
      {settings.sitewide.showProgression ? (
        <Card className="border-border bg-card/45 backdrop-blur-sm">
          <CardContent className="">
            <div className="flex items-center gap-2 mb-4">
              <BookOpen className="w-5 h-5 text-primary/80" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-foreground">
                Progression &amp; Gear Reference
              </h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              {/* Feats Section */}
              <div className="space-y-3">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  <Sparkles className="w-4 h-4 text-amber-500/80" />
                  <span>Feats &amp; Ability Score Increases</span>
                </div>

                <div className="space-y-2.5">
                  {/* Skilled Feat */}
                  <div className="bg-muted/10 border border-border/40 rounded-lg p-3 hover:bg-muted/20 transition-all group">
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                      <span className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors">
                        Skilled
                      </span>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/25 text-emerald-400">
                        Origin Feat
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      You gain proficiency in any combination of three skills or tools of your choice. Excellent for broadening your utility.
                    </p>
                  </div>

                  {/* ASI Feat */}
                  <div className="bg-muted/10 border border-border/40 rounded-lg p-3 hover:bg-muted/20 transition-all group">
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                      <span className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors">
                        Ability Score Improvement
                      </span>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/25 text-blue-400">
                        General Feat
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Increase one ability score by 2, or two ability scores by 1. You cannot increase an ability score above 20 using this feature.
                    </p>
                  </div>

                  {/* Resilient Feat */}
                  <div className="bg-muted/10 border border-border/40 rounded-lg p-3 hover:bg-muted/20 transition-all group">
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                      <span className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors">
                        Resilient
                      </span>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/25 text-blue-400">
                        General Feat
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Increase the ability score of your choice by 1, and gain proficiency in saving throws using that ability.
                    </p>
                  </div>
                </div>
              </div>

              {/* Magical Items Section */}
              <div className="space-y-2">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    <Shield className="w-4 h-4 text-blue-500/80" />
                    <span>Stat-Enhancing Magic Items</span>
                  </div>
                  <TooltipProvider delay={100}>
                    <Tooltip>
                      <TooltipTrigger
                        render={
                          <span className="cursor-help text-[11px] font-semibold text-muted-foreground/80 bg-muted/40 border border-border/60 border-dashed rounded px-1.5 py-0.5 flex items-center gap-1 transition-colors hover:bg-muted/65">
                            <span className="text-blue-400">💠</span> Max 3 Attuned
                          </span>
                        }
                      />
                      <TooltipContent>
                        <p>Characters are limited to 3 attuned magic items (unless you are an Artificer).</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {/* Headband of Intellect */}
                  <div className="bg-muted/10 border border-border/40 rounded-lg p-3 hover:bg-muted/20 transition-all flex flex-col justify-between">
                    <div>
                      <div className="mb-1">
                        <span className="font-bold text-xs text-foreground">Headband of Intellect</span>
                      </div>
                      <p className="text-[11px] text-muted-foreground leading-relaxed">
                        Sets your <strong className="text-foreground">INT to 20</strong> while worn. No effect if INT is already 20+.
                      </p>
                    </div>
                    <div className="text-[11px] mt-1.5 flex items-center justify-between gap-2">
                      <span className="text-blue-400/80 flex items-center gap-1">💠 Requires Attunement</span>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 shrink-0">
                        Uncommon
                      </span>
                    </div>
                  </div>

                  {/* Gauntlets of Ogre Power */}
                  <div className="bg-muted/10 border border-border/40 rounded-lg p-3 hover:bg-muted/20 transition-all flex flex-col justify-between">
                    <div>
                      <div className="mb-1">
                        <span className=" text-xs text-foreground">Gauntlets of Ogre Power</span>
                      </div>
                      <p className="text-[11px] text-muted-foreground leading-relaxed">
                        Sets your <strong className="text-foreground">STR to 19</strong> while worn. No effect if STR is already 19+.
                      </p>
                    </div>
                    <div className="text-[11px] mt-1.5 flex items-center justify-between gap-2">
                      <span className="text-blue-400/80 flex items-center gap-1">💠 Requires Attunement</span>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 shrink-0">
                        Uncommon
                      </span>
                    </div>
                  </div>

                  {/* Amulet of Health */}
                  <div className="bg-muted/10 border border-border/40 rounded-lg p-3 hover:bg-muted/20 transition-all flex flex-col justify-between">
                    <div>
                      <div className="mb-1">
                        <span className=" text-xs text-foreground">Amulet of Health</span>
                      </div>
                      <p className="text-[11px] text-muted-foreground leading-relaxed">
                        Sets your <strong className="text-foreground">CON to 19</strong> while worn. No effect if CON is already 19+.
                      </p>
                    </div>
                    <div className="text-[11px] mt-1.5 flex items-center justify-between gap-2">
                      <span className="text-blue-400/80 flex items-center gap-1">💠 Requires Attunement</span>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-blue-500/10 border border-blue-500/25 text-blue-400 shrink-0">
                        Rare
                      </span>
                    </div>
                  </div>

                  {/* Belt of Giant Strength */}
                  <div className="bg-muted/10 border border-border/40 rounded-lg p-3 hover:bg-muted/20 transition-all flex flex-col justify-between">
                    <div>
                      <div className="mb-1">
                        <span className=" text-xs text-foreground">Belt of Giant Strength</span>
                      </div>
                      <p className="text-[11px] text-muted-foreground leading-relaxed">
                        Sets your <strong className="text-foreground">STR to 21-29</strong> (depends on belt rarity). No effect if STR is higher.
                      </p>
                    </div>
                    <div className="text-[11px] mt-1.5 flex items-center justify-between gap-2">
                      <span className="text-blue-400/80 flex items-center gap-1">💠 Requires Attunement</span>
                      <span className="inline-block p-[1px] rounded bg-gradient-to-r from-red-500 via-green-400 via-blue-500 to-purple-500 shadow-[0_0_6px_rgba(239,68,68,0.15)] shrink-0">
                        <span className="block bg-card dark:bg-muted/90 rounded-[3px] px-1 py-0.2 flex items-center justify-center">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-green-400 via-blue-500 to-purple-500">
                            Variable
                          </span>
                        </span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* More Magical Items */}
                <div className="bg-amber-500/5 border border-amber-500/20 rounded-lg p-3 flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                  <div>
                    <span className="font-bold text-xs text-amber-500 block mb-0.5">More Magic Items</span>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                      Manuals &amp; Tomes can also permanently increase ability scores and their maximums by 2.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {shareModalProps && (
        <ShareModal
          isOpen={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
          {...shareModalProps}
        />
      )}
    </div>
  );
}

interface SkillDropdownProps {
  state: "none" | "prof" | "expertise";
  isBard: boolean;
  isSkill: boolean;
  onChange: (state: "none" | "prof" | "expertise") => void;
  openUpward?: boolean;
}

function SkillDropdown({ state, isBard, isSkill, onChange, openUpward }: SkillDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [coords, setCoords] = useState<{ top: number; left: number; width: number; height: number } | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        dropdownRef.current && !dropdownRef.current.contains(target) &&
        !target.closest(".skill-dropdown-portal")
      ) {
        setIsOpen(false);
      }
    };

    const handleScroll = () => {
      setIsOpen(false);
    };

    document.addEventListener("mousedown", handleOutsideClick);
    window.addEventListener("scroll", handleScroll, { capture: true, passive: true });

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      window.removeEventListener("scroll", handleScroll, { capture: true });
    };
  }, [isOpen]);

  const handleToggle = () => {
    if (!isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setCoords({
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
      });
    }
    setIsOpen(!isOpen);
  };

  const renderIcon = (s: "none" | "prof" | "expertise", interactive = true) => {
    const baseClass = `w-4 h-4 cursor-pointer shrink-0 transition-transform ${interactive ? "hover:scale-110 active:scale-95" : ""}`;
    if (s === "expertise") {
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className={`${baseClass} text-amber-500 fill-amber-500 drop-shadow-[0_0_2px_rgba(245,158,11,0.3)]`}
        >
          <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.434c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.434 2.082-5.005Z" clipRule="evenodd" />
        </svg>
      );
    }
    if (s === "prof") {
      return (
        <div className={`${baseClass} rounded-full bg-primary border-2 border-primary shadow-sm flex items-center justify-center`} />
      );
    }
    if (isSkill && isBard) {
      return (
        <div className={`${baseClass} rounded-full border-2 border-muted-foreground/50 hover:border-foreground flex items-center justify-center`}>
          <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/80" />
        </div>
      );
    }
    return (
      <div className={`${baseClass} rounded-full border-2 border-muted-foreground/40 hover:border-foreground`} />
    );
  };

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      <button
        ref={buttonRef}
        type="button"
        onClick={handleToggle}
        className="flex items-center justify-center w-6 h-6 rounded hover:bg-muted/80 focus:outline-none transition-colors"
        title={`Change Proficiency (Current: ${state === "none" ? (isSkill && isBard ? "Jack of All Trades" : "None") : state === "prof" ? "Proficient" : "Expertise"})`}
        aria-label={`Change Proficiency (Current: ${state === "none" ? (isSkill && isBard ? "Jack of All Trades" : "None") : state === "prof" ? "Proficient" : "Expertise"})`}
      >
        {renderIcon(state)}
      </button>

      {isOpen && coords && createPortal(
        <div
          className="fixed z-[9999] w-44 rounded-md border border-border bg-popover p-1 shadow-md animate-in fade-in duration-150 skill-dropdown-portal"
          style={{
            left: `${coords.left}px`,
            top: openUpward ? `${coords.top - 4}px` : `${coords.top + coords.height + 4}px`,
            transform: openUpward ? "translateY(-100%)" : "none",
          }}
        >
          <button
            type="button"
            onClick={() => {
              onChange("none");
              setIsOpen(false);
            }}
            className="flex items-center gap-2 w-full px-2 py-1.5 text-xs text-left hover:bg-muted rounded transition-colors text-foreground"
          >
            {renderIcon("none", false)}
            <span>No Proficiency {isSkill && isBard && <span className="text-[10px] text-muted-foreground">(JoAT)</span>}</span>
          </button>
          <button
            type="button"
            onClick={() => {
              onChange("prof");
              setIsOpen(false);
            }}
            className="flex items-center gap-2 w-full px-2 py-1.5 text-xs text-left hover:bg-muted rounded transition-colors text-foreground"
          >
            {renderIcon("prof", false)}
            <span>Proficiency (+PROF)</span>
          </button>
          {isSkill && (
            <button
              type="button"
              onClick={() => {
                onChange("expertise");
                setIsOpen(false);
              }}
              className="flex items-center gap-2 w-full px-2 py-1.5 text-xs text-left hover:bg-muted rounded transition-colors text-foreground"
            >
              {renderIcon("expertise", false)}
              <span>Expertise (+ 2x PROF)</span>
            </button>
          )}
        </div>,
        document.body
      )}
    </div>
  );
}
