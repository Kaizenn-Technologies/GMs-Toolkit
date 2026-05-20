import { Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSettings } from "@/contexts/SettingsContext";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";

interface HeaderProps {
  activeTab: "hp" | "point-buy" | "dice-roller" | "landing";
  setActiveTab: (tab: "hp" | "point-buy" | "dice-roller" | "landing") => void;
}

export function Header({ activeTab, setActiveTab }: HeaderProps) {
  const { settings, openSettings } = useSettings();
  const isDarkMode = settings.sitewide.darkMode;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav className="flex items-center h-12 sm:h-14 px-3 sm:px-4 text-sm font-medium">
        {/* Left: Logo (takes 1/3 of space or matches right) */}
        <div className="flex-1 flex items-center">
          <div
            className="flex items-center gap-2 shrink-0 cursor-pointer transition-opacity hover:opacity-80"
            onClick={() => setActiveTab("landing")}
          >
            <img
              src={isDarkMode ? "/gm-toolkit-logo-white.svg" : "/gm-toolkit-logo-black.svg"}
              alt="GM's Toolkit Logo"
              className="h-7 w-auto sm:h-8"
            />
            <span className="font-bold text-sm sm:text-base hidden lg:inline tracking-tight">
              GM's Toolkit
            </span>
            <TooltipProvider delay={100}>
              <Tooltip>
                <TooltipTrigger
                  render={
                    <span className="text-xs font-semibold text-muted-foreground border border-muted-foreground rounded px-1 cursor-help">
                      BETA
                    </span>
                  }
                />
                <TooltipContent className="font-semibold text-muted py-1 px-2" side="right">
                  Public BETA v0.7.1
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        {/* Center: Tabs (True center) */}
        <div className="flex items-center gap-3 sm:gap-6 shrink-0">
          <button
            onClick={() => setActiveTab("hp")}
            className={`transition-colors hover:text-foreground/80 whitespace-nowrap text-xs sm:text-sm ${activeTab === "hp" ? "text-foreground" : "text-foreground/60"
              }`}
          >
            <span className="hidden sm:inline">HP Calculator</span>
            <span className="sm:hidden">HP Calc</span>
          </button>

          <button
            onClick={() => setActiveTab("point-buy")}
            className={`transition-colors hover:text-foreground/80 whitespace-nowrap text-xs sm:text-sm ${activeTab === "point-buy" ? "text-foreground" : "text-foreground/60"
              }`}
          >
            <span className="hidden sm:inline">Stat Generator</span>
            <span className="sm:hidden">Stats Gen</span>
          </button>

          <button
            onClick={() => setActiveTab("dice-roller")}
            className={`transition-colors hover:text-foreground/80 whitespace-nowrap text-xs sm:text-sm ${activeTab === "dice-roller" ? "text-foreground" : "text-foreground/60"
              }`}
          >
            <span className="hidden sm:inline">DM Dice Roller</span>
            <span className="sm:hidden">Dice Roller</span>
          </button>
        </div>

        {/* Right: Settings Toggle (takes 1/3 of space or matches left) */}
        <div className="flex-1 flex justify-end">
          <Button
            variant="ghost"
            size="icon"
            onClick={openSettings}
            className="shrink-0 h-8 w-8 sm:h-9 sm:w-9"
            aria-label="Open settings"
          >
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </nav>
    </header>
  );
}
