import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";

export interface SkillDropdownProps {
  state: "none" | "prof" | "expertise";
  isBard: boolean;
  isSkill: boolean;
  onChange: (state: "none" | "prof" | "expertise") => void;
  openUpward?: boolean;
  classColor?: string;
}

export function SkillDropdown({ state, isBard, isSkill, onChange, openUpward, classColor }: SkillDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [coords, setCoords] = useState<{ top: number; left: number; width: number; height: number } | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        dropdownRef.current && !dropdownRef.current.contains(target) &&
        !target.closest(".skill-dropdown-portal")
      ) {
        setIsOpen(false);
      }
    };

    const handleScroll = () => {
      setIsOpen(false);
    };

    document.addEventListener("mousedown", handleOutsideClick);
    window.addEventListener("scroll", handleScroll, { capture: true, passive: true });

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      window.removeEventListener("scroll", handleScroll, { capture: true });
    };
  }, [isOpen]);

  const handleToggle = () => {
    if (!isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setCoords({
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
      });
    }
    setIsOpen(!isOpen);
  };

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      <button
        ref={buttonRef}
        type="button"
        onClick={handleToggle}
        className="flex items-center justify-center size-6 rounded hover:bg-muted/80 focus:outline-none transition-colors"
        title={`Change Proficiency (Current: ${state === "none" ? (isSkill && isBard ? "Jack of All Trades" : "None") : state === "prof" ? "Proficient" : "Expertise"})`}
        aria-label={`Change Proficiency (Current: ${state === "none" ? (isSkill && isBard ? "Jack of All Trades" : "None") : state === "prof" ? "Proficient" : "Expertise"})`}
      >
        <SkillIcon state={state} interactive={true} isSkill={isSkill} isBard={isBard} classColor={classColor} />
      </button>

      {isOpen && coords && createPortal(
        <div
          className="fixed z-[9999] w-44 rounded-md border border-border bg-popover p-1 shadow-md animate-in fade-in duration-150 skill-dropdown-portal"
          style={{
            left: `${coords.left}px`,
            top: openUpward ? `${coords.top - 4}px` : `${coords.top + coords.height + 4}px`,
            transform: openUpward ? "translateY(-100%)" : "none",
          }}
        >
          <button
            type="button"
            onClick={() => {
              onChange("none");
              setIsOpen(false);
            }}
            className="flex items-center gap-2 w-full px-2 py-1.5 text-xs text-left hover:bg-muted rounded transition-colors text-foreground"
          >
            <SkillIcon state="none" interactive={false} isSkill={isSkill} isBard={isBard} classColor={classColor} />
            <span>No Proficiency {isSkill && isBard && <span className="text-[10px] text-muted-foreground">(JoAT)</span>}</span>
          </button>
          <button
            type="button"
            onClick={() => {
              onChange("prof");
              setIsOpen(false);
            }}
            className="flex items-center gap-2 w-full px-2 py-1.5 text-xs text-left hover:bg-muted rounded transition-colors text-foreground"
          >
            <SkillIcon state="prof" interactive={false} isSkill={isSkill} isBard={isBard} classColor={classColor} />
            <span>Proficiency (+PROF)</span>
          </button>
          {isSkill && (
            <button
              type="button"
              onClick={() => {
                onChange("expertise");
                setIsOpen(false);
              }}
              className="flex items-center gap-2 w-full px-2 py-1.5 text-xs text-left hover:bg-muted rounded transition-colors text-foreground"
            >
              <SkillIcon state="expertise" interactive={false} isSkill={isSkill} isBard={isBard} classColor={classColor} />
              <span>Expertise (+ 2x PROF)</span>
            </button>
          )}
        </div>,
        document.body
      )}
    </div>
  );
}

function SkillIcon({
  state,
  interactive = true,
  isSkill,
  isBard,
  classColor,
}: {
  state: "none" | "prof" | "expertise";
  interactive?: boolean;
  isSkill?: boolean;
  isBard?: boolean;
  classColor?: string;
}) {
  const baseClass = `size-4 cursor-pointer shrink-0 transition-transform ${interactive ? "hover:scale-110 active:scale-95" : ""}`;
  if (state === "expertise") {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        className={`${baseClass} text-amber-500 fill-amber-500 drop-shadow-[0_0_2px_rgba(245,158,11,0.3)]`}
      >
        <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.434c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.434 2.082-5.005Z" clipRule="evenodd" />
      </svg>
    );
  }
  if (state === "prof") {
    return (
      <div
        className={`${baseClass} rounded-full bg-white border-2 border-muted-foreground/30 shadow-sm flex items-center justify-center`}
        style={classColor ? { backgroundColor: classColor, borderColor: classColor } : undefined}
      />
    );
  }
  if (isSkill && isBard) {
    return (
      <div className={`${baseClass} rounded-full border-2 border-muted-foreground/50 hover:border-foreground flex items-center justify-center`}>
        <div className="size-1.5 rounded-full bg-muted-foreground/80" />
      </div>
    );
  }
  return (
    <div className={`${baseClass} rounded-full border-2 border-muted-foreground/40 hover:border-foreground`} />
  );
}
