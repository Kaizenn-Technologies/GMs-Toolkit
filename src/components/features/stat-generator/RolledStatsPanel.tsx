import React from "react";
import { Dices, RotateCcw, Shuffle, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { StepperInput } from "@/components/ui/stepper-input";
import { ABILITIES, ABILITY_ABBR, getModifier, getModifierClass, formatModifier } from "@/lib/stat-generator";
import { classNames } from "@/lib/classes";
import { backgroundNames } from "@/lib/backgrounds";
import { StatGeneratorSelectorRow } from "./StatGeneratorSelectorRow";
import {
  AbilityNameCell,
  CenteredCellContent,
  ModifierDisplay,
  PoolStatus,
  TotalScoreDisplay,
} from "./StatDisplayComponents";
import { ResetButton, ShareButton } from "@/components/ui/action-buttons";
import type { Ability } from "@/types";
import { BG_BONUS_MAX, MANUAL_BONUS_MAX, CHOOSE_STANDARD_CLASS, CHOOSE_BACKGROUND } from "./useStatGenerator";

interface RolledStatsPanelProps {
  rollCount: number;
  rolledBoxes: Record<Ability, { rolls: number[]; total: number } | null>;
  isRolling: boolean;
  rollAllStats: () => void;
  handleRollsReset: () => void;
  handleAssignManually: () => void;
  handleShuffleAssign: () => void;
  showAssignPanel: boolean;
  selectedStandardClass: string | null;
  setSelectedStandardClass: (value: string) => void;
  selectedBackground: string;
  handleBackgroundChange: (value: string | null) => void;
  featBonusEnabled: boolean;
  setFeatBonusEnabled: (value: boolean) => void;
  primaryDisplay: string | undefined;
  standardScores: Record<Ability, number | null>;
  bgBonuses: Record<Ability, number>;
  manualBonuses: Record<Ability, number>;
  primaryStats: Ability[];
  bgAbilities: Ability[];
  enforceAsiFromBackground: boolean;
  getRolledTotals: () => number[];
  handleRolledAssignChange: (ability: Ability, value: string | null) => void;
  handleBgBonusChange: (ability: Ability, value: number) => void;
  handleManualBonusChange: (ability: Ability, value: number) => void;
  bgBonusRemaining: number;
  bgBonusPool: number;
  bgPoolColor: string;
  handleShareAssigned: () => void;
  handleAssignmentReset: () => void;
  copied: boolean;
  settings: any;
}

export const RolledStatsPanel: React.FC<RolledStatsPanelProps> = ({
  rollCount,
  rolledBoxes,
  isRolling,
  rollAllStats,
  handleRollsReset,
  handleAssignManually,
  handleShuffleAssign,
  showAssignPanel,
  selectedStandardClass,
  setSelectedStandardClass,
  selectedBackground,
  handleBackgroundChange,
  featBonusEnabled,
  setFeatBonusEnabled,
  primaryDisplay,
  standardScores,
  bgBonuses,
  manualBonuses,
  primaryStats,
  bgAbilities,
  enforceAsiFromBackground,
  getRolledTotals,
  handleRolledAssignChange,
  handleBgBonusChange,
  handleManualBonusChange,
  bgBonusRemaining,
  bgBonusPool,
  bgPoolColor,
  handleShareAssigned,
  handleAssignmentReset,
  copied,
  settings,
}) => {
  return (
    <div className="space-y-4">
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
            ? rolls.toSorted((a, b) => b - a)
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
            <Dices className="size-4 mr-2" />
            {isRolling ? "Rolling..." : "Roll Stats"}
          </Button>
          <Button variant="outline" onClick={handleRollsReset} disabled={isRolling}>
            <RotateCcw className="size-4 mr-2" />
            Reset
          </Button>
        </div>
        <div className="hidden md:block md:flex-1"></div>
        <div className="flex flex-wrap items-center justify-center gap-2">
          <Button variant="outline" onClick={handleAssignManually} disabled={isRolling}>
            Assign manually
          </Button>
          <Button variant="outline" onClick={handleShuffleAssign} disabled={isRolling}>
            <Shuffle className="size-4 mr-2" />
            Shuffle
          </Button>
        </div>
      </div>

      {showAssignPanel && (
        <div className="overflow-x-auto mt-6 pt-4 border-t">
          <StatGeneratorSelectorRow
            classValue={selectedStandardClass ?? ""}
            onClassChange={(value) => {
              if (value !== null) {
                setSelectedStandardClass(value);
              }
            }}
            classOptions={[CHOOSE_STANDARD_CLASS, ...classNames]}
            classPlaceholder={CHOOSE_STANDARD_CLASS}
            backgroundValue={selectedBackground}
            onBackgroundChange={handleBackgroundChange}
            backgroundOptions={[CHOOSE_BACKGROUND, ...backgroundNames]}
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
              const showBgStepper = selectedBackground === CHOOSE_BACKGROUND ? true : (enforceAsiFromBackground ? isBgAbility : true);
              const pool = getRolledTotals();
              const availablePool = pool.slice().sort((a, b) => b - a);

              // Build unique index mapping for duplicate rolled scores (using availablePool which is sorted!)
              const poolUsed = new Array(availablePool.length).fill(false);
              const abilityToIndex = {} as Record<Ability, number | null>;
              ABILITIES.forEach((ab) => {
                const val = standardScores[ab];
                if (val === null) {
                  abilityToIndex[ab] = null;
                  return;
                }
                const idx = availablePool.findIndex((p, i) => p === val && !poolUsed[i]);
                if (idx !== -1) {
                  poolUsed[idx] = true;
                  abilityToIndex[ab] = idx;
                } else {
                  abilityToIndex[ab] = null;
                }
              });

              const scoreIndex = abilityToIndex[ability];
              const selectValue = (score !== null && scoreIndex !== null) ? `${score}-${scoreIndex}` : "";

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
                        value={selectValue}
                        onValueChange={(val) => {
                          if (!val) {
                            handleRolledAssignChange(ability, "");
                          } else {
                            const scoreVal = val.split("-")[0];
                            handleRolledAssignChange(ability, scoreVal);
                          }
                        }}
                      >
                        <SelectTrigger className="rounded-none w-full" aria-label={`Assign Score to ${ability}`}>
                          <SelectValue placeholder="—">
                            {(value) => {
                              if (!value) return null;
                              return value.split("-")[0];
                            }}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">
                            —
                          </SelectItem>
                          {(() => {
                            const assignedScores: number[] = [];
                            ABILITIES.forEach((ab) => {
                              if (ab === ability) return;
                              const val = standardScores[ab];
                              if (val !== null) {
                                assignedScores.push(val);
                              }
                            });
                            return availablePool.map((opt, idx) => {
                              const assignedIdx = assignedScores.indexOf(opt);
                              const isAssigned = assignedIdx !== -1;
                              if (isAssigned) {
                                assignedScores.splice(assignedIdx, 1);
                              }
                              return (
                                <SelectItem key={`${opt}-${idx}`} value={`${opt}-${idx}`} hideIndicator={true}>
                                  <div className="flex items-center justify-between w-full">
                                    <span>{opt}</span>
                                    {isAssigned && <Check className="size-3.5 text-muted-foreground/70 shrink-0 ml-4" />}
                                  </div>
                                </SelectItem>
                              );
                            });
                          })()}
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
                  <th className="text-center">
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

                  // Build unique index mapping for duplicate rolled scores (using availablePool which is sorted!)
                  const poolUsed = new Array(availablePool.length).fill(false);
                  const abilityToIndex = {} as Record<Ability, number | null>;
                  ABILITIES.forEach((ab) => {
                    const val = standardScores[ab];
                    if (val === null) {
                      abilityToIndex[ab] = null;
                      return;
                    }
                    const idx = availablePool.findIndex((p, i) => p === val && !poolUsed[i]);
                    if (idx !== -1) {
                      poolUsed[idx] = true;
                      abilityToIndex[ab] = idx;
                    } else {
                      abilityToIndex[ab] = null;
                    }
                  });

                  const scoreIndex = abilityToIndex[ability];
                  const selectValue = (score !== null && scoreIndex !== null) ? `${score}-${scoreIndex}` : "";

                  const isBgAbility = bgAbilities.includes(ability);
                  const isPrimary = primaryStats.includes(ability);
                  const showBgStepper = selectedBackground === CHOOSE_BACKGROUND ? true : (enforceAsiFromBackground ? isBgAbility : true);

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
                          <Select
                            value={selectValue}
                            onValueChange={(val) => {
                              if (!val) {
                                handleRolledAssignChange(ability, "");
                              } else {
                                const scoreVal = val.split("-")[0];
                                handleRolledAssignChange(ability, scoreVal);
                              }
                            }}
                          >
                            <SelectTrigger className="rounded-none w-28 bg-background/50" aria-label={`Assign Score to ${ability}`}>
                              <SelectValue placeholder="Select">
                                {(value) => {
                                  if (!value) return null;
                                  return value.split("-")[0];
                                }}
                              </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="">
                                -
                              </SelectItem>
                              {(() => {
                                const assignedScores: number[] = [];
                                ABILITIES.forEach((ab) => {
                                  if (ab === ability) return;
                                  const val = standardScores[ab];
                                  if (val !== null) {
                                    assignedScores.push(val);
                                  }
                                });
                                return availablePool.map((option, idx) => {
                                  const assignedIdx = assignedScores.indexOf(option);
                                  const isAssigned = assignedIdx !== -1;
                                  if (isAssigned) {
                                    assignedScores.splice(assignedIdx, 1);
                                  }
                                  return (
                                    <SelectItem key={`${option}-${idx}`} value={`${option}-${idx}`} hideIndicator={true}>
                                      <div className="flex items-center justify-between w-full">
                                        <span>{option}</span>
                                        {isAssigned && <Check className="size-3.5 text-muted-foreground/70 shrink-0 ml-4" />}
                                      </div>
                                    </SelectItem>
                                  );
                                });
                              })()}
                            </SelectContent>
                          </Select>
                        </CenteredCellContent>
                      </td>

                      <td className="">
                        <CenteredCellContent>
                          {showBgStepper ? (
                            <StepperInput className="rounded-none w-28 bg-background/50" value={bgBonus} min={0} max={BG_BONUS_MAX} onChange={(val) => handleBgBonusChange(ability, val)} />
                          ) : (
                            <span className="inline-block w-28 text-center text-muted-foreground/30 select-none font-medium">-</span>
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

          <div className="flex flex-col sm:flex-row sm:items-center justify-between mt-2 gap-4">
            <div className="flex flex-wrap items-center gap-2 sm:gap-2">
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
    </div>
  );
};
