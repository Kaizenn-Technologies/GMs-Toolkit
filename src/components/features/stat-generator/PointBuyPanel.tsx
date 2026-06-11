import React from "react";
import { ABILITIES, ABILITY_ABBR, getModifier, getModifierClass, formatModifier } from "@/lib/stat-generator";
import { classNames } from "@/lib/classes";
import { backgroundNames } from "@/lib/backgrounds";
import { StatGeneratorSelectorRow } from "./StatGeneratorSelectorRow";
import { StepperInput } from "@/components/ui/stepper-input";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
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

interface PointBuyPanelProps {
  selectedClass: string;
  setSelectedClass: (value: string) => void;
  selectedBackground: string;
  handleBackgroundChange: (value: string | null) => void;
  featBonusEnabled: boolean;
  onFeatBonusChange: (value: boolean) => void;
  primaryStats: Ability[];
  primaryDisplay: string | undefined;
  scores: Record<Ability, number>;
  bgBonuses: Record<Ability, number>;
  manualBonuses: Record<Ability, number>;
  clampedMin: number;
  clampedMax: number;
  bgAbilities: Ability[];
  enforceAsiFromBackground: boolean;
  handleScoreChange: (ability: Ability, val: number) => void;
  handleBgBonusChange: (ability: Ability, val: number) => void;
  handleManualBonusChange: (ability: Ability, val: number) => void;
  bgBonusRemaining: number;
  bgBonusPool: number;
  bgPoolColor: string;
  remaining: number;
  pointPool: number;
  pointsColor: string;
  handleReset: () => void;
  handleShareLink: () => void;
  copied: boolean;
}

export const PointBuyPanel: React.FC<PointBuyPanelProps> = ({
  selectedClass,
  setSelectedClass,
  selectedBackground,
  handleBackgroundChange,
  featBonusEnabled,
  onFeatBonusChange,
  primaryStats,
  primaryDisplay,
  scores,
  bgBonuses,
  manualBonuses,
  clampedMin,
  clampedMax,
  bgAbilities,
  enforceAsiFromBackground,
  handleScoreChange,
  handleBgBonusChange,
  handleManualBonusChange,
  bgBonusRemaining,
  bgBonusPool,
  bgPoolColor,
  remaining,
  pointPool,
  pointsColor,
  handleReset,
  handleShareLink,
  copied,
}) => {
  return (
    <div>
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
        backgroundOptions={[CHOOSE_BACKGROUND, ...backgroundNames]}
        featBonusEnabled={featBonusEnabled}
        onFeatBonusChange={onFeatBonusChange}
        primaryDisplay={primaryStats.length > 0 ? primaryDisplay : undefined}
      />

      {/* Mobile: 2-col card grid */}
      <div className="grid grid-cols-2 gap-2 md:hidden">
        {ABILITIES.map((ability) => {
          const score = scores[ability];
          const bgBonus = bgBonuses[ability];
          const manualBonus = manualBonuses[ability];
          const total = score + bgBonus + (featBonusEnabled ? manualBonus : 0);
          const modifier = getModifier(total);
          const isPrimary = primaryStats.includes(ability);
          const isBgAbility = bgAbilities.includes(ability);
          const isAboveMax = score > clampedMax;
          const showBgStepper = selectedBackground === CHOOSE_BACKGROUND ? true : (enforceAsiFromBackground ? isBgAbility : true);
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
              const score = scores[ability];
              const bgBonus = bgBonuses[ability];
              const manualBonus = manualBonuses[ability];
              const total =
                score + bgBonus + (featBonusEnabled ? manualBonus : 0);
              const modifier = getModifier(total);
              const isPrimary = primaryStats.includes(ability);
              const isBgAbility = bgAbilities.includes(ability);
              const isAboveMax = score > clampedMax;

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
        <div className="flex flex-wrap items-center gap-2 sm:gap-2">
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
    </div>
  );
};
