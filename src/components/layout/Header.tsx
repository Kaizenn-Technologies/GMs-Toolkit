import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  activeTab: "hp" | "point-buy" | "dice-roller";
  setActiveTab: (tab: "hp" | "point-buy" | "dice-roller") => void;
  darkMode: boolean;
  toggleDarkMode: () => void;
}

export function Header({ activeTab, setActiveTab, darkMode, toggleDarkMode }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav className="flex items-center justify-between px-3 sm:px-4 h-12 sm:h-14 text-sm font-medium gap-2">
        {/* Left: Logo */}
        <div className="font-bold shrink-0 text-sm sm:text-base">
          <span className="hidden sm:inline">D&D 5.5e Tools</span>
          <span className="sm:hidden">D&D</span>
        </div>

        {/* Center: Tabs */}
        <div className="flex items-center gap-3 sm:gap-6">
          <button
            onClick={() => setActiveTab("hp")}
            className={`transition-colors hover:text-foreground/80 whitespace-nowrap text-xs sm:text-sm ${
              activeTab === "hp" ? "text-foreground" : "text-foreground/60"
            }`}
          >
            <span className="hidden sm:inline">HP Calculator</span>
            <span className="sm:hidden">HP Calc</span>
          </button>

          <button
            onClick={() => setActiveTab("point-buy")}
            className={`transition-colors hover:text-foreground/80 whitespace-nowrap text-xs sm:text-sm ${
              activeTab === "point-buy" ? "text-foreground" : "text-foreground/60"
            }`}
          >
            <span className="hidden sm:inline">Stat Generator</span>
            <span className="sm:hidden">Stats</span>
          </button>

          <button
            onClick={() => setActiveTab("dice-roller")}
            className={`transition-colors hover:text-foreground/80 whitespace-nowrap text-xs sm:text-sm ${
              activeTab === "dice-roller" ? "text-foreground" : "text-foreground/60"
            }`}
          >
            <span className="hidden sm:inline">DM Dice Roller</span>
            <span className="sm:hidden">Dice</span>
          </button>
        </div>

        {/* Right: Theme Toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleDarkMode}
          className="shrink-0 h-8 w-8 sm:h-9 sm:w-9"
        >
          {darkMode ? (
            <Sun className="w-4 h-4" />
          ) : (
            <Moon className="w-4 h-4" />
          )}
        </Button>
      </nav>
    </header>
  );
}
