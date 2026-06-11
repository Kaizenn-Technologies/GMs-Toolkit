import React, { useReducer, useEffect } from "react";
import type { DicePreset } from "./types";
import { X, Trash2, Plus, Minus, Swords, Shield, Flame, Sparkles, Wand2, Heart, Dices } from "lucide-react";

interface PresetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string, formula: string, icon?: DicePreset["icon"]) => void;
  onDelete?: () => void;
  presetToEdit: DicePreset | null;
}

const ICONS_LIST = [
  { name: "sword", icon: <Swords className="size-4 text-emerald-500" /> },
  { name: "shield", icon: <Shield className="size-4 text-blue-500" /> },
  { name: "explosion", icon: <Flame className="size-4 text-orange-500" /> },
  { name: "spell", icon: <Sparkles className="size-4 text-purple-500" /> },
  { name: "magic", icon: <Wand2 className="size-4 text-pink-500" /> },
  { name: "heart", icon: <Heart className="size-4 text-red-500" /> },
] as const;

function parsePresetFormula(formulaStr: string) {
  const cleaned = formulaStr.replace(/\s+/g, "").toLowerCase();
  const termRegex = /([+-]?\d*)d(\d+)|([+-]\d+)/g;
  const groupsMap: { [key: number]: number } = {};
  let modifier = 0;
  let match;
  let hasDice = false;

  while ((match = termRegex.exec(cleaned)) !== null) {
    if (match[3]) {
      modifier += parseInt(match[3], 10);
    } else {
      hasDice = true;
      let countVal = parseInt(match[1], 10) || 1;
      if (match[1] === "+") countVal = 1;
      if (match[1] === "-") countVal = -1;
      const sidesVal = parseInt(match[2], 10) || 20;
      const absCount = Math.abs(countVal);
      groupsMap[sidesVal] = (groupsMap[sidesVal] || 0) + absCount;
    }
  }

  if (!hasDice) {
    return { diceGroups: [], modifier };
  }

  const diceGroups = Object.keys(groupsMap)
    .map((sidesStr) => {
      const sides = parseInt(sidesStr, 10);
      return { count: groupsMap[sides], sides };
    })
    .sort((a, b) => a.sides - b.sides);

  return { diceGroups, modifier };
}

