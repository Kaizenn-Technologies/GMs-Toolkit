import React, { useState, useEffect, useRef } from "react";
import type { RollObject } from "./types";

interface OutcomesRowProps {
  history: RollObject[];
  activeRoll: RollObject | null;
  onSelectRoll: (roll: RollObject) => void;
  onOpenSummary: () => void;
}

export const OutcomesRow: React.FC<OutcomesRowProps> = ({
  history,
  activeRoll,
  onSelectRoll,
  onOpenSummary,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const activeItemRef = useRef<HTMLButtonElement>(null);
  const scrollTimeoutRef = useRef<number | null>(null);
  const lastScrollSelectedIdRef = useRef<string | null>(null);

  // Local state to track the visually highlighted roll ID in real-time scroll
  const [visualActiveId, setVisualActiveId] = useState<string | null>(activeRoll?.id || null);

  // Chronological order: oldest on left, latest on right (last item)
  const chronologicalHistory = [...history].reverse();

  // Track previous activeRoll.id to detect prop changes without triggering re-renders.
  // This value is never rendered to JSX, so useRef avoids wasted reconciliation.
  const prevActiveRollIdRef = useRef<string | null>(activeRoll?.id || null);

  if (activeRoll?.id !== prevActiveRollIdRef.current) {
    prevActiveRollIdRef.current = activeRoll?.id || null;
    setVisualActiveId(activeRoll?.id || null);
  }

  // Scroll to active item whenever it changes or history changes
  useEffect(() => {
    if (activeRoll && containerRef.current) {
      if (lastScrollSelectedIdRef.current === activeRoll.id) {
        // Scroll originated from manual scroll detection, skip to avoid fighting scroll
        lastScrollSelectedIdRef.current = null;
        return;
      }

      // Brief timeout to let the DOM update and render any new button elements
      const timer = setTimeout(() => {
        const isLatest = history.length > 0 && activeRoll.id === history[0].id;
        if (isLatest && containerRef.current) {
          containerRef.current.scrollTo({
            left: containerRef.current.scrollWidth,
            behavior: "smooth",
          });
        } else if (activeItemRef.current) {
          activeItemRef.current.scrollIntoView({
            behavior: "smooth",
            block: "nearest",
            inline: "center",
          });
        }
      }, 50);

      return () => clearTimeout(timer);
    }
  }, [activeRoll, history]);

  const handleScroll = () => {
    const container = containerRef.current;
    if (!container || history.length === 0) return;

    // Find closest to container center immediately on scroll frame
    const containerCenter = container.scrollLeft + container.clientWidth / 2;
    let closestRoll: RollObject | null = null;
    let minDistance = Infinity;

    const buttons = container.querySelectorAll("button");
    buttons.forEach((btn, idx) => {
      const btnCenter = btn.offsetLeft + btn.clientWidth / 2;
      const distance = Math.abs(btnCenter - containerCenter);
      if (distance < minDistance) {
        minDistance = distance;
        closestRoll = chronologicalHistory[idx];
      }
    });

    if (closestRoll && (closestRoll as RollObject).id !== visualActiveId) {
      setVisualActiveId((closestRoll as RollObject).id);
    }

    // Debounce the parent active roll update to prevent jitter or combatting layout
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    scrollTimeoutRef.current = window.setTimeout(() => {
      if (closestRoll && (closestRoll as RollObject).id !== activeRoll?.id) {
        lastScrollSelectedIdRef.current = (closestRoll as RollObject).id;
        onSelectRoll(closestRoll);
      }
    }, 150);
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    const ref = scrollTimeoutRef;
    return () => {
      if (ref.current) {
        clearTimeout(ref.current);
      }
    };
  }, []);

  if (history.length === 0) {
    return (
      <div className="h-16 flex items-center justify-center text-xs text-muted-foreground/60 italic border-b border-border/40 px-4">
        No rolls yet. Roll some dice below!
      </div>
    );
  }

  return (
    <div className="relative py-2">
      {/* Visual fading guides on the sides */}
      <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-background to-transparent pointer-events-none z-10" />
      <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-background to-transparent pointer-events-none z-10" />

      {/* Horizontal scrolling viewport with snap capability */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="flex gap-2 overflow-x-auto scrollbar-none px-[40%] py-1 flex-row items-center scroll-smooth snap-x snap-mandatory"
      >
        {chronologicalHistory.map((roll, idx) => {
          const isActive = visualActiveId === roll.id;

          // Calculate distance from latest (right-most index)
          const distanceFromLatest = chronologicalHistory.length - 1 - idx;

          // Determine fading opacity based on distance
          let opacityClass = "opacity-100";
          if (!isActive) {
            if (distanceFromLatest === 1) opacityClass = "opacity-80";
            else if (distanceFromLatest === 2) opacityClass = "opacity-60";
            else if (distanceFromLatest === 3) opacityClass = "opacity-40";
            else opacityClass = "opacity-25";
          }

          // Border and background based on advantageState
          let squareStyle: string;
          if (roll.advantageState === "advantage") {
            squareStyle = "border-2 border-emerald-500 bg-emerald-500/10 text-emerald-500 dark:text-emerald-450";
            if (isActive) {
              squareStyle += " ring-2 ring-emerald-500/20 scale-105 shadow-md shadow-emerald-500/10";
            }
          } else if (roll.advantageState === "disadvantage") {
            squareStyle = "border-2 border-red-500 bg-red-500/10 text-red-500 dark:text-red-450";
            if (isActive) {
              squareStyle += " ring-2 ring-red-500/20 scale-105 shadow-md shadow-red-500/10";
            }
          } else {
            // Straight/Normal roll
            if (isActive) {
              squareStyle = "border border-foreground bg-card text-foreground ring-1 ring-foreground/20 scale-105";
            } else {
              squareStyle = "border border-border/80 bg-muted/20 text-muted-foreground";
            }
          }

          return (
            <button
              type="button"
              key={roll.id}
              ref={isActive ? activeItemRef : null}
              onClick={() => {
                onSelectRoll(roll);
                onOpenSummary();
              }}
              className={`
                flex-shrink-0 size-9 rounded-md flex items-center justify-center snap-center
                font-mono font-bold text-xs select-none cursor-pointer transition-all duration-200
                ${squareStyle} ${opacityClass}
              `}
              title={roll.formula}
            >
              {roll.result}
            </button>
          );
        })}

        {/* Right side padding spacer to allow centering of the latest roll */}
        <div className="flex-shrink-0 w-8" />
      </div>
    </div>
  );
};
