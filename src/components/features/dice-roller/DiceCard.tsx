import React, { useState, useEffect } from "react";
import type { DiceConfig } from "./types";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { StepperInput } from "@/components/ui/stepper-input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
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
  isOverlay?: boolean;
  isSelectionMode?: boolean;
  isSelected?: boolean;
  onSelect?: (selected: boolean) => void;
}

export const DiceCard: React.FC<DiceCardProps> = ({
  config,
  onUpdate,
  onDelete,
  onRoll,
  isOverlay,
  isSelectionMode = false,
  isSelected = false,
  onSelect,
}) => {
  const [isEditing, setIsEditing] = useState(config.isEditing || false);
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isOver,
    isDragging,
  } = useSortable({ id: config.id });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    zIndex: isDragging ? 0 : isOverlay ? 100 : 1,
    opacity: isDragging ? 0.2 : 1,
    visibility: (isDragging && !isOverlay ? "visible" : "visible") as "visible" | "hidden" | "collapse",
  };

  // The "hint line" effect
  // Show a blue line when another item is being dragged over this one.
  const isDropTarget = isOver && !isDragging;

  // Sync internal editing state with prop if it changes (e.g. from hook)
  useEffect(() => {
    if (config.isEditing !== undefined) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsEditing(config.isEditing);
    }
  }, [config.isEditing]);

  const handleRoll = (e: React.MouseEvent | React.KeyboardEvent) => {
    if (isEditing) return;
    let mode: "normal" | "advantage" | "disadvantage" = "normal";
    if (e.ctrlKey) mode = "advantage";
    if (e.shiftKey) mode = "disadvantage";
    onRoll(mode);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (isOverlay) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (isSelectionMode && onSelect) {
        onSelect(!isSelected);
      } else {
        handleRoll(e);
      }
    }
  };

  const handleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(false);
    onUpdate({ isEditing: false });
  };

  if (isEditing) {
    return (
      <DiceCardEditMode
        config={config}
        onUpdate={onUpdate}
        onDelete={onDelete}
        handleSave={handleSave}
        setNodeRef={setNodeRef}
        style={style}
      />
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={clsx(
        "group relative transition-all overflow-hidden rounded-md border border-border/50 shadow-sm",
        isOverlay ? "cursor-grabbing shadow-2xl ring-2 ring-primary/50" : "",
        isDragging && !isOverlay ? "opacity-30 grayscale-[0.5] border-dashed border-primary/30" : "bg-card/50",
        !isOverlay && "hover:border-primary/50"
      )}
    >
      {isDropTarget && !isOverlay && (
        <div className="absolute inset-0 pointer-events-none z-[100]">
          <div
            className="absolute left-0 right-0 h-[3px] bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]"
            style={{
              top: transform && transform.y > 0 ? 0 : 'auto',
              bottom: transform && transform.y <= 0 ? 0 : 'auto'
            }}
          />
        </div>
      )}

      <CardContent className={clsx("p-0 flex", isOverlay ? "h-11" : "h-10")}>
        {/* Drag Handle Container */}
        <div
          className="w-8 flex items-center justify-center bg-muted/30 border-r border-border/30 text-muted-foreground/40 group-hover:text-primary transition-colors cursor-grab active:cursor-grabbing"
          {...attributes}
          {...listeners}
        >
          <GripVertical size={18} />
        </div>

        {isSelectionMode && onSelect && (
          <div className="flex items-center pl-2 shrink-0 animate-in fade-in zoom-in-95 duration-150" onClick={(e) => e.stopPropagation()}>
            <Checkbox
              checked={isSelected}
              onCheckedChange={(checked) => onSelect(!!checked)}
              className="h-4 w-4 rounded-sm border-border/70 text-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground focus-visible:ring-primary/45"
            />
          </div>
        )}

        {/* Content Area */}
        <div className="flex-1 flex items-center pl-3 pr-1 min-w-0 gap-3">
          <button
            type="button"
            onClick={isOverlay ? undefined : (isSelectionMode && onSelect ? () => onSelect(!isSelected) : handleRoll)}
            onKeyDown={handleKeyDown}
            tabIndex={isOverlay ? -1 : 0}
            className="flex-1 flex items-baseline gap-2.5 min-w-0 text-left bg-transparent border-none p-0 cursor-pointer focus:outline-none focus-visible:ring-1 focus-visible:ring-primary/50 text-foreground"
            aria-label={`Roll ${config.name || `${config.count}d${config.sides}`}`}
          >
            <span className="text-sm font-bold truncate text-foreground/90">
              {config.name || `${config.count}d${config.sides}`}
            </span>
            <span className="text-xs text-muted-foreground/60 uppercase font-semibold tracking-widest shrink-0">
              {config.count}d{config.sides}{config.modifier ? (config.modifier > 0 ? `+${config.modifier}` : `-${Math.abs(config.modifier)}`) : ""}
            </span>
          </button>

          {/* Quick Actions */}
          <div className="flex items-center gap-1">
            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground/40 hover:text-primary hover:bg-primary/10 transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsEditing(true);
                    }}
                    aria-label="Edit roll preset"
                  >
                    <SquarePen size={16} />
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
                    className="h-8 w-8 text-muted-foreground/40 hover:text-red-500 hover:bg-red-500/10 transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete();
                    }}
                    aria-label="Delete roll preset"
                  >
                    <Trash2 size={16} />
                  </Button>
                }
              />
              <TooltipContent>Delete</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    variant="secondary"
                    size="icon"
                    className="h-8 w-8 bg-blue-500/10 border border-blue-500/20 text-blue-500 hover:bg-blue-500/20 hover:border-blue-500/30 transition-all shadow-sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      const mode = e.ctrlKey || e.metaKey ? "advantage" : e.shiftKey ? "disadvantage" : "normal";
                      onRoll(mode);
                    }}
                    aria-label="Roll dice"
                  >
                    <Dice6 size={16} />
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
      </CardContent>
    </div>
  );
};

