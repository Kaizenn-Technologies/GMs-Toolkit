import React, { useState } from "react";
import type { DiceConfig, DiceGroup as IDiceGroup } from "./types";
import { DiceCard } from "./DiceCard";
import { DiceGroup } from "./DiceGroup";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Plus, FolderPlus, Terminal, MagicWand } from "@phosphor-icons/react";
import { parseDiceNotation } from "./utils";
import { clsx } from "clsx";

interface DiceBuilderProps {
  diceConfigs: DiceConfig[];
  groups: IDiceGroup[];
  onAddDice: (config: DiceConfig) => void;
  onUpdateDice: (id: string, updates: Partial<DiceConfig>) => void;
  onDeleteDice: (id: string) => void;
  onAddGroup: (name: string) => void;
  onDeleteGroup: (id: string) => void;
  onToggleGroup: (id: string) => void;
  onRollDice: (id: string, mode: "normal" | "advantage" | "disadvantage") => void;
  onRollGroup: (id: string, mode: "normal" | "advantage" | "disadvantage") => void;
  settings: { manualNotation: boolean };
}

export const DiceBuilder: React.FC<DiceBuilderProps> = ({
  diceConfigs,
  groups,
  onAddDice,
  onUpdateDice,
  onDeleteDice,
  onAddGroup,
  onDeleteGroup,
  onToggleGroup,
  onRollDice,
  onRollGroup,
  settings,
}) => {
  const [notation, setNotation] = useState("");
  const [error, setError] = useState(false);

  const handleAddManual = () => {
    const config = parseDiceNotation(notation);
    if (config.count && config.sides) {
      onAddDice(config as DiceConfig);
      setNotation("");
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

  // Dice that are NOT in any group
  const ungroupedDice = diceConfigs.filter(
    (c) => !groups.some((g) => g.diceIds.includes(c.id))
  );

  return (
    <div className="flex flex-col h-full space-y-4">
      <Tabs defaultValue="presets" className="w-full flex-1 flex flex-col">
        <TabsList className={clsx("grid w-full h-11 bg-muted/50 p-1", settings.manualNotation ? "grid-cols-2" : "grid-cols-1")}>
          <TabsTrigger value="presets" className="gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <MagicWand size={16} />
            Presets
          </TabsTrigger>
          {settings.manualNotation && (
            <TabsTrigger value="manual" className="gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">
              <Terminal size={16} />
              Notation
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="presets" className="flex-1 overflow-y-auto space-y-4 pt-4 pr-1">
          {/* Groups first */}
          <div className="space-y-3">
            {groups.map((group) => (
              <DiceGroup
                key={group.id}
                group={group}
                diceConfigs={diceConfigs}
                onToggleCollapse={() => onToggleGroup(group.id)}
                onDelete={() => onDeleteGroup(group.id)}
                onRollGroup={(mode) => onRollGroup(group.id, mode)}
                onUpdateDice={onUpdateDice}
                onDeleteDice={onDeleteDice}
                onRollDice={onRollDice}
              />
            ))}
          </div>

          {/* Ungrouped dice */}
          <div className="space-y-2">
            {ungroupedDice.map((config) => (
              <DiceCard
                key={config.id}
                config={config}
                onUpdate={(updates) => onUpdateDice(config.id, updates)}
                onDelete={() => onDeleteDice(config.id)}
                onRoll={(mode) => onRollDice(config.id, mode)}
              />
            ))}
          </div>

          {diceConfigs.length === 0 && groups.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground opacity-50">
              <MagicWand size={48} weight="light" className="mb-2" />
              <p>No presets saved</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="manual" className="pt-4">
          <div className="p-4 rounded-xl border border-dashed border-border/50 space-y-4 bg-muted/20">
            <div className="space-y-2">
              <label className="text-xs font-bold text-muted-foreground uppercase">Dice Notation</label>
              <div className="flex gap-2">
                <Input
                  placeholder="e.g. 4d6k3+2!"
                  value={notation}
                  onChange={(e) => setNotation(e.target.value)}
                  className={error ? "border-destructive ring-destructive/20" : ""}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddManual()}
                />
                <Button onClick={handleAddManual}>Add</Button>
              </div>
              <p className="text-[10px] text-muted-foreground">
                Support for <b>kN</b> (keep), <b>dN</b> (drop), <b>!</b> (explode), <b>rN</b> (reroll).
              </p>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <div className="grid grid-cols-2 gap-3 pt-4 border-t border-border/50 shrink-0">
        <Button variant="secondary" className="gap-2 h-11" onClick={handleAddNewQuick}>
          <Plus size={18} weight="bold" />
          Add Dice
        </Button>
        <Button variant="secondary" className="gap-2 h-11" onClick={handleAddGroupQuick}>
          <FolderPlus size={18} weight="bold" />
          Add Group
        </Button>
      </div>
    </div>
  );
};
