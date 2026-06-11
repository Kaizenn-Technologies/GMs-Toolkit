import React from "react";
import { clsx } from "clsx";
import { Wand2, Plus } from "lucide-react";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  defaultDropAnimationSideEffects,
  pointerWithin,
  useDroppable,
} from "@dnd-kit/core";
import type { DragStartEvent, DragEndEvent, DropAnimation } from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { DiceCard } from "./DiceCard";
import { DiceGroup } from "./DiceGroup";
import type { DiceConfig, DiceGroup as IDiceGroup } from "./types";

const UngroupedHeader: React.FC<{ isDragging?: boolean }> = ({ isDragging }) => {
  const { setNodeRef, isOver } = useDroppable({
    id: "other-rolls-header",
  });

  return (
    <h3
      ref={setNodeRef}
      className={clsx(
        "text-[11px] uppercase font-bold px-1 transition-colors duration-200",
        isOver ? "text-primary" : "text-muted-foreground",
        !isDragging && "opacity-80"
      )}
    >
      Ungrouped Rolls
    </h3>
  );
};

const BottomDropZone: React.FC<{ activeId: string | null }> = ({ activeId }) => {
  const { setNodeRef, isOver } = useDroppable({
    id: "bottom-drop-zone",
  });

  if (!activeId) return <div ref={setNodeRef} className="h-4" />;

  return (
    <div
      ref={setNodeRef}
      className={clsx(
        "h-12 border-2 border-dashed rounded-lg flex items-center justify-center transition-all duration-200 mt-4 mx-1",
        isOver
          ? "border-primary bg-primary/10 text-primary scale-[1.01] shadow-lg"
          : "border-border/20 text-muted-foreground/30 bg-muted/5"
      )}
    >
      <span className="text-[10px] uppercase font-bold tracking-widest flex items-center gap-2">
        <Plus size={12} />
        Ungroup Roll
      </span>
    </div>
  );
};

const DROP_ANIMATION: DropAnimation = {
  sideEffects: defaultDropAnimationSideEffects({
    styles: {
      active: {
        opacity: "0.4",
      },
    },
  }),
};

export interface DiceBuilderPresetsProps {
  groups: IDiceGroup[];
  diceConfigs: DiceConfig[];
  activeId: string | null;
  setActiveId: (id: string | null) => void;
  isSelectionMode: boolean;
  selectedGroupIds: Set<string>;
  selectedDiceIds: Set<string>;
  onToggleGroup: (id: string) => void;
  onDeleteGroup: (id: string) => void;
  onUpdateGroup: (id: string, updates: Partial<IDiceGroup>) => void;
  onRollGroup: (id: string, mode: "normal" | "advantage" | "disadvantage") => void;
  onUpdateDice: (id: string, updates: Partial<DiceConfig>) => void;
  onDeleteDice: (id: string) => void;
  onRollDice: (id: string, mode: "normal" | "advantage" | "disadvantage") => void;
  handleSelectGroup: (groupId: string, checked: boolean) => void;
  handleSelectDice: (diceId: string, checked: boolean) => void;
  onReorderGroups: (groups: IDiceGroup[]) => void;
  onMoveDiceToGroup: (diceId: string, groupId: string | null, position?: number) => void;
  onReorderDice: (dice: DiceConfig[]) => void;
}

export const DiceBuilderPresets: React.FC<DiceBuilderPresetsProps> = ({
  groups,
  diceConfigs,
  activeId,
  setActiveId,
  isSelectionMode,
  selectedGroupIds,
  selectedDiceIds,
  onToggleGroup,
  onDeleteGroup,
  onUpdateGroup,
  onRollGroup,
  onUpdateDice,
  onDeleteDice,
  onRollDice,
  handleSelectGroup,
  handleSelectDice,
  onReorderGroups,
  onMoveDiceToGroup,
  onReorderDice,
}) => {
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
    const activeDiceConfig = diceConfigs.find((d) => d.id === activeId);
    if (!activeDiceConfig) return;

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
    if (overId === "other-rolls-header" || overId === "bottom-drop-zone") {
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

  const activeDice = activeId ? diceConfigs.find(d => d.id === activeId) : null;
  const activeGroup = activeId ? groups.find(g => g.id === activeId) : null;

  return (
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
                isSelectionMode={isSelectionMode}
                isSelected={selectedGroupIds.has(group.id)}
                selectedDiceIds={selectedDiceIds}
                onSelectGroup={handleSelectGroup}
                onSelectDice={handleSelectDice}
              />
            ))}
          </SortableContext>
        </div>

        {/* Ungrouped Section */}
        <div className={clsx(
          "space-y-2 pt-4 border-t border-border/30 transition-opacity duration-200",
          ungroupedDice.length === 0 && !activeId && "hidden",
          ungroupedDice.length === 0 && activeId && "opacity-50"
        )}>
          <UngroupedHeader isDragging={!!activeId} />
          <SortableContext items={ungroupedDice.map(d => d.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-2 min-h-[20px]">
              {ungroupedDice.map((config) => (
                <DiceCard
                  key={config.id}
                  config={config}
                  onUpdate={(updates) => onUpdateDice(config.id, updates)}
                  onDelete={() => onDeleteDice(config.id)}
                  onRoll={(mode) => onRollDice(config.id, mode)}
                  isSelectionMode={isSelectionMode}
                  isSelected={selectedDiceIds.has(config.id)}
                  onSelect={(checked) => handleSelectDice(config.id, checked)}
                />
              ))}
            </div>
          </SortableContext>
        </div>

        <BottomDropZone activeId={activeId} />
      </DndContext>

      <DragOverlay dropAnimation={DROP_ANIMATION}>
        {activeId ? (
          activeDice ? (
            <div className="w-full opacity-40 rotate-1 scale-105 cursor-grabbing transition-transform duration-200">
              <DiceCard
                config={activeDice}
                onUpdate={() => { }}
                onDelete={() => { }}
                onRoll={() => { }}
                isOverlay
              />
            </div>
          ) : activeGroup ? (
            <div className="w-full opacity-40 rotate-1 scale-105 cursor-grabbing transition-transform duration-200">
              <DiceGroup
                group={activeGroup}
                diceConfigs={diceConfigs}
                onToggleCollapse={() => { }}
                onDelete={() => { }}
                onUpdateGroup={() => { }}
                onRollGroup={() => { }}
                onUpdateDice={() => { }}
                onDeleteDice={() => { }}
                onRollDice={() => { }}
                isOverlay
              />
            </div>
          ) : null
        ) : null}
      </DragOverlay>

      {diceConfigs.length === 0 && groups.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground/80">
          <Wand2 size={48} strokeWidth={1} className="mb-2" />
          <p className="text-[11px] uppercase font-bold tracking-widest">No presets saved</p>
        </div>
      )}
    </div>
  );
};
