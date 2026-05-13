import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import type { BreakdownItem } from "@/types";

export function HpBreakdown({ items }: { items: BreakdownItem[] }) {
  return (
    <div>
      <div className="text-xs font-semibold text-muted-foreground mb-3">
        Breakdown:
      </div>
      <div className="text-xs font-mono bg-muted p-3 space-y-1">
        <TooltipProvider delay={100}>
          {items.map((item, idx) => (
            <div key={idx} className="flex flex-col lg:flex-row">
              <span className="pr-2 flex-shrink-0">{item.label}:</span>
              <Tooltip>
                <TooltipTrigger className="cursor-help hover:text-foreground text-muted-foreground transition-colors text-left border-b border-dashed border-muted-foreground/50">
                  {item.value}
                </TooltipTrigger>
                <TooltipContent>
                  <p>{item.tooltip}</p>
                </TooltipContent>
              </Tooltip>
            </div>
          ))}
        </TooltipProvider>
      </div>
    </div>
  );
}
