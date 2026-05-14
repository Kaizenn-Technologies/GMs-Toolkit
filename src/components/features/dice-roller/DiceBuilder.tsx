import React, { useState } from "react";
import type { DiceConfig, DiceGroup as IDiceGroup } from "./types";
import { DiceCard } from "./DiceCard";
import { DiceGroup } from "./DiceGroup";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { 
  Wand2, 
  Terminal, 
  Plus, 
  FolderPlus,
  Keyboard
} from "lucide-react";
import { parseDiceNotation } from "./utils";
import { clsx } from "clsx";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  defaultDropAnimationSideEffects,
  pointerWithin,
  useDroppable,
} from "@dnd-kit/core";
import type { DragStartEvent, DragEndEvent, DragOverEvent, DropAnimation } from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";

interface DiceBuilderProps {
  diceConfigs: DiceConfig[];
  groups: IDiceGroup[];
  onAddDice: (config: DiceConfig) => void;
  onUpdateDice: (id: string, updates: Partial<DiceConfig>) => void;
  onDeleteDice: (id: string) => void;
  onAddGroup: (name: string) => void;
  onUpdateGroup: (id: string, updates: Partial<IDiceGroup>) => void;
  onDeleteGroup: (id: string) => void;
  onToggleGroup: (id: string) => void;
  onMoveDiceToGroup: (diceId: string, groupId: string | null) => void;
  onRollDice: (id: string, mode: "normal" | "advantage" | "disadvantage") => void;
  onRollGroup: (id: string, mode: "normal" | "advantage" | "disadvantage") => void;
  onReorderDice: (dice: DiceConfig[]) => void;
  onReorderGroups: (groups: IDiceGroup[]) => void;
  settings: { manualNotation: boolean };
}

const UngroupedHeader: React.FC = () => {
  const { setNodeRef, isOver } = useDroppable({
    id: "other-rolls-header",
  });

  return (
    <h4 
      ref={setNodeRef}
      className={clsx(
        "text-[10px] uppercase font-bold px-1 transition-colors duration-200",
        isOver ? "text-primary" : "text-muted-foreground"
      )}
    >
      Other Rolls
    </h4>
  );
};

