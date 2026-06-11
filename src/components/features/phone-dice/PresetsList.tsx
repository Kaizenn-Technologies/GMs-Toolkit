import React, { useRef } from "react";
import type { DicePreset } from "./types";
import { Swords, Shield, Flame, Sparkles, Wand2, Heart, Dices } from "lucide-react";

interface PresetsListProps {
  presets: DicePreset[];
  onRoll: (formula: string, label: string) => void;
  onEditPreset: (preset: DicePreset) => void;
  isRolling: boolean;
}

const getIcon = (iconName: DicePreset["icon"]) => {
  switch (iconName) {
    case "sword":
      return <Swords className="size-4 text-emerald-500" />;
    case "shield":
      return <Shield className="size-4 text-blue-500" />;
    case "explosion":
      return <Flame className="size-4 text-orange-500" />;
    case "spell":
      return <Sparkles className="size-4 text-purple-500" />;
    case "magic":
      return <Wand2 className="size-4 text-pink-500" />;
    case "heart":
      return <Heart className="size-4 text-red-500" />;
    default:
      return <Dices className="size-4 text-muted-foreground/60" />;
  }
};

// Hoisted out of PresetsList to give it a stable component identity.
// Previously nested inside PresetsList, which meant React re-created the
// component on every parent render — destroying DOM state (focus, timers).
interface PresetCardProps {
  preset: DicePreset;
  isRolling: boolean;
  onRoll: (formula: string, label: string) => void;
  onEditPreset: (preset: DicePreset) => void;
}

const PresetCard: React.FC<PresetCardProps> = ({ preset, isRolling, onRoll, onEditPreset }) => {
  const timerRef = useRef<number | null>(null);
  const hasLongPressed = useRef(false);

  const startPress = () => {
    hasLongPressed.current = false;
    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = window.setTimeout(() => {
      hasLongPressed.current = true;
      // Trigger haptic vibration if available
      if (window.navigator.vibrate) {
        window.navigator.vibrate(50);
      }
      onEditPreset(preset);
    }, 550);
  };

  const endPress = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (!hasLongPressed.current) {
      // Roll instantly on tap
      onRoll(preset.formula, preset.name);
    }
  };

  const cancelPress = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const displayName = preset.name.trim() ? preset.name : preset.formula;

  return (
    <button
      type="button"
      disabled={isRolling}
      onPointerDown={startPress}
      onPointerUp={endPress}
      onPointerLeave={cancelPress}
      onPointerCancel={cancelPress}
      onContextMenu={(e) => e.preventDefault()}
      className="
        group relative bg-card border border-border/80 rounded-xl overflow-hidden
        flex items-center gap-2.5 px-3.5 py-3 w-full text-left select-none cursor-pointer
        disabled:opacity-40 disabled:cursor-not-allowed hover:border-primary/30
        active:scale-[0.97] active:bg-muted/10 transition-all duration-150 shadow-sm
      "
      title={`${displayName} (Hold to edit)`}
    >
      {/* Left Side Icon */}
      <div className="shrink-0 flex items-center justify-center p-1.5 bg-muted/40 rounded-lg">
        {getIcon(preset.icon)}
      </div>

      {/* Name */}
      <div className="flex-1 min-w-0">
        <div className="font-extrabold text-xs text-foreground truncate group-hover:text-primary transition-colors">
          {displayName}
        </div>
      </div>
    </button>
  );
};

export const PresetsList: React.FC<PresetsListProps> = ({
  presets,
  onRoll,
  onEditPreset,
  isRolling,
}) => {

  return (
    <div className="space-y-2.5 my-2">
      {presets.length > 0 && (
        <div className="flex justify-between items-center px-1">
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
            Presets
          </h3>
          <span className="text-[9px] text-muted-foreground/40 font-bold uppercase tracking-wider">
            Hold card to Edit
          </span>
        </div>
      )}

      {presets.length === 0 ? (
        <div className="text-center py-4 border border-dashed border-border/60 rounded-xl text-xs text-muted-foreground/60 bg-muted/5">
          No custom presets. Create one with the `+` button!
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          {presets.map((preset) => (
            <PresetCard
              key={preset.id}
              preset={preset}
              isRolling={isRolling}
              onRoll={onRoll}
              onEditPreset={onEditPreset}
            />
          ))}
        </div>
      )}
    </div>
  );
};
