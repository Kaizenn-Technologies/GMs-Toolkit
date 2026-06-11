/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { GraduationCap, Briefcase, Check, Sparkles } from "lucide-react";
import { ProgressionReferencePanel } from "./ProgressionReferencePanel";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { StepperInput } from "@/components/ui/stepper-input";
import { Card, CardContent } from "@/components/ui/card";
import { ResetButton } from "@/components/ui/action-buttons";
import { getTransparentColor } from "@/lib/utils";
import { SkillsSavingThrowsGrid } from "./SkillsSavingThrowsGrid";
import type { Ability, ClassData, BackgroundData } from "@/types";

interface SkillsSavingThrowsPanelProps {
  activeClass: string;
  activeClassData: ClassData | undefined;
  activeBackgroundData: BackgroundData | undefined;
  selectedBackground: string;
  shouldShowClassPills: boolean;
  classSkillsPoolColor: string;
  classSkillsRemaining: number;
  skillsState: Record<string, "none" | "prof" | "expertise">;
  savingThrowsState: Record<Ability, "none" | "prof" | "expertise">;
  handleSkillChange: (skillName: string, state: "none" | "prof" | "expertise") => void;
  handleSavingThrowChange: (ability: Ability, state: "none" | "prof" | "expertise") => void;
  getSavingThrowValue: (ability: Ability) => string;
  getSavingThrowValueRaw: (ability: Ability) => number | null;
  getSkillValue: (ability: Ability, skillName: string) => string;
  getSkillValueRaw: (ability: Ability, skillName: string) => number | null;
  level: number;
  setLevel: (level: number) => void;
  profBonus: number;
  handleSkillsReset: () => void;
  bgSkills: string[];
  settings: any;
  CHOOSE_BACKGROUND: string;
}

