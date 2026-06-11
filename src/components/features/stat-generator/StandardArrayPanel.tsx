import React from "react";
import { Check } from "lucide-react";
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
import { BG_BONUS_MAX, MANUAL_BONUS_MAX, CHOOSE_STANDARD_CLASS, CHOOSE_BACKGROUND, STANDARD_ARRAY_OPTIONS } from "./useStatGenerator";

interface StandardArrayPanelProps {
  selectedStandardClass: string | null;
  handleStandardClassChange: (value: string | null) => void;
  selectedBackground: string;
  handleBackgroundChange: (value: string | null) => void;
  featBonusEnabled: boolean;
  setFeatBonusEnabled: (value: boolean) => void;
  primaryStats: Ability[];
  primaryDisplay: string | undefined;
  standardScores: Record<Ability, number | null>;
  bgBonuses: Record<Ability, number>;
  manualBonuses: Record<Ability, number>;
  bgAbilities: Ability[];
  enforceAsiFromBackground: boolean;
  handleStandardScoreChange: (ability: Ability, value: string | null) => void;
  handleBgBonusChange: (ability: Ability, value: number) => void;
  handleManualBonusChange: (ability: Ability, value: number) => void;
  bgBonusRemaining: number;
  bgBonusPool: number;
  bgPoolColor: string;
  handleStandardReset: () => void;
  handleShareLink: () => void;
  copied: boolean;
}

export const StandardArrayPanel: React.FC<StandardArrayPanelProps> = ({
  selectedStandardClass,
  handleStandardClassChange,
  selectedBackground,
  handleBackgroundChange,
  featBonusEnabled,
  setFeatBonusEnabled,
  primaryStats,
  primaryDisplay,
  standardScores,
  bgBonuses,
  manualBonuses,
  bgAbilities,
  enforceAsiFromBackground,
  handleStandardScoreChange,
  handleBgBonusChange,
  handleManualBonusChange,
  bgBonusRemaining,
  bgBonusPool,
  bgPoolColor,
  handleStandardReset,
  handleShareLink,
  copied,
}) => {
  return (
    <div>
      <StatGeneratorSelectorRow
        classValue={selectedStandardClass ?? ""}
        onClassChange={handleStandardClassChange}
        classOptions={[CHOOSE_STANDARD_CLASS, ...classNames]}
        classPlaceholder={CHOOSE_STANDARD_CLASS}
        backgroundValue={selectedBackground}
        onBackgroundChange={handleBackgroundChange}
        backgroundOptions={[CHOOSE_BACKGROUND, ...backgroundNames]}
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
          const showBgStepper = selectedBackground === CHOOSE_BACKGROUND ? true : (enforceAsiFromBackground ? isBgAbility : true);

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
                    onValueChange={(val) => handleStandardScoreChange(ability, val || null)}
                  >
                    <SelectTrigger className="rounded-none w-full" aria-label={`Assign Standard Array to ${ability}`}>
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
                        return STANDARD_ARRAY_OPTIONS.map((option) => {
                          const assignedIdx = assignedScores.indexOf(option);
                          const isAssigned = assignedIdx !== -1;
                          if (isAssigned) {
                            assignedScores.splice(assignedIdx, 1);
                          }
                          return (
                            <SelectItem key={option} value={String(option)} hideIndicator={true}>
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
              const total =
                score === null
                  ? null
                  : score + bgBonus + (featBonusEnabled ? manualBonus : 0);
              const modifier = total === null ? null : getModifier(total);
              const isPrimary = primaryStats.includes(ability);
              const isBgAbility = bgAbilities.includes(ability);
              const showBgStepper = selectedBackground === CHOOSE_BACKGROUND ? true : (enforceAsiFromBackground ? isBgAbility : true);

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
                    primaryTooltip={`Primary stat for ${!selectedStandardClass || selectedStandardClass === CHOOSE_STANDARD_CLASS
                      ? "selected class"
                      : selectedStandardClass}`}
                  />

                  <td className="">
                    <CenteredCellContent>
                      <Select
                        value={score === null ? "" : String(score)}
                        onValueChange={(val) =>
                          handleStandardScoreChange(ability, val || null)
                        }
                      >
                        <SelectTrigger className="rounded-none w-28 bg-background/50" aria-label={`Assign Standard Array to ${ability}`}>
                          <SelectValue placeholder="Select">
                            {(value) => {
                              if (!value) return null;
                              return value.split("-")[0];
                            }}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">
                            Select
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
                            return STANDARD_ARRAY_OPTIONS.map((option) => {
                              const assignedIdx = assignedScores.indexOf(option);
                              const isAssigned = assignedIdx !== -1;
                              if (isAssigned) {
                                assignedScores.splice(assignedIdx, 1);
                              }
                              return (
                                <SelectItem key={option} value={String(option)} hideIndicator={true}>
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
          <ResetButton onClick={handleStandardReset} className="shadow-sm hover:shadow-md transition-all" />
          <ShareButton onClick={handleShareLink} copied={copied} className="shadow-sm hover:shadow-md transition-all" />
        </div>
      </div>
    </div>
  );
};
