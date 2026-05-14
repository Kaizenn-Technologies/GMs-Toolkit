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
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { clsx } from "clsx";
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
}) => {
  const [isEditing, setIsEditing] = useState(group.isEditing || false);
  const [name, setName] = useState(group.name);

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
    setIsEditing(false);
    onUpdateGroup(group.id, { name, isEditing: false });
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
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
          "flex items-center justify-between p-0 rounded border transition-all cursor-pointer overflow-hidden",
          group.collapsed ? "bg-muted/30 border-border/50" : "bg-muted/50 border-primary/20 shadow-sm",
          isOverlay && "bg-muted/80 border-primary/50"
        )}
        onClick={isOverlay ? undefined : onToggleCollapse}
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

          <div className="flex items-center gap-2 px-2 min-w-0 flex-1">
            {group.collapsed ? (
              <Folder size={16} className="text-muted-foreground/50 shrink-0" />
            ) : (
              <FolderOpen size={16} className="text-primary shrink-0" />
            )}
            
            {isEditing ? (
              <div className="flex items-center gap-1 flex-1">
                <Input
                  className="h-7 text-xs py-0 px-2"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoFocus
                  onClick={(e) => e.stopPropagation()}
                />
                <Button size="icon" variant="ghost" className="h-7 w-7 shrink-0" onClick={handleSave}>
                  <Save size={14} className="text-primary" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <span className="text-xs font-bold truncate">
                  {group.name}
                </span>
                <span className="text-[11px] text-muted-foreground/60 font-semibold shrink-0 uppercase tracking-tight">
                  {group.diceIds.length} rolls
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-0.5 pr-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
          <Tooltip>
            <TooltipTrigger
              render={
                <Button 
                  variant="primary" 
                  size="sm" 
                  className="h-7 gap-1.5 px-2 text-[11px] font-bold"
                  onClick={handleRollAll}
                >
                  <Dice6 size={14} />
                  Roll All
                </Button>
              }
            />
            <TooltipContent className="text-[10px]">
              <p>CTRL + Click = Advantage</p>
              <p>SHIFT + Click = Disadvantage</p>
            </TooltipContent>
          </Tooltip>

          <Button 
            variant="ghost" 
            size="icon" 
            className="h-7 w-7 text-muted-foreground/40 hover:text-primary hover:bg-primary/10 transition-colors"
            onClick={handleEdit}
          >
            <SquarePen size={14} />
          </Button>

          <Button 
            variant="ghost" 
            size="icon" 
            className="h-7 w-7 text-muted-foreground/40 hover:text-destructive hover:bg-destructive/10 transition-colors"
            onClick={onDelete}
          >
            <Trash2 size={14} />
          </Button>
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
              />
            ))}
          </SortableContext>
        </div>
      )}
    </div>
  );
};
