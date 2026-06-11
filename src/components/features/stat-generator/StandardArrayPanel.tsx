import React from "react";

import { classNames } from "@/lib/classes";
import { backgroundNames } from "@/lib/backgrounds";
import { StatGeneratorSelectorRow } from "./StatGeneratorSelectorRow";
import { PoolStatus } from "./StatDisplayComponents";
import { StandardArrayMobile } from "./StandardArrayMobile";
import { StandardArrayDesktop } from "./StandardArrayDesktop";
import { ResetButton, ShareButton } from "@/components/ui/action-buttons";
import type { Ability } from "@/types";
import { CHOOSE_STANDARD_CLASS, CHOOSE_BACKGROUND } from "./useStatGenerator";

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

      <StandardArrayMobile
        primaryStats={primaryStats}
        standardScores={standardScores}
        bgBonuses={bgBonuses}
        manualBonuses={manualBonuses}
        bgAbilities={bgAbilities}
        enforceAsiFromBackground={enforceAsiFromBackground}
        selectedBackground={selectedBackground}
        featBonusEnabled={featBonusEnabled}
        handleStandardScoreChange={handleStandardScoreChange}
        handleBgBonusChange={handleBgBonusChange}
        handleManualBonusChange={handleManualBonusChange}
      />

      <StandardArrayDesktop
        primaryStats={primaryStats}
        standardScores={standardScores}
        bgBonuses={bgBonuses}
        manualBonuses={manualBonuses}
        bgAbilities={bgAbilities}
        enforceAsiFromBackground={enforceAsiFromBackground}
        selectedBackground={selectedBackground}
        selectedStandardClass={selectedStandardClass}
        featBonusEnabled={featBonusEnabled}
        handleStandardScoreChange={handleStandardScoreChange}
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
          <ResetButton onClick={handleStandardReset} className="shadow-sm hover:shadow-md transition-all" />
          <ShareButton onClick={handleShareLink} copied={copied} className="shadow-sm hover:shadow-md transition-all" />
        </div>
      </div>
    </div>
  );
};
