import { cn } from "@/lib/utils";

interface SwitchProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  id?: string;
  className?: string;
  /**
   * Visual size variant. "sm" keeps the knob translation distance consistent
   * so the handle doesn't overshoot.
   */
  size?: "default" | "sm";
}

function Switch({
  checked,
  onCheckedChange,
  disabled,
  id,
  className,
  size = "default",
}: SwitchProps) {
  const isSm = size === "sm";

  const trackSize = isSm ? "h-5 w-9" : "h-6 w-11";
  const knobSize = isSm ? "h-4 w-4" : "h-5 w-5";
  const knobTranslate = isSm ? "translate-x-4" : "translate-x-5";

  return (
    <button
      id={id}
      role="switch"
      type="button"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => !disabled && onCheckedChange(!checked)}
      className={cn(
        "relative inline-flex shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200",
        trackSize,
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        "disabled:cursor-not-allowed disabled:opacity-50",
        checked ? "bg-primary" : "bg-input",
        className,
      )}
    >
      <span
        className={cn(
          "pointer-events-none block rounded-full bg-background shadow-lg ring-0 transition-transform duration-200",
          knobSize,
          checked ? knobTranslate : "translate-x-0",
        )}
      />
    </button>
  );
}

export { Switch };
