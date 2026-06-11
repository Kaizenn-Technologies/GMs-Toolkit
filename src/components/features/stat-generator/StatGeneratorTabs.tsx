/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PointBuyPanel } from "./PointBuyPanel";
import { RolledStatsPanel } from "./RolledStatsPanel";
import { StandardArrayPanel } from "./StandardArrayPanel";
import { STAT_TAB_ROUTES } from "./useStatGenerator";

export interface StatGeneratorTabsProps {
  activeTab: string;
  location: any;
  navigate: (path: string) => void;
  // Shared props
  selectedClass: string;
  setSelectedClass: React.Dispatch<React.SetStateAction<string>>;
  selectedBackground: string;
  handleBackgroundChange: (value: string | null) => void;
  featBonusEnabled: boolean;
  setFeatBonusEnabled: (value: boolean) => void;
  primaryStats: any[];
  primaryDisplay: string | undefined;
  scores: any;
  bgBonuses: any;
  manualBonuses: any;
  clampedMin: number;
  clampedMax: number;
  bgAbilities: any[];
  enforceAsiFromBackground: boolean;
  handleScoreChange: any;
  handleBgBonusChange: any;
  handleManualBonusChange: any;
  bgBonusRemaining: number;
  bgBonusPool: number;
  bgPoolColor: string;
  remaining: number;
  pointPool: number;
  pointsColor: string;
  handleReset: any;
  handleShareLink: any;
  copied: boolean;

  // Standard props
  selectedStandardClass: string;
  handleStandardClassChange: (value: string | null) => void;
  standardScores: any;
  handleStandardScoreChange: any;
  handleStandardReset: any;

  // Roll props
  rollCount: number;
  rolledBoxes: any;
  isRolling: boolean;
  rollAllStats: any;
  handleRollsReset: any;
  handleAssignManually: any;
  handleShuffleAssign: any;
  showAssignPanel: boolean;
  setSelectedStandardClass: React.Dispatch<React.SetStateAction<string>>;
  getRolledTotals: any;
  handleRolledAssignChange: any;
  handleShareAssigned: any;
  handleAssignmentReset: any;
  settings: any;
}

export const StatGeneratorTabs: React.FC<StatGeneratorTabsProps> = ({
  activeTab,
  location,
  navigate,
  selectedClass,
  setSelectedClass,
  selectedBackground,
  handleBackgroundChange,
  featBonusEnabled,
  setFeatBonusEnabled,
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
  selectedStandardClass,
  handleStandardClassChange,
  standardScores,
  handleStandardScoreChange,
  handleStandardReset,
  rollCount,
  rolledBoxes,
  isRolling,
  rollAllStats,
  handleRollsReset,
  handleAssignManually,
  handleShuffleAssign,
  showAssignPanel,
  setSelectedStandardClass,
  getRolledTotals,
  handleRolledAssignChange,
  handleShareAssigned,
  handleAssignmentReset,
  settings,
}) => {
  return (
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
        <PointBuyPanel
          selectedClass={selectedClass}
          setSelectedClass={setSelectedClass}
          selectedBackground={selectedBackground}
          handleBackgroundChange={handleBackgroundChange}
          featBonusEnabled={featBonusEnabled}
          onFeatBonusChange={setFeatBonusEnabled}
          primaryStats={primaryStats}
          primaryDisplay={primaryStats.length > 0 ? primaryDisplay : undefined}
          scores={scores}
          bgBonuses={bgBonuses}
          manualBonuses={manualBonuses}
          clampedMin={clampedMin}
          clampedMax={clampedMax}
          bgAbilities={bgAbilities}
          enforceAsiFromBackground={enforceAsiFromBackground}
          handleScoreChange={handleScoreChange}
          handleBgBonusChange={handleBgBonusChange}
          handleManualBonusChange={handleManualBonusChange}
          bgBonusRemaining={bgBonusRemaining}
          bgBonusPool={bgBonusPool}
          bgPoolColor={bgPoolColor}
          remaining={remaining}
          pointPool={pointPool}
          pointsColor={pointsColor}
          handleReset={handleReset}
          handleShareLink={handleShareLink}
          copied={copied}
        />
      </TabsContent>

      <TabsContent value="roll" className="space-y-4">
        <RolledStatsPanel
          rollCount={rollCount}
          rolledBoxes={rolledBoxes}
          isRolling={isRolling}
          rollAllStats={rollAllStats}
          handleRollsReset={handleRollsReset}
          handleAssignManually={handleAssignManually}
          handleShuffleAssign={handleShuffleAssign}
          showAssignPanel={showAssignPanel}
          selectedStandardClass={selectedStandardClass}
          setSelectedStandardClass={setSelectedStandardClass}
          selectedBackground={selectedBackground}
          handleBackgroundChange={handleBackgroundChange}
          featBonusEnabled={featBonusEnabled}
          setFeatBonusEnabled={setFeatBonusEnabled}
          primaryDisplay={primaryDisplay}
          standardScores={standardScores}
          bgBonuses={bgBonuses}
          manualBonuses={manualBonuses}
          primaryStats={primaryStats}
          bgAbilities={bgAbilities}
          enforceAsiFromBackground={enforceAsiFromBackground}
          getRolledTotals={getRolledTotals}
          handleRolledAssignChange={handleRolledAssignChange}
          handleBgBonusChange={handleBgBonusChange}
          handleManualBonusChange={handleManualBonusChange}
          bgBonusRemaining={bgBonusRemaining}
          bgBonusPool={bgBonusPool}
          bgPoolColor={bgPoolColor}
          handleShareAssigned={handleShareAssigned}
          handleAssignmentReset={handleAssignmentReset}
          copied={copied}
          settings={settings}
        />
      </TabsContent>

      <TabsContent value="standard" className="space-y-6">
        <StandardArrayPanel
          selectedStandardClass={selectedStandardClass}
          handleStandardClassChange={handleStandardClassChange}
          selectedBackground={selectedBackground}
          handleBackgroundChange={handleBackgroundChange}
          featBonusEnabled={featBonusEnabled}
          setFeatBonusEnabled={setFeatBonusEnabled}
          primaryStats={primaryStats}
          primaryDisplay={primaryStats.length > 0 ? primaryDisplay : undefined}
          standardScores={standardScores}
          bgBonuses={bgBonuses}
          manualBonuses={manualBonuses}
          bgAbilities={bgAbilities}
          enforceAsiFromBackground={enforceAsiFromBackground}
          handleStandardScoreChange={handleStandardScoreChange}
          handleBgBonusChange={handleBgBonusChange}
          handleManualBonusChange={handleManualBonusChange}
          bgBonusRemaining={bgBonusRemaining}
          bgBonusPool={bgBonusPool}
          bgPoolColor={bgPoolColor}
          handleStandardReset={handleStandardReset}
          handleShareLink={handleShareLink}
          copied={copied}
        />
      </TabsContent>
    </Tabs>
  );
};
