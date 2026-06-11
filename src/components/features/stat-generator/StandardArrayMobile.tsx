import React from "react";
import { Check } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StepperInput } from "@/components/ui/stepper-input";
import { ABILITIES, ABILITY_ABBR, getModifier, getModifierClass, formatModifier } from "@/lib/stat-generator";
import { TotalScoreDisplay } from "./StatDisplayComponents";
import type { Ability } from "@/types";
import { BG_BONUS_MAX, MANUAL_BONUS_MAX, CHOOSE_BACKGROUND, STANDARD_ARRAY_OPTIONS } from "./useStatGenerator";

export interface StandardArrayMobileProps {
  primaryStats: Ability[];
  standardScores: Record<Ability, number | null>;
  bgBonuses: Record<Ability, number>;
  manualBonuses: Record<Ability, number>;
  bgAbilities: Ability[];
  enforceAsiFromBackground: boolean;
  selectedBackground: string;
  featBonusEnabled: boolean;
  handleStandardScoreChange: (ability: Ability, value: string | null) => void;
  handleBgBonusChange: (ability: Ability, value: number) => void;
  handleManualBonusChange: (ability: Ability, value: number) => void;
}

export const StandardArrayMobile: React.FC<StandardArrayMobileProps> = ({
  primaryStats,
  standardScores,
  bgBonuses,
  manualBonuses,
  bgAbilities,
  enforceAsiFromBackground,
  selectedBackground,
  featBonusEnabled,
  handleStandardScoreChange,
  handleBgBonusChange,
  handleManualBonusChange,
}) => {
  return (
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
  );
};
