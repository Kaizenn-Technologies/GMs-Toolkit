import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { GraduationCap, Briefcase, Check, Sparkles } from "lucide-react";
import { ProgressionReferencePanel } from "./ProgressionReferencePanel";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { StepperInput } from "@/components/ui/stepper-input";
import { Card, CardContent } from "@/components/ui/card";
import { ResetButton } from "@/components/ui/action-buttons";
import { ABILITIES, getModifierClass } from "@/lib/stat-generator";
import { getTransparentColor } from "@/lib/utils";
import type { Ability, ClassData, BackgroundData, Skills } from "@/types";

const SKILL_MAPPING: Record<Ability, string[]> = {
  Strength: ["Athletics"],
  Dexterity: ["Acrobatics", "Sleight of Hand", "Stealth"],
  Constitution: [],
  Intelligence: ["Arcana", "History", "Investigation", "Nature", "Religion"],
  Wisdom: ["Animal Handling", "Insight", "Medicine", "Perception", "Survival"],
  Charisma: ["Deception", "Intimidation", "Performance", "Persuasion"],
};

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

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {ABILITIES.map((ability) => {
                const skills = SKILL_MAPPING[ability];

                return (
                  <div key={ability} className="flex flex-col border border-border bg-card/60 backdrop-blur-sm rounded-lg shadow-sm hover:shadow-md transition-all">
                    {/* Ability Header with Integrated Saving Throw */}
                    <div className="bg-muted/60 py-2 px-3 text-center border-b border-border/50 flex items-center justify-between rounded-t-lg">
                      <div className="flex items-center gap-2 min-w-0">
                        <SkillDropdown
                          state={savingThrowsState[ability]}
                          isBard={activeClass === "Bard"}
                          isSkill={false}
                          onChange={(state) => handleSavingThrowChange(ability, state)}
                        />
                        <span className="text-xs uppercase tracking-widest text-foreground font-bold truncate">
                          <span className="hidden sm:inline lg:hidden xl:inline">{ability}</span>
                          <span className="sm:hidden lg:inline xl:hidden">{ability.slice(0, 3)}</span> Saving Throw
                        </span>
                      </div>
                      <span className={`font-mono font-bold text-md bg-background/60 px-2 py-0.5 min-w-[32px] text-center rounded shrink-0 ${getModifierClass(getSavingThrowValueRaw(ability))}`}>
                        {getSavingThrowValue(ability)}
                      </span>
                    </div>

                    {/* Body with Skills (if any) */}
                    {skills.length > 0 && (
                      <div className="flex-1 p-3">
                        {skills.map((skill, index) => (
                          <div key={skill} className="flex items-center justify-between text-sm py-1">
                            <div className="flex items-center gap-1.5 min-w-0">
                              <SkillDropdown
                                state={skillsState[skill] || "none"}
                                isBard={activeClass === "Bard"}
                                isSkill={true}
                                onChange={(state) => handleSkillChange(skill, state)}
                                openUpward={index >= 2}
                                classColor={
                                  bgSkills.includes(skill as Skills)
                                    ? "#f59e0b"
                                    : shouldShowClassPills && activeClassData?.skillProficiencies?.includes(skill as Skills)
                                      ? activeClassData.color
                                      : undefined
                                }
                              />
                              <span className="truncate" title={skill}>
                                {skill}
                              </span>
                            </div>
                            <div className="flex-1 mx-2 pt-1 border-b border-dashed border-muted-foreground/40 self-center" />
                            <span className={`font-mono font-bold text-xs bg-background/60 border border-border px-1.5 py-0.5 min-w-[28px] text-center rounded shrink-0 ${getModifierClass(getSkillValueRaw(ability, skill))}`}>
                              {getSkillValue(ability, skill)}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
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

interface SkillDropdownProps {
  state: "none" | "prof" | "expertise";
  isBard: boolean;
  isSkill: boolean;
  onChange: (state: "none" | "prof" | "expertise") => void;
  openUpward?: boolean;
  classColor?: string;
}

function SkillDropdown({ state, isBard, isSkill, onChange, openUpward, classColor }: SkillDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [coords, setCoords] = useState<{ top: number; left: number; width: number; height: number } | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        dropdownRef.current && !dropdownRef.current.contains(target) &&
        !target.closest(".skill-dropdown-portal")
      ) {
        setIsOpen(false);
      }
    };

    const handleScroll = () => {
      setIsOpen(false);
    };

    document.addEventListener("mousedown", handleOutsideClick);
    window.addEventListener("scroll", handleScroll, { capture: true, passive: true });

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      window.removeEventListener("scroll", handleScroll, { capture: true });
    };
  }, [isOpen]);

  const handleToggle = () => {
    if (!isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setCoords({
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
      });
    }
    setIsOpen(!isOpen);
  };

  const renderIcon = (s: "none" | "prof" | "expertise", interactive = true) => {
    const baseClass = `size-4 cursor-pointer shrink-0 transition-transform ${interactive ? "hover:scale-110 active:scale-95" : ""}`;
    if (s === "expertise") {
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className={`${baseClass} text-amber-500 fill-amber-500 drop-shadow-[0_0_2px_rgba(245,158,11,0.3)]`}
        >
          <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.434c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.434 2.082-5.005Z" clipRule="evenodd" />
        </svg>
      );
    }
    if (s === "prof") {
      return (
        <div
          className={`${baseClass} rounded-full bg-white border-2 border-muted-foreground/30 shadow-sm flex items-center justify-center`}
          style={classColor ? { backgroundColor: classColor, borderColor: classColor } : undefined}
        />
      );
    }
    if (isSkill && isBard) {
      return (
        <div className={`${baseClass} rounded-full border-2 border-muted-foreground/50 hover:border-foreground flex items-center justify-center`}>
          <div className="size-1.5 rounded-full bg-muted-foreground/80" />
        </div>
      );
    }
    return (
      <div className={`${baseClass} rounded-full border-2 border-muted-foreground/40 hover:border-foreground`} />
    );
  };

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      <button
        ref={buttonRef}
        type="button"
        onClick={handleToggle}
        className="flex items-center justify-center size-6 rounded hover:bg-muted/80 focus:outline-none transition-colors"
        title={`Change Proficiency (Current: ${state === "none" ? (isSkill && isBard ? "Jack of All Trades" : "None") : state === "prof" ? "Proficient" : "Expertise"})`}
        aria-label={`Change Proficiency (Current: ${state === "none" ? (isSkill && isBard ? "Jack of All Trades" : "None") : state === "prof" ? "Proficient" : "Expertise"})`}
      >
        {renderIcon(state)}
      </button>

      {isOpen && coords && createPortal(
        <div
          className="fixed z-[9999] w-44 rounded-md border border-border bg-popover p-1 shadow-md animate-in fade-in duration-150 skill-dropdown-portal"
          style={{
            left: `${coords.left}px`,
            top: openUpward ? `${coords.top - 4}px` : `${coords.top + coords.height + 4}px`,
            transform: openUpward ? "translateY(-100%)" : "none",
          }}
        >
          <button
            type="button"
            onClick={() => {
              onChange("none");
              setIsOpen(false);
            }}
            className="flex items-center gap-2 w-full px-2 py-1.5 text-xs text-left hover:bg-muted rounded transition-colors text-foreground"
          >
            {renderIcon("none", false)}
            <span>No Proficiency {isSkill && isBard && <span className="text-[10px] text-muted-foreground">(JoAT)</span>}</span>
          </button>
          <button
            type="button"
            onClick={() => {
              onChange("prof");
              setIsOpen(false);
            }}
            className="flex items-center gap-2 w-full px-2 py-1.5 text-xs text-left hover:bg-muted rounded transition-colors text-foreground"
          >
            {renderIcon("prof", false)}
            <span>Proficiency (+PROF)</span>
          </button>
          {isSkill && (
            <button
              type="button"
              onClick={() => {
                onChange("expertise");
                setIsOpen(false);
              }}
              className="flex items-center gap-2 w-full px-2 py-1.5 text-xs text-left hover:bg-muted rounded transition-colors text-foreground"
            >
              {renderIcon("expertise", false)}
              <span>Expertise (+ 2x PROF)</span>
            </button>
          )}
        </div>,
        document.body
      )}
    </div>
  );
}