export const SkillsSavingThrowsPanel: React.FC<SkillsSavingThrowsPanelProps> = ({
  activeClass,
  activeClassData,
  activeBackgroundData,
  selectedBackground,
  shouldShowClassPills,
  classSkillsPoolColor,
  classSkillsRemaining,
  skillsState,
  savingThrowsState,
  handleSkillChange,
  handleSavingThrowChange,
  getSavingThrowValue,
  getSavingThrowValueRaw,
  getSkillValue,
  getSkillValueRaw,
  level,
  setLevel,
  profBonus,
  handleSkillsReset,
  bgSkills,
  settings,
  CHOOSE_BACKGROUND,
}) => {
  return (
    <div className="flex flex-col gap-4">
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

            {/* Class & Background Skill reference & pool panel */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {/* Class Skills Card */}
              <div
                className="bg-card/40 backdrop-blur-sm border border-border/40 rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col gap-3 min-h-[160px]"
                style={activeClassData?.color ? { borderTop: `3px solid ${activeClassData.color}` } : undefined}
              >
                <div className="flex items-center justify-between gap-2 flex-wrap shrink-0">
                  <div className="flex items-center gap-2">
                    <GraduationCap className="size-4 text-primary" style={activeClassData?.color ? { color: activeClassData.color } : undefined} />
                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Class Skills</span>
                  </div>
                  {activeClass ? (
                    <span
                      className="text-xs font-bold px-2 py-0.5 rounded border shadow-sm transition-all duration-300"
                      style={activeClassData?.color ? {
                        backgroundColor: getTransparentColor(activeClassData.color, 0.15),
                        borderColor: getTransparentColor(activeClassData.color, 0.4),
                        color: activeClassData.color
                      } : undefined}
                    >
                      {activeClass}
                    </span>
                  ) : null}
                </div>

                {activeClassData ? (
                  <div className="flex-1 flex flex-col justify-between gap-3">
                    <div className="flex items-center justify-between bg-muted/30 border border-border/30 rounded-lg p-2.5 shadow-sm">
                      <div className="flex flex-col">
                        <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Proficiency Points</span>
                        <span className="text-xs text-muted-foreground/80 mt-0.5">Select class-specific proficiencies</span>
                      </div>

                      <TooltipProvider delay={100}>
                        <Tooltip>
                          <TooltipTrigger
                            render={
                              <div className="cursor-help flex items-center gap-2 bg-background/60 px-3 py-1 rounded-md border border-border/50 shadow-sm transition-all hover:bg-background/80">
                                <span className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">Available</span>
                                <div className="flex items-center font-bold tabular-nums">
                                  <span className={classSkillsPoolColor}>{classSkillsRemaining}</span>
                                  <span className="text-muted-foreground/60 mx-0.5">/</span>
                                  <span className="text-muted-foreground">{activeClassData.skillPoints}</span>
                                </div>
                              </div>
                            }
                          />
                          <TooltipContent>
                            <p>Skill proficiency point pool given by Class</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>

                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {shouldShowClassPills ? (
                        (activeClassData.skillProficiencies ?? []).map((skill) => {
                          const isChosen = skillsState[skill] === "prof" || skillsState[skill] === "expertise";
                          return (
                            <button
                              key={skill}
                              type="button"
                              onClick={() => handleSkillChange(skill, isChosen ? "none" : "prof")}
                              className={`text-[11px] px-2.5 py-1 rounded-lg border transition-all duration-200 hover:scale-105 active:scale-95 flex items-center gap-1 ${isChosen
                                ? "font-bold shadow-sm"
                                : "bg-background/40 border-border/60 text-muted-foreground hover:border-muted-foreground/45 hover:text-foreground hover:bg-background/65"
                                } disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none disabled:hover:scale-100`}
                              style={
                                isChosen && activeClassData?.color
                                  ? {
                                    backgroundColor: getTransparentColor(activeClassData.color, 0.15),
                                    borderColor: getTransparentColor(activeClassData.color, 0.6),
                                    color: activeClassData.color,
                                  }
                                  : undefined
                              }
                              disabled={classSkillsRemaining <= 0 && !isChosen}
                              title={isChosen ? `Remove ${skill} proficiency` : classSkillsRemaining <= 0 ? `No class skill points remaining` : `Add ${skill} proficiency`}
                            >
                              {isChosen && <Check className="size-3 shrink-0" />}
                              {skill}
                            </button>
                          );
                        })
                      ) : (
                        <div className="flex items-center gap-2 bg-primary/5 border border-primary/10 rounded-lg p-2.5 w-full">
                          <Sparkles className="size-4 text-primary shrink-0 animate-pulse" />
                          <span className="text-[11px] font-semibold text-primary">
                            Select any {activeClassData.skillPoints} skills directly in the saving throw cards below.
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center py-5 px-4 text-center border border-dashed border-border/60 bg-muted/5 rounded-xl">
                    <span className="text-xs text-muted-foreground/80 italic">
                      Select a class above to allocate skill points.
                    </span>
                  </div>
                )}
              </div>

              {/* Background Skills Card */}
              <div
                className="bg-card/40 backdrop-blur-sm border border-border/40 rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col gap-3 min-h-[160px]"
                style={selectedBackground !== CHOOSE_BACKGROUND ? { borderTop: `3px solid #f59e0b` } : undefined}
              >
                <div className="flex items-center justify-between gap-2 flex-wrap shrink-0">
                  <div className="flex items-center gap-2">
                    <Briefcase className="size-4 text-amber-500" />
                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Background Skills</span>
                  </div>
                  {selectedBackground !== CHOOSE_BACKGROUND ? (
                    <span className="text-xs font-bold px-2 py-0.5 rounded border bg-amber-500/10 border-amber-500/20 text-amber-500 shadow-sm">
                      {selectedBackground}
                    </span>
                  ) : null}
                </div>

                {selectedBackground !== CHOOSE_BACKGROUND ? (
                  <div className="flex-1 flex flex-col justify-between gap-3">
                    <div className="flex items-center justify-between bg-muted/30 border border-border/30 rounded-lg p-2.5 shadow-sm">
                      <div className="flex flex-col">
                        <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Granted Proficiencies</span>
                        <span className="text-xs text-muted-foreground/80 mt-0.5">Skills automatically provided by background</span>
                      </div>

                      <TooltipProvider delay={100}>
                        <Tooltip>
                          <TooltipTrigger
                            render={
                              <div className="cursor-help flex items-center gap-1.5 bg-background/60 px-2.5 py-1 rounded-md border border-border/50 shadow-sm text-amber-500">
                                <span className="text-[10px] font-extrabold uppercase tracking-wider">Active</span>
                                <Check className="size-3 shrink-0" />
                              </div>
                            }
                          />
                          <TooltipContent>
                            <p>Background proficiencies are enabled</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>

                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {activeBackgroundData && activeBackgroundData.skillProficiencies && activeBackgroundData.skillProficiencies.length > 0 ? (
                        activeBackgroundData.skillProficiencies.map((skill) => {
                          const isChosen = skillsState[skill] === "prof" || skillsState[skill] === "expertise";
                          return (
                            <button
                              key={skill}
                              type="button"
                              onClick={() => handleSkillChange(skill, isChosen ? "none" : "prof")}
                              className={`text-[11px] px-2.5 py-1 rounded-lg border transition-all duration-200 hover:scale-105 active:scale-95 flex items-center gap-1 ${isChosen
                                ? "bg-amber-500/10 border-amber-500/40 text-amber-500 font-semibold shadow-sm"
                                : "bg-background/40 border-border/60 text-muted-foreground hover:border-muted-foreground/45 hover:text-foreground hover:bg-background/65"
                                }`}
                              title={`Toggle ${skill} proficiency`}
                            >
                              {isChosen && <Check className="size-3 shrink-0" />}
                              {skill}
                            </button>
                          );
                        })
                      ) : (
                        <div className="flex items-center gap-2 bg-muted/10 rounded-lg border border-border/40 p-2.5 w-full">
                          <span className="text-[11px] text-muted-foreground italic">
                            No skill proficiencies given by this background.
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center py-5 px-4 text-center border border-dashed border-border/60 bg-muted/5 rounded-xl">
                    <span className="text-xs text-muted-foreground/80 italic">
                      Select a background above to view its automatic proficiencies.
                    </span>
                  </div>
                )}
              </div>
            </div>

            <SkillsSavingThrowsGrid
              activeClass={activeClass}
              activeClassData={activeClassData}
              savingThrowsState={savingThrowsState}
              skillsState={skillsState}
              bgSkills={bgSkills}
              shouldShowClassPills={shouldShowClassPills}
              handleSavingThrowChange={handleSavingThrowChange}
              handleSkillChange={handleSkillChange}
              getSavingThrowValue={getSavingThrowValue}
              getSavingThrowValueRaw={getSavingThrowValueRaw}
              getSkillValue={getSkillValue}
              getSkillValueRaw={getSkillValueRaw}
            />
          </CardContent>
        </Card>
      ) : null}

      {/* Reference & Progression Helper */}
      {settings.sitewide.showProgression ? (
        <ProgressionReferencePanel />
      ) : null}
    </div>
  );
};
