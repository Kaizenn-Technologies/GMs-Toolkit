import React from "react";
import type { DiceConfig, DiceGroup as IDiceGroup } from "./types";
import { DiceCard } from "./DiceCard";
import { Button } from "@/components/ui/button";
import { CaretDown, CaretRight, Trash, Play, FolderSimple } from "@phosphor-icons/react";
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { clsx } from "clsx";

interface DiceGroupProps {
  group: IDiceGroup;
  diceConfigs: DiceConfig[];
  onToggleCollapse: () => void;
  onDelete: () => void;
  onRollGroup: (mode: "normal" | "advantage" | "disadvantage") => void;
  onUpdateDice: (id: string, updates: Partial<DiceConfig>) => void;
  onDeleteDice: (id: string) => void;
  onRollDice: (id: string, mode: "normal" | "advantage" | "disadvantage") => void;
}

export const DiceGroup: React.FC<DiceGroupProps> = ({
  group,
  diceConfigs,
  onToggleCollapse,
  onDelete,
  onRollGroup,
  onUpdateDice,
  onDeleteDice,
  onRollDice,
}) => {
  const groupDice = group.diceIds
    .map((id) => diceConfigs.find((c) => c.id === id))
    .filter((c): c is DiceConfig => !!c);

  const handleRollAll = (e: React.MouseEvent) => {
    e.stopPropagation();
    let mode: "normal" | "advantage" | "disadvantage" = "normal";
    if (e.ctrlKey) mode = "advantage";
    if (e.shiftKey) mode = "disadvantage";
    onRollGroup(mode);
  };

  return (
    <div className="space-y-2">
      <div 
        className={clsx(
          "flex items-center justify-between p-2 rounded-lg border transition-all cursor-pointer",
          group.collapsed ? "bg-muted/30 border-border/50" : "bg-muted/50 border-primary/20 shadow-sm"
        )}
        onClick={onToggleCollapse}
      >
        <div className="flex items-center gap-2">
          {group.collapsed ? <CaretRight size={16} /> : <CaretDown size={16} />}
          <FolderSimple size={20} className="text-primary" weight={group.collapsed ? "regular" : "fill"} />
          <span className="font-bold text-sm">{group.name}</span>
          <span className="text-[10px] text-muted-foreground bg-background px-1.5 py-0.5 rounded border border-border/50">
            {groupDice.length} Dice
          </span>
        </div>

        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="primary" 
                  size="sm" 
                  className="h-8 gap-2 px-3"
                  onClick={handleRollAll}
                >
                  <Play size={14} weight="fill" />
                  Roll All
                </Button>
              </TooltipTrigger>
              <TooltipContent className="text-[10px]">
                <p>CTRL + Click = Advantage</p>
                <p>SHIFT + Click = Disadvantage</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 text-muted-foreground hover:text-destructive"
            onClick={onDelete}
          >
            <Trash size={16} />
          </Button>
        </div>
      </div>

      {!group.collapsed && (
        <div className="pl-6 space-y-2 border-l-2 border-muted ml-3">
          {groupDice.length === 0 ? (
            <div className="text-[10px] text-muted-foreground italic p-2 bg-muted/20 rounded border border-dashed border-border/50">
              Drag dice here to group them
            </div>
          ) : (
            groupDice.map((config) => (
              <DiceCard
                key={config.id}
                config={config}
                onUpdate={(updates) => onUpdateDice(config.id, updates)}
                onDelete={() => onDeleteDice(config.id)}
                onRoll={(mode) => onRollDice(config.id, mode)}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
};
