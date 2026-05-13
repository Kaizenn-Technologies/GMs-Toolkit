import { Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function StepperInput({ value, onChange, min = -99, max = 99, className }: { value: number, onChange: (val: number) => void, min?: number, max?: number, className?: string }) {
  return (
    <div className={`flex items-center border rounded-md ${className || ""}`}>
      <Button variant="ghost" size="icon" className="h-9 w-9 shrink-0 rounded-r-none" onClick={() => onChange(Math.max(min, value - 1))}>
        <Minus className="h-4 w-4" />
      </Button>
      <Input
        type="number"
        value={value}
        onChange={(e) => {
          const val = parseInt(e.target.value);
          onChange(isNaN(val) ? 0 : Math.min(Math.max(val, min), max));
        }}
        className="h-9 w-full text-center border-0 focus-visible:ring-0 focus-visible:ring-offset-0 rounded-none px-1 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
      />
      <Button variant="ghost" size="icon" className="h-9 w-9 shrink-0 rounded-l-none" onClick={() => onChange(Math.min(max, value + 1))}>
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  )
}
