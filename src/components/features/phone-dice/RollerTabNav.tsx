import React from "react";
import { Dices, History } from "lucide-react";

interface RollerTabNavProps {
  activeTab: "roller" | "history";
  setActiveTab: (tab: "roller" | "history") => void;
}

export const RollerTabNav: React.FC<RollerTabNavProps> = ({
  activeTab,
  setActiveTab,
}) => {
  return (
    <div className="px-4 pt-2.5 pb-1 border-b border-border/30 shrink-0 bg-card">
      <div className="flex p-0.5 bg-muted rounded-xl border border-border/60">
        <button
          type="button"
          onClick={() => setActiveTab("roller")}
          className={`
            flex-1 py-1.5 text-xs font-bold rounded-lg cursor-pointer select-none
            flex items-center justify-center gap-1.5 transition-all duration-300
            ${activeTab === "roller" 
              ? "bg-card text-foreground border border-border/40 shadow-sm" 
              : "text-muted-foreground hover:text-foreground bg-transparent border border-transparent"}
          `}
        >
          <Dices className="size-3.5" />
          <span>Roller</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("history")}
          className={`
            flex-1 py-1.5 text-xs font-bold rounded-lg cursor-pointer select-none
            flex items-center justify-center gap-1.5 transition-all duration-300
            ${activeTab === "history" 
              ? "bg-card text-foreground border border-border/40 shadow-sm" 
              : "text-muted-foreground hover:text-foreground bg-transparent border border-transparent"}
          `}
        >
          <History className="size-3.5" />
          <span>Full History</span>
        </button>
      </div>
    </div>
  );
};
