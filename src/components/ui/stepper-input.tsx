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
  return (
    <div className={`flex items-center border rounded-md overflow-hidden ${className || ""}`}>
      <Button 
        variant="ghost" 
        size="icon" 
        className="h-full aspect-square shrink-0 rounded-none border-r" 
        onClick={() => onChange(Math.max(min, value - 1))}
        aria-label="Decrease value"
      >
        <Minus className="h-3 w-3" />
      </Button>
      <Input
        type="number"
        value={value}
        onChange={(e) => {
          const val = parseInt(e.target.value);
          onChange(isNaN(val) ? 0 : Math.min(Math.max(val, min), max));
        }}
        id={id}
        aria-label={ariaLabel}
        className="h-full w-full text-center border-0 focus-visible:ring-0 focus-visible:ring-offset-0 rounded-none px-1 text-xs [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
      />
      <Button 
        variant="ghost" 
        size="icon" 
        className="h-full aspect-square shrink-0 rounded-none border-l" 
        onClick={() => onChange(Math.min(max, value + 1))}
        aria-label="Increase value"
      >
        <Plus className="h-3 w-3" />
      </Button>
    </div>
  )
}
