import { Card, CardContent } from "@/components/ui/card";
import { classes } from "@/lib/classes";
import { backgrounds } from "@/lib/backgrounds";
import type { Ability, ClassData, BackgroundData, Skills } from "@/types";
import { getModifier, getPoolStatusClass, formatModifier } from "@/lib/stat-generator";
import { PageHeader } from "@/components/layout/PageHeader";
import { ShareModal } from "@/components/features/ShareModal";
import { VerifiedLoadPanel } from "@/components/features/VerifiedLoadPanel";
import { StatGeneratorTabs } from "./StatGeneratorTabs";
import { SkillsSavingThrowsPanel } from "./SkillsSavingThrowsPanel";
import {
  useStatGenerator,
  CHOOSE_BACKGROUND,
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
  const activeClassData = Object.values(classes).find((c) => c.name === activeClass) as ClassData | undefined;
  const activeBackgroundData = Object.values(backgrounds).find((b) => b.name === selectedBackground) as BackgroundData | undefined;

  const bgSkills = activeBackgroundData?.skillProficiencies ?? [];
  const enforceClassSkills = settings.sitewide.enforceClassSkills;
  const hasSkillProficiencies = !!(activeClassData?.skillProficiencies && activeClassData.skillProficiencies.length > 0);
  const shouldShowClassPills = enforceClassSkills && hasSkillProficiencies;

  const spentClassSkills = activeClassData
    ? (shouldShowClassPills
      ? (activeClassData.skillProficiencies ?? []).filter(
        (skill) => (skillsState[skill] === "prof" || skillsState[skill] === "expertise") && !bgSkills.includes(skill as Skills)
      ).length
      : Object.keys(skillsState).filter(
        (skill) => (skillsState[skill] === "prof" || skillsState[skill] === "expertise") && !bgSkills.includes(skill as Skills)
      ).length)
    : 0;

  const classSkillsRemaining = activeClassData
    ? Math.max(0, activeClassData.skillPoints - spentClassSkills)
    : 0;

  const classSkillsPoolColor = getPoolStatusClass(classSkillsRemaining);

  const profBonus = Math.floor((level - 1) / 4) + 2;



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
          <StatGeneratorTabs
            activeTab={activeTab}
            location={location}
            navigate={navigate}
            selectedClass={selectedClass}
            setSelectedClass={setSelectedClass}
            selectedBackground={selectedBackground}
            handleBackgroundChange={handleBackgroundChange}
            featBonusEnabled={featBonusEnabled}
            setFeatBonusEnabled={setFeatBonusEnabled}
            primaryStats={primaryStats}
            primaryDisplay={primaryDisplay}
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
            selectedStandardClass={selectedStandardClass}
            handleStandardClassChange={handleStandardClassChange}
            standardScores={standardScores}
            handleStandardScoreChange={handleStandardScoreChange}
            handleStandardReset={handleStandardReset}
            rollCount={rollCount}
            rolledBoxes={rolledBoxes}
            isRolling={isRolling}
            rollAllStats={rollAllStats}
            handleRollsReset={handleRollsReset}
            handleAssignManually={handleAssignManually}
            handleShuffleAssign={handleShuffleAssign}
            showAssignPanel={showAssignPanel}
            setSelectedStandardClass={setSelectedStandardClass}
            getRolledTotals={getRolledTotals}
            handleRolledAssignChange={handleRolledAssignChange}
            handleShareAssigned={handleShareAssigned}
            handleAssignmentReset={handleAssignmentReset}
            settings={settings}
          />
        </CardContent>
      </Card>

      <SkillsSavingThrowsPanel
        activeClass={activeClass}
        activeClassData={activeClassData}
        activeBackgroundData={activeBackgroundData}
        selectedBackground={selectedBackground}
        shouldShowClassPills={shouldShowClassPills}
        classSkillsPoolColor={classSkillsPoolColor}
        classSkillsRemaining={classSkillsRemaining}
        skillsState={skillsState}
        savingThrowsState={savingThrowsState}
        handleSkillChange={handleSkillChange}
        handleSavingThrowChange={handleSavingThrowChange}
        getSavingThrowValue={getSavingThrowValue}
        getSavingThrowValueRaw={getSavingThrowValueRaw}
        getSkillValue={getSkillValue}
        getSkillValueRaw={getSkillValueRaw}
        level={level}
        setLevel={setLevel}
        profBonus={profBonus}
        handleSkillsReset={handleSkillsReset}
        bgSkills={bgSkills}
        settings={settings}
        CHOOSE_BACKGROUND={CHOOSE_BACKGROUND}
      />

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
