import { useState, useEffect, useRef } from "react";
import { Settings, Menu, X, Calculator, Users, Dices, ChevronRight } from "lucide-react";
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
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [sliderStyle, setSliderStyle] = useState({ left: 0, width: 0, opacity: 0 });

  const containerRef = useRef<HTMLDivElement>(null);
  const hpRef = useRef<HTMLButtonElement>(null);
  const pointBuyRef = useRef<HTMLButtonElement>(null);
  const diceRollerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMenuOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const updateSlider = () => {
      let activeRef: React.RefObject<HTMLButtonElement | null> | null = null;
      if (activeTab === "hp") activeRef = hpRef;
      else if (activeTab === "point-buy") activeRef = pointBuyRef;
      else if (activeTab === "dice-roller") activeRef = diceRollerRef;

      if (activeRef && activeRef.current && containerRef.current) {
        const btn = activeRef.current;
        const container = containerRef.current;
        const rect = btn.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();

        setSliderStyle({
          left: rect.left - containerRect.left,
          width: rect.width,
          opacity: 1,
        });
      } else {
        setSliderStyle((prev) => ({ ...prev, opacity: 0 }));
      }
    };

    updateSlider();
    const timer = setTimeout(updateSlider, 50);

    window.addEventListener("resize", updateSlider);
    return () => {
      window.removeEventListener("resize", updateSlider);
      clearTimeout(timer);
    };
  }, [activeTab]);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav className="flex items-center h-12 sm:h-14 px-3 sm:px-4 text-sm font-medium">
        {/* Left: Logo (takes 1/3 of space or matches right) */}
        <div className="flex-1 flex items-center">
          <div
            className="flex items-center gap-2 shrink-0 cursor-pointer transition-opacity hover:opacity-80"
            onClick={() => {
              setActiveTab("landing");
              setIsMenuOpen(false);
            }}
          >
            <img
              src={isDarkMode ? "/gm-toolkit-logo-white.svg" : "/gm-toolkit-logo-black.svg"}
              alt="GM's Toolkit Logo"
              className="h-7 w-auto sm:h-8"
              width={32}
              height={32}
            />
            <span className="font-bold text-sm sm:text-base hidden min-[380px]:inline tracking-tight">
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
                  Public BETA v{import.meta.env.APP_VERSION}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        {/* Center: Tabs (True center on desktop, hidden on mobile) */}
        <div
          ref={containerRef}
          className="hidden md:flex items-center gap-1 p-1 shrink-0 relative rounded-none select-none"
        >
          {/* Animated Slider Highlight Box */}
          <div
            className="absolute top-1 bottom-1 bg-muted shadow-sm border border-border/30 transition-all duration-300 ease-out rounded-none -z-10"
            style={{
              left: `${sliderStyle.left}px`,
              width: `${sliderStyle.width}px`,
              opacity: sliderStyle.opacity,
              transitionProperty: "left, width, opacity",
            }}
          />

          <button
            ref={hpRef}
            onClick={() => setActiveTab("hp")}
            className={`px-3 py-1 border transition-all duration-200 text-xs font-bold tracking-tight rounded-none cursor-pointer select-none relative z-10 ${activeTab === "hp"
                ? "border-transparent text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
          >
            HP Calculator
          </button>

          <button
            ref={pointBuyRef}
            onClick={() => setActiveTab("point-buy")}
            className={`px-3 py-1 border transition-all duration-200 text-xs font-bold tracking-tight rounded-none cursor-pointer select-none relative z-10 ${activeTab === "point-buy"
                ? "border-transparent text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
          >
            Ability Score
          </button>

          <button
            ref={diceRollerRef}
            onClick={() => setActiveTab("dice-roller")}
            className={`px-3 py-1 border transition-all duration-200 text-xs font-bold tracking-tight rounded-none cursor-pointer select-none relative z-10 ${activeTab === "dice-roller"
                ? "border-transparent text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
          >
            DM Dice Roller
          </button>
        </div>

        {/* Right: Settings Toggle & Hamburger Button */}
        <div className="flex-1 flex justify-end items-center gap-1">
          {/* GitHub Repository Link (Desktop only) */}
          <a
            href="https://github.com/Kaizenn-Technologies/GMs-Toolkit"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden md:inline-flex items-center justify-center shrink-0 h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors duration-200 cursor-pointer"
            aria-label="GitHub Repository"
            title="View GitHub Source"
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 16 16">
              <path fillRule="evenodd" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8z" />
            </svg>
          </a>

          {/* Discord Server Link (Desktop only) */}
          <a
            href="https://discord.gg/nBzSVyHfMy"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden md:inline-flex items-center justify-center shrink-0 h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors duration-200 cursor-pointer"
            aria-label="Discord Server Invite"
            title="Join Discord Server"
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 127.14 96.36">
              <path d="M107.7,8.07A105.15,105.15,0,0,0,77.26,0a77.19,77.19,0,0,0-3.3,6.83A96.67,96.67,0,0,0,53.22,6.83,77.19,77.19,0,0,0,49.88,0,105.15,105.15,0,0,0,19.44,8.07C3.66,31.58-1.86,54.65,1,77.53A105.73,105.73,0,0,0,32,96.36a77.7,77.7,0,0,0,6.63-10.85,68.43,68.43,0,0,1-10.45-5c1-.73,2-1.5,2.92-2.3a75.46,75.46,0,0,0,64.8,0c.93.8,1.93,1.57,2.92,2.3a68.43,68.43,0,0,1-10.45,5,77.7,77.7,0,0,0,6.63,10.85,105.73,105.73,0,0,0,31-18.83C129.58,49.27,123.63,26.5,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53S36.18,40.36,42.45,40.36,53.83,46,53.83,53,48.72,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.24,60,73.24,53S78.41,40.36,84.69,40.36,96.07,46,96.07,53,91,65.69,84.69,65.69Z" />
            </svg>
          </a>

          <Button
            variant="ghost"
            size="icon"
            onClick={openSettings}
            className="shrink-0 h-8 w-8 sm:h-9 sm:w-9"
            aria-label="Open settings"
          >
            <Settings className="w-4 h-4" />
          </Button>

          {/* Hamburger (Mobile only) */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden shrink-0 h-8 w-8 active:scale-90 transition-all duration-200"
            aria-label="Toggle navigation menu"
          >
            {isMenuOpen ? (
              <X className="w-4 h-4 text-foreground transition-all duration-200 rotate-90" />
            ) : (
              <Menu className="w-4 h-4 text-foreground transition-all duration-200" />
            )}
          </Button>
        </div>
      </nav>

      {/* Slide-Down Mobile Menu Dropdown */}
      <div
        className={`absolute top-full left-0 w-full border-b border-border bg-background/98 backdrop-blur-xl transition-all duration-300 ease-in-out origin-top md:hidden ${isMenuOpen
          ? "opacity-100 translate-y-0 pointer-events-auto"
          : "opacity-0 -translate-y-2 pointer-events-none"
          }`}
      >
        <div className="px-3 py-2.5 space-y-2.5 max-h-[85vh] overflow-y-auto">
          {/* Section Title */}
          <div className="flex items-center justify-between text-[14px] font-bold uppercase tracking-widest text-muted-foreground/60 px-1">
            <span>Navigation</span>
            <div className="flex-1 mx-2 pt-1 border-b border-dashed border-muted-foreground/40 self-center" />
            <span className="text-[12px] px-1.5 py-0.5 font-mono font-semibold">
              v{import.meta.env.APP_VERSION}
            </span>
          </div>

          {/* Navigation Items */}
          <div className="grid grid-cols-1 gap-1.5">
            {/* HP Calculator */}
            <button
              onClick={() => {
                setActiveTab("hp");
                setIsMenuOpen(false);
              }}
              className={`group flex items-center gap-2.5 py-1.5 px-2 rounded-none border text-left transition-all duration-200 cursor-pointer ${activeTab === "hp"
                ? "border-primary bg-primary/5 dark:bg-primary/10"
                : "border-border/60 hover:border-border hover:bg-muted/30"
                }`}
            >
              <div className={`p-1.5 rounded-none border shrink-0 transition-colors duration-200 ${activeTab === "hp"
                ? "bg-primary/10 border-primary text-primary"
                : "bg-muted border-border text-muted-foreground group-hover:text-primary group-hover:bg-primary/5 group-hover:border-primary/20"
                }`}>
                <Calculator className="w-3.5 h-3.5" />
              </div>
              <div className="flex-1 flex items-center gap-1.5 min-w-0">
                <span className={`text-xs font-bold tracking-tight transition-colors duration-200 ${activeTab === "hp" ? "text-primary" : "text-foreground"
                  }`}>
                  HP Calculator
                </span>
                {activeTab === "hp" && (
                  <span className="w-1.5 h-1.5 rounded-none bg-primary animate-pulse" />
                )}
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/40 shrink-0 group-hover:text-primary group-hover:translate-x-0.5 transition-all duration-200" />
            </button>

            {/* Ability Score */}
            <button
              onClick={() => {
                setActiveTab("point-buy");
                setIsMenuOpen(false);
              }}
              className={`group flex items-center gap-2.5 py-1.5 px-2 rounded-none border text-left transition-all duration-200 cursor-pointer ${activeTab === "point-buy"
                ? "border-primary bg-primary/5 dark:bg-primary/10"
                : "border-border/60 hover:border-border hover:bg-muted/30"
                }`}
            >
              <div className={`p-1.5 rounded-none border shrink-0 transition-colors duration-200 ${activeTab === "point-buy"
                ? "bg-primary/10 border-primary text-primary"
                : "bg-muted border-border text-muted-foreground group-hover:text-primary group-hover:bg-primary/5 group-hover:border-primary/20"
                }`}>
                <Users className="w-3.5 h-3.5" />
              </div>
              <div className="flex-1 flex items-center gap-1.5 min-w-0">
                <span className={`text-xs font-bold tracking-tight transition-colors duration-200 ${activeTab === "point-buy" ? "text-primary" : "text-foreground"
                  }`}>
                  Ability Score Generator
                </span>
                {activeTab === "point-buy" && (
                  <span className="w-1.5 h-1.5 rounded-none bg-primary animate-pulse" />
                )}
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/40 shrink-0 group-hover:text-primary group-hover:translate-x-0.5 transition-all duration-200" />
            </button>

            {/* DM Dice Roller */}
            <button
              onClick={() => {
                setActiveTab("dice-roller");
                setIsMenuOpen(false);
              }}
              className={`group flex items-center gap-2.5 py-1.5 px-2 rounded-none border text-left transition-all duration-200 cursor-pointer ${activeTab === "dice-roller"
                ? "border-primary bg-primary/5 dark:bg-primary/10"
                : "border-border/60 hover:border-border hover:bg-muted/30"
                }`}
            >
              <div className={`p-1.5 rounded-none border shrink-0 transition-colors duration-200 ${activeTab === "dice-roller"
                ? "bg-primary/10 border-primary text-primary"
                : "bg-muted border-border text-muted-foreground group-hover:text-primary group-hover:bg-primary/5 group-hover:border-primary/20"
                }`}>
                <Dices className="w-3.5 h-3.5" />
              </div>
              <div className="flex-1 flex items-center gap-1.5 min-w-0">
                <span className={`text-xs font-bold tracking-tight transition-colors duration-200 ${activeTab === "dice-roller" ? "text-primary" : "text-foreground"
                  }`}>
                  DM Dice Roller
                </span>
                {activeTab === "dice-roller" && (
                  <span className="w-1.5 h-1.5 rounded-none bg-primary animate-pulse" />
                )}
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/40 shrink-0 group-hover:text-primary group-hover:translate-x-0.5 transition-all duration-200" />
            </button>
          </div>

          {/* Drawer Footer */}
          <div className="pt-2 border-t border-border/40 flex items-center justify-between text-[9px] text-muted-foreground/60 font-sans">
            <div className="flex items-center gap-1.5">
              <img
                src={isDarkMode ? "/gm-toolkit-logo-white.svg" : "/gm-toolkit-logo-black.svg"}
                alt="GM Logo"
                className="h-3.5 w-auto opacity-50"
              />
              <span className="font-semibold font-mono tracking-tight">GM'S TOOLKIT</span>
            </div>

            {/* Social Links Invite (Mobile drawer center) */}
            <div className="flex items-center gap-1.5">
              <a
                href="https://discord.gg/nBzSVyHfMy"
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 rounded-none border border-transparent hover:border-border hover:bg-muted/40 text-muted-foreground hover:text-foreground transition-all duration-200 cursor-pointer"
                aria-label="Discord Server invite"
                title="Join Discord Server"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 127.14 96.36">
                  <path d="M107.7,8.07A105.15,105.15,0,0,0,77.26,0a77.19,77.19,0,0,0-3.3,6.83A96.67,96.67,0,0,0,53.22,6.83,77.19,77.19,0,0,0,49.88,0,105.15,105.15,0,0,0,19.44,8.07C3.66,31.58-1.86,54.65,1,77.53A105.73,105.73,0,0,0,32,96.36a77.7,77.7,0,0,0,6.63-10.85,68.43,68.43,0,0,1-10.45-5c1-.73,2-1.5,2.92-2.3a75.46,75.46,0,0,0,64.8,0c.93.8,1.93,1.57,2.92,2.3a68.43,68.43,0,0,1-10.45,5,77.7,77.7,0,0,0,6.63,10.85,105.73,105.73,0,0,0,31-18.83C129.58,49.27,123.63,26.5,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53S36.18,40.36,42.45,40.36,53.83,46,53.83,53,48.72,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.24,60,73.24,53S78.41,40.36,84.69,40.36,96.07,46,96.07,53,91,65.69,84.69,65.69Z" />
                </svg>
              </a>
              <a
                href="https://github.com/Kaizenn-Technologies/GMs-Toolkit"
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 rounded-none border border-transparent hover:border-border hover:bg-muted/40 text-muted-foreground hover:text-foreground transition-all duration-200 cursor-pointer"
                aria-label="GitHub Repository"
                title="View GitHub Repository"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 16 16">
                  <path fillRule="evenodd" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8z" />
                </svg>
              </a>
            </div>

            {/* <span className="italic hidden min-[400px]:inline">Crafted for Dungeon Masters</span> */}
          </div>
        </div>
      </div>
    </header>
  );
}
