import React, { useState } from "react";
import type { DiceConfig, DiceGroup as IDiceGroup } from "./types";
import { DiceCard } from "./DiceCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Folder,
  FolderOpen,
  Trash2,
  Dice6,
  GripVertical,
  Save,
  SquarePen
} from "lucide-react";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { clsx } from "clsx";
import { Checkbox } from "@/components/ui/checkbox";
import { useSortable, SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface DiceGroupProps {
  group: IDiceGroup;
  diceConfigs: DiceConfig[];
  onToggleCollapse: () => void;
  onDelete: () => void;
  onUpdateGroup: (id: string, updates: Partial<IDiceGroup>) => void;
  onRollGroup: (mode: "normal" | "advantage" | "disadvantage") => void;
  onUpdateDice: (id: string, updates: Partial<DiceConfig>) => void;
  onDeleteDice: (id: string) => void;
  onRollDice: (id: string, mode: "normal" | "advantage" | "disadvantage") => void;
  isOverlay?: boolean;
  isSelectionMode?: boolean;
  isSelected?: boolean;
  selectedDiceIds?: Set<string>;
  onSelectGroup?: (groupId: string, selected: boolean) => void;
  onSelectDice?: (diceId: string, selected: boolean) => void;
}

export const DiceGroup: React.FC<DiceGroupProps> = ({
  group,
  diceConfigs,
  onToggleCollapse,
  onDelete,
  onUpdateGroup,
  onRollGroup,
  onUpdateDice,
  onDeleteDice,
  onRollDice,
  isOverlay,
  isSelectionMode = false,
  isSelected = false,
  selectedDiceIds = new Set(),
  onSelectGroup,
  onSelectDice,
}) => {
  const [isEditingLocal, setIsEditingLocal] = useState(false);
  const [localName, setLocalName] = useState<string | null>(null);

  const isEditing = isEditingLocal || group.isEditing;
  const currentName = localName !== null ? localName : group.name;

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isOver,
    isDragging,
  } = useSortable({ id: group.id });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    zIndex: isDragging ? 0 : isOverlay ? 100 : 1,
    opacity: isDragging ? 0.2 : 1,
  };

  const isDropTarget = isOver && !isDragging;

  const groupDice = group.diceIds
    .map((id) => diceConfigs.find((c) => c.id === id))
    .filter((c): c is DiceConfig => !!c);

  const handleRollAll = (e: React.MouseEvent) => {
    e.stopPropagation();
    const mode = e.ctrlKey || e.metaKey ? "advantage" : e.shiftKey ? "disadvantage" : "normal";
    onRollGroup(mode);
  };

  const handleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditingLocal(false);
    onUpdateGroup(group.id, { name: currentName, isEditing: false });
    setLocalName(null);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditingLocal(true);
    setLocalName(group.name);
  };

  return (
    <div
      className={clsx(
        "space-y-1.5 relative transition-all",
        isOverlay ? "cursor-grabbing shadow-2xl ring-2 ring-primary/50" : "",
        isDragging && !isOverlay ? "opacity-30 grayscale-[0.5]" : ""
      )}
      ref={setNodeRef}
      style={style}
    >
      {isDropTarget && !isOverlay && (
        <div className="absolute inset-0 pointer-events-none z-[100]">
          <div
            className="absolute left-0 right-0 h-[3px] bg-[#3b82f6] shadow-[0_0_15px_#3b82f6]"
            style={{
              top: transform && transform.y > 0 ? 0 : 'auto',
              bottom: transform && transform.y <= 0 ? 0 : 'auto'
            }}
          />
        </div>
      )}

      <div
        className={clsx(
          "flex items-center justify-between p-0 border transition-all overflow-hidden",
          group.collapsed ? "bg-muted/30 border-border/50" : "bg-muted/50 border-primary/20 shadow-sm",
          isOverlay && "bg-muted/80 border-primary/50"
        )}
      >
        <div className="flex items-center h-9 w-full min-w-0">
          {/* Drag Handle Container */}
          <div
            className="w-7 h-full flex items-center justify-center bg-muted/20 border-r border-border/30 text-muted-foreground/30 hover:text-primary transition-colors cursor-grab active:cursor-grabbing shrink-0"
            {...attributes}
            {...listeners}
          >
            <GripVertical size={16} />
          </div>

          {isSelectionMode && onSelectGroup && (
            <div className="flex items-center pl-2 shrink-0 animate-in fade-in zoom-in-95 duration-150" onClick={(e) => e.stopPropagation()}>
              <Checkbox
                checked={isSelected}
                onCheckedChange={(checked) => onSelectGroup(group.id, !!checked)}
                className="size-4 rounded-sm border-border/70 text-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground focus-visible:ring-primary/45"
              />
            </div>
          )}

          {isEditing ? (
            <div className="flex items-center gap-1 flex-1 min-w-0 pl-2 pr-2" onClick={(e) => e.stopPropagation()}>
              <Input
                className="h-7 text-xs py-0 px-2"
                value={currentName}
                onChange={(e) => setLocalName(e.target.value)}
                aria-label="Group Name"
                autoFocus
              />
              <Button size="icon" variant="ghost" className="size-7 shrink-0" onClick={handleSave} aria-label="Save group name">
                <Save size={14} className="text-primary" />
              </Button>
            </div>
          ) : (
            <button
              type="button"
              className="flex-1 flex items-center gap-2 px-2 min-w-0 h-full text-left bg-transparent border-none p-0 text-foreground cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
              onClick={isOverlay ? undefined : (isSelectionMode && onSelectGroup ? () => onSelectGroup(group.id, !isSelected) : onToggleCollapse)}
              aria-label={`${group.collapsed ? "Expand" : "Collapse"} group ${group.name}`}
            >
              {group.collapsed ? (
                <Folder size={16} className="text-muted-foreground/50 shrink-0" />
              ) : (
                <FolderOpen size={16} className="text-primary shrink-0" />
              )}
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <span className="text-xs font-bold truncate">
                  {group.name}
                </span>
                <span className="text-[11px] text-muted-foreground/60 font-semibold shrink-0 uppercase tracking-tight">
                  {group.diceIds.length} rolls
                </span>
              </div>
            </button>
          )}
        </div>

        <div className="flex items-center gap-1 pr-1 shrink-0" onClick={(e) => e.stopPropagation()}>
          <Button
            variant="ghost"
            size="icon"
            className="size-7 text-muted-foreground/40 hover:text-primary hover:bg-primary/10 transition-colors"
            onClick={handleEdit}
            aria-label="Edit group name"
          >
            <SquarePen size={14} />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="size-7 text-muted-foreground/40 hover:text-red-500 hover:bg-red-500/10 transition-colors"
            onClick={onDelete}
            aria-label="Delete group"
          >
            <Trash2 size={14} />
          </Button>
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  variant="default"
                  size="sm"
                  className="h-7 bg-blue-500/10 border border-blue-500/20 text-blue-500 hover:bg-blue-500/20 hover:border-blue-500/30 transition-all shadow-sm"
                  onClick={handleRollAll}
                >
                  <Dice6 size={14} />
                  Roll All
                </Button>
              }
            />
            <TooltipContent>
              <div className="text-[12px] space-y-0.5 p-1">
                {/* <p className="font-bold text-blue-500">Roll Dice</p> */}
                <p className="font-bold text-green-700 shadow-sm">CTRL + Click = Advantage</p>
                <p className="font-bold text-red-600">SHIFT + Click = Disadvantage</p>
              </div>
            </TooltipContent>
          </Tooltip>


        </div>
      </div>

      {!group.collapsed && (
        <div className="pl-4 space-y-1 border-l border-border/30 ml-3">
          <SortableContext items={group.diceIds} strategy={verticalListSortingStrategy}>
            {groupDice.map((config) => (
              <DiceCard
                key={config.id}
                config={config}
                onUpdate={(updates) => onUpdateDice(config.id, updates)}
                onDelete={() => onDeleteDice(config.id)}
                onRoll={(mode) => onRollDice(config.id, mode)}
                isSelectionMode={isSelectionMode}
                isSelected={selectedDiceIds.has(config.id)}
                onSelect={onSelectDice ? (checked) => onSelectDice(config.id, checked) : undefined}
              />
            ))}
          </SortableContext>
        </div>
      )}
    </div>
  );
};
