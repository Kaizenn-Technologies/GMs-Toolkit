/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { ABILITIES, getModifierClass } from "@/lib/stat-generator";
import { SkillDropdown } from "./ProficiencyDropdown";
import type { Ability, Skills } from "@/types";

const SKILL_MAPPING: Record<Ability, string[]> = {
  Strength: ["Athletics"],
  Dexterity: ["Acrobatics", "Sleight of Hand", "Stealth"],
  Constitution: [],
  Intelligence: ["Arcana", "History", "Investigation", "Nature", "Religion"],
  Wisdom: ["Animal Handling", "Insight", "Medicine", "Perception", "Survival"],
  Charisma: ["Deception", "Intimidation", "Performance", "Persuasion"],
};

export interface SkillsSavingThrowsGridProps {
  activeClass: string;
  activeClassData: any;
  savingThrowsState: Record<Ability, "none" | "prof" | "expertise">;
  skillsState: Record<string, "none" | "prof" | "expertise">;
  bgSkills: string[];
  shouldShowClassPills: boolean;
  handleSavingThrowChange: (ability: Ability, state: "none" | "prof" | "expertise") => void;
  handleSkillChange: (skillName: string, state: "none" | "prof" | "expertise") => void;
  getSavingThrowValue: (ability: Ability) => string;
  getSavingThrowValueRaw: (ability: Ability) => number | null;
  getSkillValue: (ability: Ability, skillName: string) => string;
  getSkillValueRaw: (ability: Ability, skillName: string) => number | null;
}

export const SkillsSavingThrowsGrid: React.FC<SkillsSavingThrowsGridProps> = ({
  activeClass,
  activeClassData,
  savingThrowsState,
  skillsState,
  bgSkills,
  shouldShowClassPills,
  handleSavingThrowChange,
  handleSkillChange,
  getSavingThrowValue,
  getSavingThrowValueRaw,
  getSkillValue,
  getSkillValueRaw,
}) => {
  return (
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
  );
};
