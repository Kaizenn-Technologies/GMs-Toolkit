import React, { useState, useEffect } from "react";
import type { RollObject } from "./types";

interface RollSummaryProps {
  activeRoll: RollObject | null;
  isRolling: boolean;
  onOpenDetails: () => void;
}

export const RollSummary: React.FC<RollSummaryProps> = ({
  activeRoll,
  isRolling,
  onOpenDetails,
}) => {
  const [flickerVal, setFlickerVal] = useState(20);

  // Rapidly change number during rolling animation
  useEffect(() => {
    if (!isRolling) return;
    const interval = setInterval(() => {
      setFlickerVal(Math.floor(Math.random() * 20) + 1);
    }, 60);
    return () => clearInterval(interval);
  }, [isRolling]);

  const result = isRolling ? flickerVal : activeRoll ? activeRoll.result : "--";

  let colorClass = "text-foreground dark:text-white";
  if (!isRolling && activeRoll) {
    if (activeRoll.advantageState === "advantage") {
      colorClass = "text-emerald-500";
    } else if (activeRoll.advantageState === "disadvantage") {
      colorClass = "text-red-500";
    }
  }

  return (
    <button
      type="button"
      onClick={isRolling ? undefined : onOpenDetails}
      disabled={isRolling}
      className={`
        w-full py-10 flex items-center justify-center select-none transition-all duration-200
        ${isRolling ? "cursor-default" : "cursor-pointer active:scale-95"}
      `}
    >
      <div className="flex flex-col items-center justify-center">
        <div
          className={`
            font-mono text-8xl font-black tracking-tighter leading-none select-none
            ${isRolling ? "animate-number-flicker text-muted-foreground/45" : ""}
            ${colorClass}
          `}
        >
          {result}
        </div>
        {isRolling ? (
          <span className="text-[10px] font-sans font-bold uppercase tracking-widest text-muted-foreground/45 mt-2 animate-pulse">
            Rolling…
          </span>
        ) : activeRoll ? (
          <span className="text-[10px] font-sans font-bold uppercase tracking-widest text-muted-foreground/45 mt-2">
            Tap to view breakdown
          </span>
        ) : (
          <span className="text-[10px] font-sans font-bold uppercase tracking-widest text-muted-foreground/35 mt-2">
            Tap standard die or preset below
          </span>
        )}
      </div>
    </button>
  );
};
