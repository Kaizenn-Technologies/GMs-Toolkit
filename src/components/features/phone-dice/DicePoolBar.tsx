import React from "react";
import { Trash2, Play } from "lucide-react";

interface PoolGroup {
  sides: number;
  count: number;
}

interface DicePoolBarProps {
  activePool: PoolGroup[];
  removeFromPool: (sides: number) => void;
  clearPool: () => void;
  onRollPool: () => void;
}

export const DicePoolBar: React.FC<DicePoolBarProps> = ({
  activePool,
  removeFromPool,
  clearPool,
  onRollPool,
}) => {
  return (
    <div className="w-full bg-card/45 border border-border/60 rounded-2xl p-3 transition-all duration-200 animate-in fade-in duration-200">
      <div className="flex justify-between items-center min-h-[36px] gap-2">
        {activePool.length === 0 ? (
          <div className="text-[10px] text-muted-foreground/60 italic font-medium w-full text-center py-2 border border-dashed border-border/30 rounded-xl bg-muted/5 select-none">
            Tap standard dice below to build a pool
          </div>
        ) : (
          <>
            {/* Active Dice Pills */}
            <div className="flex flex-wrap gap-1.5 flex-1 max-w-[70%]">
              {activePool.map((group) => (
                <button
                  key={group.sides}
                  type="button"
                  onClick={() => removeFromPool(group.sides)}
                  className="
                    bg-primary/5 border border-primary/20 rounded-lg px-2.5 py-1 
                    flex items-center gap-1 font-mono text-xs font-bold text-primary
                    animate-in zoom-in-95 duration-150 select-none cursor-pointer
                    hover:bg-destructive/5 hover:border-destructive/20 hover:text-destructive
                    active:scale-95 transition-all duration-150
                  "
                  title="Tap to remove one"
                >
                  {group.count}d{group.sides}
                </button>
              ))}
            </div>

            {/* Actions */}
            <div className="flex gap-1.5 items-center shrink-0">
              <button
                type="button"
                onClick={clearPool}
                className="
                  p-2 rounded-xl border border-border/80 bg-card hover:bg-muted text-muted-foreground
                  cursor-pointer transition-all duration-150 active:scale-90 select-none
                "
                title="Clear Pool"
              >
                <Trash2 className="size-3.5" />
              </button>
              <button
                type="button"
                onClick={onRollPool}
                className="
                  px-3.5 py-1.5 bg-primary text-primary-foreground font-bold text-xs rounded-xl shadow-md shadow-primary/10
                  flex items-center gap-1.5 cursor-pointer transition-all duration-150 active:scale-95 hover:opacity-95 select-none
                "
              >
                <Play className="size-3 fill-current" />
                <span>Roll</span>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
