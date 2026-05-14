import React, { useState, useEffect } from "react";
import type { DiceConfig } from "./types";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { StepperInput } from "@/components/ui/stepper-input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { 
  Trash2, 
  SquarePen, 
  Save, 
  Info,
  GripVertical,
  Dice6
} from "lucide-react";
import { clsx } from "clsx";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface DiceCardProps {
  config: DiceConfig;
  onUpdate: (updates: Partial<DiceConfig>) => void;
  onDelete: () => void;
  onRoll: (mode: "normal" | "advantage" | "disadvantage") => void;
}

export const DiceCard: React.FC<DiceCardProps> = ({ config, onUpdate, onDelete, onRoll }) => {
  const [isEditing, setIsEditing] = useState(config.isEditing || false);
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: config.id });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
    opacity: isDragging ? 0.5 : 1,
  };

  // Sync internal editing state with prop if it changes (e.g. from hook)
  useEffect(() => {
    if (config.isEditing !== undefined) {
      setIsEditing(config.isEditing);
    }
  }, [config.isEditing]);

  const handleRoll = (e: React.MouseEvent) => {
    if (isEditing) return;
    let mode: "normal" | "advantage" | "disadvantage" = "normal";
    if (e.ctrlKey) mode = "advantage";
    if (e.shiftKey) mode = "disadvantage";
    onRoll(mode);
  };

  const handleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(false);
    onUpdate({ isEditing: false });
  };

  if (isEditing) {
    return (
      <Card className="border-primary/50 shadow-md" ref={setNodeRef} style={style}>
        <CardContent className="p-3 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <Input
              placeholder="Roll Name (e.g. Fireball)"
              value={config.name || ""}
              onChange={(e) => onUpdate({ name: e.target.value })}
              className="h-7 text-xs"
              autoFocus
            />
            <Button size="icon" variant="ghost" className="h-7 w-7" onClick={handleSave}>
              <Save size={14} className="text-primary" />
            </Button>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-muted-foreground">Count</label>
              <StepperInput
                value={config.count}
                onChange={(val) => onUpdate({ count: val })}
                min={1}
                max={99}
                className="h-7"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-muted-foreground">Sides</label>
              <Select
                value={config.sides.toString()}
                onValueChange={(val) => onUpdate({ sides: parseInt(val) })}
              >
                <SelectTrigger className="h-7 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[4, 6, 8, 10, 12, 20, 100].map((s) => (
                    <SelectItem key={s} value={s.toString()}>
                      d{s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-muted-foreground">Mod</label>
              <StepperInput
                value={config.modifier || 0}
                onChange={(val) => onUpdate({ modifier: val })}
                min={-99}
                max={99}
                className="h-7"
              />
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-border/50">
             <div className="flex items-center space-x-2">
               <Checkbox 
                 id={`keep-drop-${config.id}`} 
                 checked={!!config.rule} 
                 onCheckedChange={(checked) => {
                   if (checked) {
                     onUpdate({ rule: { type: "keep", target: "highest", value: 1 } });
                   } else {
                     onUpdate({ rule: undefined });
                   }
                 }}
               />
               <label htmlFor={`keep-drop-${config.id}`} className="text-[10px] font-medium leading-none cursor-pointer">
                 Keep/Drop
               </label>
             </div>

             {config.rule && (
               <div className="grid grid-cols-2 gap-2 pl-5">
                 <Select
                   value={config.rule.type}
                   onValueChange={(val: any) => onUpdate({ rule: { ...config.rule!, type: val } })}
                 >
                   <SelectTrigger className="h-6 text-[10px]">
                     <SelectValue />
                   </SelectTrigger>
                   <SelectContent>
                     <SelectItem value="keep">Keep</SelectItem>
                     <SelectItem value="drop">Drop</SelectItem>
                   </SelectContent>
                 </Select>
                 <Select
                   value={config.rule.target}
                   onValueChange={(val: any) => onUpdate({ rule: { ...config.rule!, target: val } })}
                 >
                   <SelectTrigger className="h-6 text-[10px]">
                     <SelectValue />
                   </SelectTrigger>
                   <SelectContent>
                     <SelectItem value="highest">High</SelectItem>
                     <SelectItem value="lowest">Low</SelectItem>
                   </SelectContent>
                 </Select>
               </div>
             )}

             <div className="flex items-center space-x-2">
               <Checkbox 
                 id={`explode-${config.id}`} 
                 checked={!!config.explode} 
                 onCheckedChange={(checked) => {
                   onUpdate({ explode: checked ? "single" : undefined });
                 }}
               />
               <label htmlFor={`explode-${config.id}`} className="text-[10px] font-medium leading-none cursor-pointer">
                 Explode
               </label>
             </div>
          </div>

          <div className="flex justify-end pt-1">
            <Button variant="ghost" size="sm" onClick={onDelete} className="text-destructive hover:bg-destructive/10 h-6 text-[10px]">
              <Trash2 size={12} className="mr-1" />
              Delete
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card 
      ref={setNodeRef}
      style={style}
      className="group relative hover:border-primary/50 transition-all cursor-pointer overflow-hidden bg-card/50"
      onClick={handleRoll}
    >
      <CardContent className="p-0 flex h-9">
        {/* Drag Handle Container */}
        <div 
          className="w-7 flex items-center justify-center bg-muted/30 border-r border-border/30 text-muted-foreground/40 group-hover:text-primary transition-colors cursor-grab active:cursor-grabbing"
          {...attributes}
          {...listeners}
        >
          <GripVertical size={16} />
        </div>

        {/* Content Area */}
        <div className="flex-1 flex items-center px-2 min-w-0 gap-2">
          <div className="flex-1 flex items-baseline gap-2 min-w-0">
            <span className="text-[11px] font-bold truncate">
              {config.name || `${config.count}d${config.sides}`}
            </span>
            <span className="text-[9px] text-muted-foreground uppercase font-semibold tracking-tight shrink-0 opacity-70">
              {config.count}d{config.sides}{config.modifier ? (config.modifier > 0 ? `+${config.modifier}` : `-${Math.abs(config.modifier)}`) : ""}
            </span>
          </div>
          
          {/* Quick Actions */}
          <div className="flex items-center gap-0.5 transition-opacity">
            <Tooltip>
              <TooltipTrigger
                render={
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-7 w-7 text-muted-foreground/40 hover:text-primary hover:bg-primary/10 transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsEditing(true);
                    }}
                  >
                    <SquarePen size={14} />
                  </Button>
                }
              />
              <TooltipContent>Edit</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger
                render={
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-7 w-7 text-muted-foreground/40 hover:text-destructive hover:bg-destructive/10 transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete();
                    }}
                  >
                    <Trash2 size={14} />
                  </Button>
                }
              />
              <TooltipContent>Delete</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger
                render={
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-7 w-7 text-primary/60 hover:text-primary hover:bg-primary/20 transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      const mode = e.ctrlKey || e.metaKey ? "advantage" : e.shiftKey ? "disadvantage" : "normal";
                      onRoll(mode);
                    }}
                  >
                    <Dice6 size={14} />
                  </Button>
                }
              />
              <TooltipContent>
                <div className="text-[10px] space-y-0.5">
                  <p className="font-bold">Roll Dice</p>
                  <p className="text-muted-foreground">CTRL + Click = Advantage</p>
                  <p className="text-muted-foreground">SHIFT + Click = Disadvantage</p>
                </div>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
