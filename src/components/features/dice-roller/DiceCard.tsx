import React, { useState } from "react";
import type { DiceConfig } from "./types";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { StepperInput } from "@/components/ui/stepper-input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  DiceFive, 
  Trash, 
  PencilSimple, 
  Check, 
  Info 
} from "@phosphor-icons/react";
import { clsx } from "clsx";

interface DiceCardProps {
  config: DiceConfig;
  onUpdate: (updates: Partial<DiceConfig>) => void;
  onDelete: () => void;
  onRoll: (mode: "normal" | "advantage" | "disadvantage") => void;
}

export const DiceCard: React.FC<DiceCardProps> = ({ config, onUpdate, onDelete, onRoll }) => {
  const [isEditing, setIsEditing] = useState(false);

  const handleRoll = (e: React.MouseEvent) => {
    if (isEditing) return;
    let mode: "normal" | "advantage" | "disadvantage" = "normal";
    if (e.ctrlKey) mode = "advantage";
    if (e.shiftKey) mode = "disadvantage";
    onRoll(mode);
  };

  if (isEditing) {
    return (
      <Card className="border-primary/50 shadow-md">
        <CardContent className="p-4 space-y-4">
          <div className="flex items-center justify-between gap-2">
            <Input
              placeholder="Roll Name (e.g. Fireball)"
              value={config.name || ""}
              onChange={(e) => onUpdate({ name: e.target.value })}
              className="h-8 text-sm"
            />
            <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setIsEditing(false)}>
              <Check size={18} className="text-primary" />
            </Button>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-muted-foreground">Count</label>
              <StepperInput
                value={config.count}
                onChange={(val) => onUpdate({ count: val })}
                min={1}
                max={99}
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-muted-foreground">Sides</label>
              <Select
                value={config.sides.toString()}
                onValueChange={(val) => onUpdate({ sides: parseInt(val) })}
              >
                <SelectTrigger className="h-9">
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
              <label className="text-[10px] uppercase font-bold text-muted-foreground">Modifier</label>
              <StepperInput
                value={config.modifier || 0}
                onChange={(val) => onUpdate({ modifier: val })}
                min={-99}
                max={99}
              />
            </div>
          </div>

          <div className="space-y-3 pt-2 border-t border-border/50">
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
               <label htmlFor={`keep-drop-${config.id}`} className="text-xs font-medium leading-none cursor-pointer">
                 Enable Keep / Drop
               </label>
             </div>

             {config.rule && (
               <div className="grid grid-cols-2 gap-3 pl-6">
                 <Select
                   value={config.rule.type}
                   onValueChange={(val: any) => onUpdate({ rule: { ...config.rule!, type: val } })}
                 >
                   <SelectTrigger className="h-8 text-xs">
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
                   <SelectTrigger className="h-8 text-xs">
                     <SelectValue />
                   </SelectTrigger>
                   <SelectContent>
                     <SelectItem value="highest">Highest</SelectItem>
                     <SelectItem value="lowest">Lowest</SelectItem>
                   </SelectContent>
                 </Select>
                 <div className="col-span-2 flex items-center gap-2">
                   <span className="text-xs text-muted-foreground">Count:</span>
                   <StepperInput
                     value={config.rule.value}
                     onChange={(val) => onUpdate({ rule: { ...config.rule!, value: val } })}
                     min={1}
                     max={config.count - 1}
                     className="h-8"
                   />
                 </div>
               </div>
             )}

             <div className="flex items-center space-x-2 pt-2 border-t border-border/50">
               <Checkbox 
                 id={`explode-${config.id}`} 
                 checked={!!config.explode} 
                 onCheckedChange={(checked) => {
                   onUpdate({ explode: checked ? "single" : undefined });
                 }}
               />
               <label htmlFor={`explode-${config.id}`} className="text-xs font-medium leading-none cursor-pointer">
                 Explode on Max
               </label>
               {config.explode && (
                 <Select
                   value={config.explode}
                   onValueChange={(val: any) => onUpdate({ explode: val })}
                 >
                   <SelectTrigger className="h-7 w-24 text-[10px]">
                     <SelectValue />
                   </SelectTrigger>
                   <SelectContent>
                     <SelectItem value="single">Once</SelectItem>
                     <SelectItem value="compound">Recursive</SelectItem>
                   </SelectContent>
                 </Select>
               )}
             </div>

             <div className="flex items-center space-x-2">
               <Checkbox 
                 id={`reroll-${config.id}`} 
                 checked={!!config.reroll} 
                 onCheckedChange={(checked) => {
                   onUpdate({ reroll: checked ? { type: "once", threshold: 1 } : undefined });
                 }}
               />
               <label htmlFor={`reroll-${config.id}`} className="text-xs font-medium leading-none cursor-pointer">
                 Reroll Threshold
               </label>
               {config.reroll && (
                 <div className="flex items-center gap-2">
                   <span className="text-[10px] text-muted-foreground">≤</span>
                   <StepperInput
                     value={config.reroll.threshold}
                     onChange={(val) => onUpdate({ reroll: { ...config.reroll!, threshold: val } })}
                     min={1}
                     max={config.sides - 1}
                     className="h-7 w-20"
                   />
                   <Select
                     value={config.reroll.type}
                     onValueChange={(val: any) => onUpdate({ reroll: { ...config.reroll!, type: val } })}
                   >
                     <SelectTrigger className="h-7 w-20 text-[10px]">
                       <SelectValue />
                     </SelectTrigger>
                     <SelectContent>
                       <SelectItem value="once">Once</SelectItem>
                       <SelectItem value="until">Until</SelectItem>
                     </SelectContent>
                   </Select>
                 </div>
               )}
             </div>
          </div>

          <div className="flex justify-between items-center pt-2">
            <Button variant="ghost" size="sm" onClick={onDelete} className="text-destructive hover:bg-destructive/10 h-8">
              <Trash size={16} className="mr-2" />
              Delete
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card 
      className="group relative hover:border-primary/50 transition-all cursor-pointer overflow-hidden"
      onClick={handleRoll}
    >
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-muted group-hover:bg-primary transition-colors" />
      <CardContent className="p-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded bg-muted text-muted-foreground group-hover:text-primary transition-colors">
            <DiceFive size={20} />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold truncate max-w-[150px]">
              {config.name || `${config.count}d${config.sides}`}
            </span>
            <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
              {config.count}d{config.sides}
              {config.modifier ? (config.modifier > 0 ? ` + ${config.modifier}` : ` - ${Math.abs(config.modifier)}`) : ""}
              {config.rule && ` • ${config.rule.type === 'keep' ? 'k' : 'd'}${config.rule.value}`}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsEditing(true);
                  }}
                >
                  <PencilSimple size={16} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Edit</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="h-8 w-8 flex items-center justify-center text-muted-foreground/30">
                  <Info size={16} />
                </div>
              </TooltipTrigger>
              <TooltipContent className="text-[10px]">
                <p>CTRL + Click = Advantage</p>
                <p>SHIFT + Click = Disadvantage</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardContent>
    </Card>
  );
};