export const DiceBuilder: React.FC<DiceBuilderProps> = ({
  diceConfigs,
  groups,
  onAddDice,
  onUpdateDice,
  onDeleteDice,
  onAddGroup,
  onUpdateGroup,
  onDeleteGroup,
  onToggleGroup,
  onMoveDiceToGroup,
  onRollDice,
  onRollGroup,
  onReorderDice,
  onReorderGroups,
  settings,
}) => {
  const [notation, setNotation] = useState("");
  const [error, setError] = useState(false);
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);

  const activeDice = activeId ? diceConfigs.find(d => d.id === activeId) : null;
  const activeGroup = activeId ? groups.find(g => g.id === activeId) : null;

  const dropAnimation: DropAnimation = {
    sideEffects: defaultDropAnimationSideEffects({
      styles: {
        active: {
          opacity: "0.4",
        },
      },
    }),
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleAddManual = (val?: string) => {
    const textToAdd = val || notation;
    const config = parseDiceNotation(textToAdd);
    if (config.count && config.sides) {
      onAddDice(config as DiceConfig);
      setNotation("");
      setShowQuickAdd(false);
      setError(false);
    } else {
      setError(true);
      setTimeout(() => setError(false), 2000);
    }
  };

  const handleAddNewQuick = () => {
    onAddDice({
      id: crypto.randomUUID(),
      count: 1,
      sides: 20,
      modifier: 0,
    });
  };

  const handleAddGroupQuick = () => {
    onAddGroup("New Group");
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    if (activeId === overId) return;

    // 1. Reordering Groups
    const activeGroupIdx = groups.findIndex((g) => g.id === activeId);
    if (activeGroupIdx !== -1) {
      const overGroupIdx = groups.findIndex((g) => g.id === overId);
      if (overGroupIdx !== -1) {
        onReorderGroups(arrayMove(groups, activeGroupIdx, overGroupIdx));
      }
      return;
    }

    // 2. Handling Dice
    const activeDice = diceConfigs.find((d) => d.id === activeId);
    if (!activeDice) return;

    // Find which group the active dice is currently in
    const activeDiceGroup = groups.find(g => g.diceIds.includes(activeId));
    
    // Find if we are dropping over another dice
    const overDiceIdx = diceConfigs.findIndex(d => d.id === overId);
    if (overDiceIdx !== -1) {
      // Find which group the 'over' dice is in
      const overDiceGroup = groups.find(g => g.diceIds.includes(overId));
      
      if (overDiceGroup) {
        // Moving to/within a group
        const targetIdx = overDiceGroup.diceIds.indexOf(overId);
        onMoveDiceToGroup(activeId, overDiceGroup.id, targetIdx);
      } else {
        // Moving to/within ungrouped area
        // 1. Remove from any group first
        if (activeDiceGroup) {
          onMoveDiceToGroup(activeId, null);
        }
        // 2. Reorder in global list (affects ungrouped order)
        const activeIdx = diceConfigs.findIndex(d => d.id === activeId);
        const overIdx = diceConfigs.findIndex(d => d.id === overId);
        if (activeIdx !== -1 && overIdx !== -1) {
          onReorderDice(arrayMove(diceConfigs, activeIdx, overIdx));
        }
      }
      return;
    }

    // Check if dropped over a group header or ungrouped header
    if (overId === "other-rolls-header") {
      onMoveDiceToGroup(activeId, null);
      return;
    }

    const overGroupIdx = groups.findIndex((g) => g.id === overId);
    if (overGroupIdx !== -1) {
      onMoveDiceToGroup(activeId, overId);
      return;
    }
  };

  // Dice that are NOT in any group
  const ungroupedDice = diceConfigs.filter(
    (c) => !groups.some((g) => g.diceIds.includes(c.id))
  );

  return (
    <div className="flex flex-col h-full overflow-hidden border border-border/50 rounded-xl bg-card/30">
      {/* Scrollable Presets Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-thin scrollbar-thumb-primary/10 hover:scrollbar-thumb-primary/20">
        <DndContext
          sensors={sensors}
          collisionDetection={pointerWithin}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          modifiers={[restrictToVerticalAxis]}
        >
          {/* Groups Section */}
          <div className="space-y-3">
            <SortableContext items={groups.map(g => g.id)} strategy={verticalListSortingStrategy}>
              {groups.map((group) => (
                <DiceGroup
                  key={group.id}
                  group={group}
                  diceConfigs={diceConfigs}
                  onToggleCollapse={() => onToggleGroup(group.id)}
                  onDelete={() => onDeleteGroup(group.id)}
                  onUpdateGroup={onUpdateGroup}
                  onRollGroup={(mode) => onRollGroup(group.id, mode)}
                  onUpdateDice={onUpdateDice}
                  onDeleteDice={onDeleteDice}
                  onRollDice={onRollDice}
                />
              ))}
            </SortableContext>
          </div>

          {/* Ungrouped Section */}
          {ungroupedDice.length > 0 && (
            <div className="space-y-2 pt-4 border-t border-border/30">
              <UngroupedHeader />
              <SortableContext items={ungroupedDice.map(d => d.id)} strategy={verticalListSortingStrategy}>
                {ungroupedDice.map((config) => (
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
        </DndContext>

        <DragOverlay dropAnimation={dropAnimation}>
          {activeId ? (
            activeDice ? (
              <div className="w-full opacity-40 rotate-1 scale-105 cursor-grabbing transition-transform duration-200">
                <DiceCard
                  config={activeDice}
                  onUpdate={() => {}}
                  onDelete={() => {}}
                  onRoll={() => {}}
                  isOverlay
                />
              </div>
            ) : activeGroup ? (
              <div className="w-full opacity-40 rotate-1 scale-105 cursor-grabbing transition-transform duration-200">
                <DiceGroup
                  group={activeGroup}
                  diceConfigs={diceConfigs}
                  onToggleCollapse={() => {}}
                  onDelete={() => {}}
                  onUpdateGroup={() => {}}
                  onRollGroup={() => {}}
                  onUpdateDice={() => {}}
                  onDeleteDice={() => {}}
                  onRollDice={() => {}}
                  isOverlay
                />
              </div>
            ) : null
          ) : null}
        </DragOverlay>

        {diceConfigs.length === 0 && groups.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground opacity-50">
            <Wand2 size={48} strokeWidth={1} className="mb-2" />
            <p className="text-[10px] uppercase font-bold tracking-widest">No presets saved</p>
          </div>
        )}
      </div>

      <div className="p-3 border-t border-border/50 bg-background/50 shrink-0 space-y-3">
        {showQuickAdd && (
          <div className="flex gap-2 animate-in fade-in slide-in-from-bottom-2 duration-200">
            <Input
              autoFocus
              placeholder="Enter notation (e.g. 2d10+5)"
              className={clsx(
                "h-9 text-xs",
                error && "border-destructive ring-destructive/20"
              )}
              value={notation}
              onChange={(e) => setNotation(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAddManual();
                if (e.key === 'Escape') setShowQuickAdd(false);
              }}
            />
            <Button size="sm" onClick={() => handleAddManual()} className="h-9 px-4">Add</Button>
          </div>
        )}
        <div className="grid grid-cols-3 gap-2">
          <Button 
            variant={showQuickAdd ? "primary" : "secondary"} 
            className="gap-2 h-10 px-0 flex-col py-1 text-[10px]" 
            onClick={() => setShowQuickAdd(!showQuickAdd)}
          >
            <Keyboard size={14} />
            Quick
          </Button>
          <Button variant="secondary" className="gap-2 h-10 px-0 flex-col py-1 text-[10px]" onClick={handleAddNewQuick}>
            <Plus size={14} />
            Dice
          </Button>
          <Button variant="secondary" className="gap-2 h-10 px-0 flex-col py-1 text-[10px]" onClick={handleAddGroupQuick}>
            <FolderPlus size={14} />
            Group
          </Button>
        </div>
      </div>
    </div>
  );
};