export const PresetModal: React.FC<PresetModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  presetToEdit,
}) => {
  const parsed = presetToEdit ? parsePresetFormula(presetToEdit.formula) : null;

  const [state, dispatch] = useReducer((s: any, a: any) => ({ ...s, ...a }), {
    name: presetToEdit ? presetToEdit.name : "",
    formula: presetToEdit ? presetToEdit.formula : "1d20",
    selectedIcon: presetToEdit?.icon || "sword",
    isIconPickerOpen: false,
    diceGroups: parsed ? parsed.diceGroups : [{ count: 1, sides: 20 }],
    modifier: parsed ? parsed.modifier : 0,
  });

  const { name, formula, selectedIcon, isIconPickerOpen, diceGroups, modifier } = state;

  const setName = (name: string) => dispatch({ name });
  const setFormula = (formula: string) => dispatch({ formula });
  const setSelectedIcon = (selectedIcon: DicePreset["icon"]) => dispatch({ selectedIcon });
  const setIsIconPickerOpen = (isIconPickerOpen: boolean) => dispatch({ isIconPickerOpen });
  const setDiceGroups = (diceGroups: { count: number; sides: number }[]) => dispatch({ diceGroups });
  const setModifier = (modifier: number) => dispatch({ modifier });

  // Sync state if presetToEdit changes
  useEffect(() => {
    if (presetToEdit) {
      const p = parsePresetFormula(presetToEdit.formula);
      dispatch({
        name: presetToEdit.name,
        formula: presetToEdit.formula,
        selectedIcon: presetToEdit.icon || "sword",
        diceGroups: p.diceGroups,
        modifier: p.modifier,
        isIconPickerOpen: false
      });
    } else {
      dispatch({
        name: "",
        formula: "1d20",
        selectedIcon: "sword",
        diceGroups: [{ count: 1, sides: 20 }],
        modifier: 0,
        isIconPickerOpen: false
      });
    }
  }, [presetToEdit]);

  // Recalculate notation formula based on stack
  const updateFormulaFromStack = (groups: typeof diceGroups, mod: number) => {
    const parts = groups.map((g: any) => `${g.count}d${g.sides}`);
    const modPart = mod > 0 ? `+${mod}` : mod < 0 ? `${mod}` : "";
    setFormula(parts.join("+") + modPart);
  };

  const addDieToPreset = (sides: number) => {
    const existing = diceGroups.find((g: any) => g.sides === sides);
    let updated;
    if (existing) {
      updated = diceGroups.map((g: any) => (g.sides === sides ? { ...g, count: Math.min(100, g.count + 1) } : g));
    } else {
      updated = [...diceGroups, { count: 1, sides }];
    }
    updated.sort((a: any, b: any) => a.sides - b.sides);
    updateFormulaFromStack(updated, modifier);
    setDiceGroups(updated);
  };

  const removeDieFromPreset = (sides: number) => {
    const existing = diceGroups.find((g: any) => g.sides === sides);
    if (!existing) return;
    let updated;
    if (existing.count <= 1) {
      updated = diceGroups.filter((g: any) => g.sides !== sides);
    } else {
      updated = diceGroups.map((g: any) => (g.sides === sides ? { ...g, count: g.count - 1 } : g));
    }
    updateFormulaFromStack(updated, modifier);
    setDiceGroups(updated);
  };

  const handleModifierChange = (newMod: number) => {
    const modVal = Math.max(-100, Math.min(100, newMod));
    setModifier(modVal);
    updateFormulaFromStack(diceGroups, modVal);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    // Validate formula matches dice pattern (e.g. 1d20, 2d6+1d8-3)
    const cleaned = formula.replace(/\s+/g, "");
    if (!/^\d*d\d+(?:[+-]\d*d\d+)*(?:[+-]\d+)?$/i.test(cleaned)) {
      alert("Invalid notation formula. Use format like: 1d20, 2d6+1d4, 1d8+3");
      return;
    }

    onSave(name.trim(), cleaned, selectedIcon);
    onClose();
  };

  const currentIcon = ICONS_LIST.find((i) => i.name === selectedIcon)?.icon || (
    <Dices className="size-4 text-muted-foreground/60" />
  );

  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 z-50 flex flex-col justify-end bg-black/75 backdrop-blur-xs select-none">
      {/* Tap outside to close */}
      <div className="flex-1 cursor-default" onClick={onClose} aria-hidden="true" />

      {/* Drawer Container */}
      <div className="bg-card border-t border-border rounded-t-3xl max-h-[85%] overflow-y-auto px-5 py-6 space-y-4.5 shadow-2xl relative z-10 animate-in slide-in-from-bottom duration-300">
        
        {/* Header */}
        <div className="flex justify-between items-center pb-1.5 border-b border-border/40">
          <h2 className="text-sm font-extrabold tracking-tight text-foreground m-0">
            {presetToEdit ? "Modify Preset" : "Create Preset"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="size-8 border border-border flex items-center justify-center cursor-pointer hover:bg-muted/80 active:scale-90 select-none"
            aria-label="Close dialog"
          >
            <X className="size-4 text-muted-foreground" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Preset Name and Icon Picker Row */}
          <PresetIconPicker
            name={name}
            setName={setName}
            selectedIcon={selectedIcon}
            setSelectedIcon={setSelectedIcon}
            isIconPickerOpen={isIconPickerOpen}
            setIsIconPickerOpen={setIsIconPickerOpen}
            currentIcon={currentIcon}
          />

          {/* Multi-Dice Builder Stack (Dice Pool Method) */}
          <PresetMultiDiceBuilder
            formula={formula}
            diceGroups={diceGroups}
            modifier={modifier}
            addDieToPreset={addDieToPreset}
            removeDieFromPreset={removeDieFromPreset}
            handleModifierChange={handleModifierChange}
          />

          {/* Formula Notation Direct Input */}
          <div className="space-y-1.5">
            <input
              type="text"
              required
              placeholder="Formula Notation (e.g. 1d20+5, 2d6+1d8-1)"
              value={formula}
              onChange={(e) => {
                setFormula(e.target.value);
                
                // Real-time formula parsing support
                const { diceGroups: parsedGroups, modifier: parsedMod } = parsePresetFormula(e.target.value);
                const cleaned = e.target.value.replace(/\s+/g, "").toLowerCase();
                const hasDiceOrMod = /d\d+|[+-]\d+/i.test(cleaned);
                if (hasDiceOrMod) {
                  setDiceGroups(parsedGroups);
                  setModifier(parsedMod);
                }
              }}
              className="
                w-full bg-muted/50 border border-border/80 rounded-xl px-4 py-2.5 text-xs font-mono font-bold text-foreground
                focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary
              "
              aria-label="Formula Notation"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2.5 pt-2">
            {presetToEdit && onDelete && (
              <button
                type="button"
                onClick={() => {
                  if (confirm(`Are you sure you want to delete the "${presetToEdit.name}" preset?`)) {
                    onDelete();
                    onClose();
                  }
                }}
                className="
                  px-3 rounded-xl border border-destructive/20 bg-destructive/5 hover:bg-destructive/10 text-destructive
                  flex items-center justify-center cursor-pointer active:scale-95 transition-all duration-200
                "
                title="Delete Preset"
                aria-label="Delete preset"
              >
                <Trash2 className="size-4" />
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="
                flex-1 py-3 border border-border/80 rounded-xl font-bold text-xs hover:bg-muted/40
                transition-all duration-200 active:scale-95 cursor-pointer text-center text-muted-foreground hover:text-foreground
              "
            >
              Cancel
            </button>

            <button
              type="submit"
              className="
                flex-2 py-3 bg-primary text-primary-foreground font-bold text-xs rounded-xl hover:opacity-90
                transition-all duration-200 active:scale-95 cursor-pointer text-center shadow-md shadow-primary/10
              "
            >
              Save Preset
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

interface PresetIconPickerProps {
  name: string;
  setName: (name: string) => void;
  selectedIcon: DicePreset["icon"];
  setSelectedIcon: (icon: DicePreset["icon"]) => void;
  isIconPickerOpen: boolean;
  setIsIconPickerOpen: (isOpen: boolean) => void;
  currentIcon: React.ReactNode;
}

const PresetIconPicker: React.FC<PresetIconPickerProps> = ({
  name,
  setName,
  selectedIcon,
  setSelectedIcon,
  isIconPickerOpen,
  setIsIconPickerOpen,
  currentIcon,
}) => (
  <div className="space-y-1.5">
    <div className="flex gap-2 items-start w-full">
      {/* Name Input */}
      <input
        type="text"
        required
        placeholder="Preset Name (e.g. Longsword Attack)"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="
          flex-1 bg-muted/50 border border-border/80 rounded-xl h-9 px-2 text-xs font-bold text-foreground
          focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary
        "
        aria-label="Preset Name"
      />

      {/* Icon Selector Button */}
      <button
        type="button"
        onClick={() => setIsIconPickerOpen(!isIconPickerOpen)}
        className={`
          size-9 rounded-xl border flex items-center justify-center cursor-pointer select-none transition-all duration-200
          ${
            isIconPickerOpen
              ? "bg-primary/10 border-primary shadow-sm"
              : "bg-muted/50 border-border/80 hover:bg-muted/80 text-foreground"
          }
        `}
        title="Select Icon"
      >
        {currentIcon}
      </button>
    </div>

    {/* Inline Icon picker selection grid */}
    {isIconPickerOpen && (
      <div className="grid grid-cols-6 gap-1.5 p-2 bg-muted/30 border border-border/45 rounded-xl animate-in fade-in slide-in-from-top-1 duration-200">
        {ICONS_LIST.map((item) => (
          <button
            type="button"
            key={item.name}
            onClick={() => {
              setSelectedIcon(item.name as DicePreset["icon"]);
              setIsIconPickerOpen(false);
            }}
            className={`
              py-2 rounded-lg border flex items-center justify-center cursor-pointer transition-all duration-150 active:scale-90
              ${
                selectedIcon === item.name
                  ? "bg-card border-primary ring-1 ring-primary/20"
                  : "bg-card/40 border-border/50 hover:bg-card"
              }
            `}
          >
            {item.icon}
          </button>
        ))}
      </div>
    )}
  </div>
);

interface PresetMultiDiceBuilderProps {
  formula: string;
  diceGroups: { count: number; sides: number }[];
  modifier: number;
  addDieToPreset: (sides: number) => void;
  removeDieFromPreset: (sides: number) => void;
  handleModifierChange: (modifier: number) => void;
}

const PresetMultiDiceBuilder: React.FC<PresetMultiDiceBuilderProps> = ({
  formula,
  diceGroups,
  modifier,
  addDieToPreset,
  removeDieFromPreset,
  handleModifierChange,
}) => (
  <div className="border border-border/60 bg-muted/15 rounded-2xl p-4 space-y-4">
    {/* Live Notation Output */}
    <div className="flex justify-between items-center pb-2 border-b border-border/30">
      <span className="font-sans text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">
        Preset Dice Pool
      </span>
      <span className="font-mono text-xs font-black text-primary bg-primary/5 px-2.5 py-0.5 rounded border border-primary/10">
        {formula || "0d20"}
      </span>
    </div>

    {/* Active Dice Pills (Click to remove/decrement) */}
    <div className="flex flex-wrap gap-1.5 min-h-[36px] items-center p-2 bg-card border border-border/70 rounded-xl select-none">
      {diceGroups.length === 0 ? (
        <span className="text-[10px] text-muted-foreground/50 italic w-full text-center py-1">
          Tap standard dice below to add
        </span>
      ) : (
        diceGroups.map((group) => (
          <button
            type="button"
            key={group.sides}
            onClick={() => removeDieFromPreset(group.sides)}
            className="
              bg-primary/5 border border-primary/20 rounded-lg px-2.5 py-1 
              flex items-center gap-1 font-mono text-xs font-bold text-primary
              hover:bg-destructive/5 hover:border-destructive/20 hover:text-destructive
              active:scale-95 transition-all duration-150 cursor-pointer select-none
            "
            title="Tap to remove one"
          >
            {group.count}d{group.sides}
          </button>
        ))
      )}
    </div>

    {/* Standard Dice Row for Preset Builder */}
    <div className="space-y-1.5">
      <div className="grid grid-cols-6 gap-1.5 w-full">
        {[4, 6, 8, 10, 12, 20].map((sides) => (
          <button
            type="button"
            key={sides}
            onClick={() => addDieToPreset(sides)}
            className="
              py-2 rounded-xl bg-card border border-border/80 text-foreground text-xs font-mono font-black
              hover:border-primary/30 active:scale-90 transition-all duration-200 cursor-pointer select-none text-center
            "
          >
            d{sides}
          </button>
        ))}
      </div>
    </div>

    {/* Modifier Stepper */}
    <div className="flex items-center justify-between pt-3 border-t border-border/30">
      <span className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">
        Modifier
      </span>
      <div className="flex items-center border border-border/80 rounded-xl bg-card overflow-hidden">
        <button
          type="button"
          onClick={() => handleModifierChange(modifier - 1)}
          className="px-2.5 py-2 flex items-center justify-center hover:bg-muted/40 text-muted-foreground active:scale-90 cursor-pointer"
        >
          <Minus className="size-3" />
        </button>
        <span className="font-mono text-xs font-bold w-10 text-center select-none">
          {modifier > 0 ? `+${modifier}` : modifier}
        </span>
        <button
          type="button"
          onClick={() => handleModifierChange(modifier + 1)}
          className="px-2.5 py-2 flex items-center justify-center hover:bg-muted/40 text-muted-foreground active:scale-90 cursor-pointer"
        >
          <Plus className="size-3" />
        </button>
      </div>
    </div>
  </div>
);
