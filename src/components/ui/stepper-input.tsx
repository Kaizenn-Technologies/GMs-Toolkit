import { useState } from "react";
import { Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function StepperInput({
  value,
  onChange,
  min = -99,
  max = 99,
  className,
  id,
  "aria-label": ariaLabel
}: {
  value: number;
  onChange: (val: number) => void;
  min?: number;
  max?: number;
  className?: string;
  id?: string;
  "aria-label"?: string;
}) {
  const [isFocused, setIsFocused] = useState(false);
  const [prevValue, setPrevValue] = useState(value);
  const [direction, setDirection] = useState<"left" | "right" | null>(null);

  if (value !== prevValue) {
    setDirection(value > prevValue ? "right" : "left");
    setPrevValue(value);
  }

  return (
    <div className={`flex items-center border rounded-none overflow-hidden ${className || ""}`}>
      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes stepperSlideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes stepperSlideInLeft {
          from { transform: translateX(-100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        .animate-stepper-right {
          animation: stepperSlideInRight 0.22s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .animate-stepper-left {
          animation: stepperSlideInLeft 0.22s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}} />

      <Button
        variant="ghost"
        size="icon"
        className="h-full aspect-square shrink-0 rounded-none border-r cursor-pointer active:scale-95 transition-transform"
        onClick={() => onChange(Math.max(min, value - 1))}
        aria-label="Decrease value"
      >
        <Minus className="h-3 w-3" />
      </Button>

      <div className="relative h-full w-full min-w-[32px] overflow-hidden flex items-center justify-center">
        <div
          key={value}
          className={`absolute pointer-events-none select-none text-center text-xs ${direction === "right"
              ? "animate-stepper-right"
              : direction === "left"
                ? "animate-stepper-left"
                : ""
            }`}
        >
          {value}
        </div>

        <Input
          type="number"
          value={value}
          onChange={(e) => {
            const val = parseInt(e.target.value);
            onChange(isNaN(val) ? 0 : Math.min(Math.max(val, min), max));
          }}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          id={id}
          aria-label={ariaLabel}
          className={`h-full w-full text-center border-0 focus-visible:ring-0 focus-visible:ring-offset-0 rounded-none px-1 text-xs [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none transition-colors duration-200 ${isFocused ? "text-foreground bg-background" : "text-transparent bg-transparent"
            }`}
        />
      </div>

      <Button
        variant="ghost"
        size="icon"
        className="h-full aspect-square shrink-0 rounded-none border-l cursor-pointer active:scale-95 transition-transform"
        onClick={() => onChange(Math.min(max, value + 1))}
        aria-label="Increase value"
      >
        <Plus className="h-3 w-3" />
      </Button>
    </div>
  )
}
