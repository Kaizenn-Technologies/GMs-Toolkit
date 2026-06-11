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
import {
  AbilityNameCell,
  CenteredCellContent,
  ModifierDisplay,
  TotalScoreDisplay,
} from "./StatDisplayComponents";
import type { Ability } from "@/types";
import { BG_BONUS_MAX, MANUAL_BONUS_MAX, CHOOSE_BACKGROUND } from "./useStatGenerator";

export interface RolledStatsDesktopProps {
  primaryStats: Ability[];
  standardScores: Record<Ability, number | null>;
  bgBonuses: Record<Ability, number>;
  manualBonuses: Record<Ability, number>;
  bgAbilities: Ability[];
  enforceAsiFromBackground: boolean;
  selectedBackground: string;
  featBonusEnabled: boolean;
  getRolledTotals: () => number[];
  handleRolledAssignChange: (ability: Ability, value: string | null) => void;
  handleBgBonusChange: (ability: Ability, value: number) => void;
  handleManualBonusChange: (ability: Ability, value: number) => void;
}

export const RolledStatsDesktop: React.FC<RolledStatsDesktopProps> = ({
  primaryStats,
  standardScores,
  bgBonuses,
  manualBonuses,
  bgAbilities,
  enforceAsiFromBackground,
  selectedBackground,
  featBonusEnabled,
  getRolledTotals,
  handleRolledAssignChange,
  handleBgBonusChange,
  handleManualBonusChange,
}) => {
  return (
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
                  <TotalScoreDisplay value={total ?? "-"} />
                </td>

                <td className="text-center rounded-none">
                  <ModifierDisplay
                    value={modifier === null ? "-" : formatModifier(modifier)}
                    className={getModifierClass(modifier)}
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
