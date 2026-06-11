import React from "react";

interface DiceRowProps {
  onAddDie: (sides: number) => void;
  isRolling: boolean;
}

interface DieConfig {
  sides: number;
  label: string;
  color: string;
  bgGlow: string;
}

const STANDARD_DICE: DieConfig[] = [
  { sides: 4, label: "d4", color: "text-red-400 border-red-500/20", bgGlow: "group-hover:bg-red-500/5" },
  { sides: 6, label: "d6", color: "text-orange-400 border-orange-500/20", bgGlow: "group-hover:bg-orange-500/5" },
  { sides: 8, label: "d8", color: "text-emerald-400 border-emerald-500/20", bgGlow: "group-hover:bg-emerald-500/5" },
  { sides: 10, label: "d10", color: "text-cyan-400 border-cyan-500/20", bgGlow: "group-hover:bg-cyan-500/5" },
  { sides: 12, label: "d12", color: "text-blue-400 border-blue-500/20", bgGlow: "group-hover:bg-blue-500/5" },
  { sides: 20, label: "d20", color: "text-purple-400 border-purple-500/20", bgGlow: "group-hover:bg-purple-500/5" },
];

export const DiceRow: React.FC<DiceRowProps> = ({ onAddDie, isRolling }) => {
  return (
    <div className="my-2">
      <div className="flex gap-2 overflow-x-auto scrollbar-none py-1 flex-nowrap w-full justify-between">
        {STANDARD_DICE.map((die) => (
          <button
            type="button"
            key={die.sides}
            disabled={isRolling}
            onClick={() => onAddDie(die.sides)}
            className={`
              flex-1 min-w-[50px] h-14 rounded-xl bg-card border border-border/80 text-foreground
              flex flex-col items-center justify-center relative overflow-hidden group
              select-none cursor-pointer transition-all duration-200 active:scale-90
              hover:border-primary/30 hover:shadow-md hover:shadow-primary/5
              disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100
            `}
          >
            {/* Hover Glow */}
            <div className={`absolute inset-0 transition-colors duration-300 pointer-events-none ${die.bgGlow}`} />

            <div className={`font-mono text-sm font-black tracking-tight ${die.color}`}>
              {die.label}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
