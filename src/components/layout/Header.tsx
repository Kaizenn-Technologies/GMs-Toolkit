import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  activeTab: "hp" | "point-buy";
  setActiveTab: (tab: "hp" | "point-buy") => void;
  darkMode: boolean;
  toggleDarkMode: () => void;
}

export function Header({ activeTab, setActiveTab, darkMode, toggleDarkMode }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav className="flex items-center justify-between px-4 h-16 text-sm font-medium">
        {/* Left: Logo */}
        <div className="font-bold">
          D&D 5.5e Tools
        </div>

        {/* Center: Tabs */}
        <div className="flex items-center gap-6">
          <button
            onClick={() => setActiveTab("hp")}
            className={`transition-colors hover:text-foreground/80 ${activeTab === "hp" ? "text-foreground" : "text-foreground/60"
              }`}
          >
            HP Calculator
          </button>

          <button
            onClick={() => setActiveTab("point-buy")}
            className={`transition-colors hover:text-foreground/80 ${activeTab === "point-buy" ? "text-foreground" : "text-foreground/60"
              }`}
          >
            Stat Generator
          </button>
        </div>

        {/* Right: Theme Toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleDarkMode}
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
