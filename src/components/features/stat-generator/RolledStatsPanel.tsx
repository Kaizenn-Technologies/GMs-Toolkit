/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { Dices, RotateCcw, Shuffle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ABILITIES, getModifier, formatModifier } from "@/lib/stat-generator";
import { classNames } from "@/lib/classes";
import { backgroundNames } from "@/lib/backgrounds";
import { StatGeneratorSelectorRow } from "./StatGeneratorSelectorRow";
import { PoolStatus } from "./StatDisplayComponents";
import { RolledStatsMobile } from "./RolledStatsMobile";
import { RolledStatsDesktop } from "./RolledStatsDesktop";
import { ResetButton, ShareButton } from "@/components/ui/action-buttons";
import type { Ability } from "@/types";
import { CHOOSE_STANDARD_CLASS, CHOOSE_BACKGROUND } from "./useStatGenerator";

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

          <RolledStatsMobile
            primaryStats={primaryStats}
            standardScores={standardScores}
            bgBonuses={bgBonuses}
            manualBonuses={manualBonuses}
            bgAbilities={bgAbilities}
            enforceAsiFromBackground={enforceAsiFromBackground}
            selectedBackground={selectedBackground}
            featBonusEnabled={featBonusEnabled}
            getRolledTotals={getRolledTotals}
            handleRolledAssignChange={handleRolledAssignChange}
            handleBgBonusChange={handleBgBonusChange}
            handleManualBonusChange={handleManualBonusChange}
          />

          <RolledStatsDesktop
            primaryStats={primaryStats}
            standardScores={standardScores}
            bgBonuses={bgBonuses}
            manualBonuses={manualBonuses}
            bgAbilities={bgAbilities}
            enforceAsiFromBackground={enforceAsiFromBackground}
            selectedBackground={selectedBackground}
            featBonusEnabled={featBonusEnabled}
            getRolledTotals={getRolledTotals}
            handleRolledAssignChange={handleRolledAssignChange}
            handleBgBonusChange={handleBgBonusChange}
            handleManualBonusChange={handleManualBonusChange}
          />

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