interface DiceCardEditModeProps {
  config: DiceConfig;
  onUpdate: (updates: Partial<DiceConfig>) => void;
  onDelete: () => void;
  handleSave: (e: React.MouseEvent) => void;
  setNodeRef: (node: HTMLElement | null) => void;
  style: React.CSSProperties;
}

const DiceCardEditMode: React.FC<DiceCardEditModeProps> = ({
  config,
  onUpdate,
  onDelete,
  handleSave,
  setNodeRef,
  style,
}) => {
  return (
    <Card className="border-primary/40 shadow-lg bg-card/80" ref={setNodeRef} style={style}>
      <CardContent className="">
        {/* Row 1: Name & Save */}
        <div className="flex items-center gap-2">
          <Input
            placeholder="Roll Name (e.g. Fireball)"
            value={config.name || ""}
            onChange={(e) => onUpdate({ name: e.target.value })}
            className="h-8 text-sm flex-1 bg-background/50"
            aria-label="Roll Name"
            autoFocus
          />
          <Button size="sm" variant="default" className="h-8 px-3 gap-1.5" onClick={handleSave}>
            <Save size={14} />
            Save
          </Button>
        </div>

        {/* Row 2: Stats & Toggles */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 py-1">
          <div className="flex items-center gap-3">
            <div className="flex flex-col gap-1">
              <label htmlFor={`dice-count-${config.id}`} className="text-[10px] uppercase font-semibold text-muted-foreground/70 leading-none">Count</label>
              <StepperInput
                id={`dice-count-${config.id}`}
                value={config.count}
                onChange={(val) => onUpdate({ count: val })}
                min={1}
                max={99}
                className="h-8 w-24"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor={`dice-sides-${config.id}`} className="text-[10px] uppercase font-semibold text-muted-foreground/70 leading-none">Sides</label>
              <Select
                value={config.sides.toString()}
                onValueChange={(val) => onUpdate({ sides: parseInt(val as string) })}
              >
                <SelectTrigger id={`dice-sides-${config.id}`} className="h-8 w-20 text-xs font-semibold">
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
            <div className="flex flex-col gap-1">
              <label htmlFor={`dice-mod-${config.id}`} className="text-[10px] uppercase font-semibold text-muted-foreground/70 leading-none">Mod</label>
              <StepperInput
                id={`dice-mod-${config.id}`}
                value={config.modifier || 0}
                onChange={(val) => onUpdate({ modifier: val })}
                min={-99}
                max={99}
                className="h-8 w-24"
              />
            </div>
          </div>

          <div className="h-8 w-px bg-border/30 mx-1" />

          <div className="flex items-center gap-4">
            <Tooltip>
              <TooltipTrigger render={
                <div className="flex items-center gap-2 cursor-help">
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
                  <label htmlFor={`keep-drop-${config.id}`} className="text-[11px] font-semibold uppercase tracking-tight cursor-pointer text-muted-foreground/80">
                    Keep/Drop
                  </label>
                  <Info size={12} className="text-muted-foreground/40" />
                </div>
              } />
              <TooltipContent side="bottom" className="max-w-[200px] text-[11px] leading-relaxed">
                Keep or drop a specific number of highest or lowest dice results.
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger render={
                <div className="flex items-center gap-2 cursor-help">
                  <Checkbox
                    id={`explode-${config.id}`}
                    checked={!!config.explode}
                    onCheckedChange={(checked) => {
                      onUpdate({ explode: checked ? "single" : undefined });
                    }}
                  />
                  <label htmlFor={`explode-${config.id}`} className="text-[11px] font-semibold uppercase tracking-tight cursor-pointer text-muted-foreground/80">
                    Explode
                  </label>
                  <Info size={12} className="text-muted-foreground/40" />
                </div>
              } />
              <TooltipContent side="bottom" className="max-w-[200px] text-[11px] leading-relaxed">
                If you roll the maximum value on a die, you roll an additional die and add it to the total.
              </TooltipContent>
            </Tooltip>
          </div>
        </div>

        {/* Row 3: Rule details & Delete */}
        <div className="flex items-center justify-between pt-1 border-t border-border/20">
          <div className="flex items-center gap-2">
            {config.rule && (
              <div className="flex items-center gap-2 animate-in fade-in slide-in-from-left-1 duration-200">
                <Select
                  value={config.rule.type}
                  onValueChange={(val) => {
                    if (val === "keep" || val === "drop") {
                      onUpdate({ rule: { ...config.rule!, type: val } });
                    }
                  }}
                >
                  <SelectTrigger aria-label="Keep or drop rule type" className="h-7 w-20 text-[10px] font-semibold uppercase">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="keep">Keep</SelectItem>
                    <SelectItem value="drop">Drop</SelectItem>
                  </SelectContent>
                </Select>
                <Select
                  value={config.rule.target}
                  onValueChange={(val) => {
                    if (val === "highest" || val === "lowest") {
                      onUpdate({ rule: { ...config.rule!, target: val } });
                    }
                  }}
                >
                  <SelectTrigger aria-label="Keep or drop rule target" className="h-8 w-24 text-[10px] font-semibold uppercase">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="highest">Highest</SelectItem>
                    <SelectItem value="lowest">Lowest</SelectItem>
                  </SelectContent>
                </Select>
                <StepperInput
                  value={config.rule.value}
                  onChange={(val) => onUpdate({ rule: { ...config.rule!, value: val } })}
                  min={1}
                  max={config.count - 1 || 1}
                  className="h-8 w-24"
                  aria-label="Rule value"
                />
              </div>
            )}
          </div>

          <Button variant="outline" size="sm" onClick={onDelete} className="text-red-500 hover:bg-red-500/10 h-7 text-[11px] font-semibold uppercase" aria-label="Delete roll">
            <Trash2 size={14} className="mr-1.5" />
            Delete
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
