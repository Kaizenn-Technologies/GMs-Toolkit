import type { ReactNode } from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import type { BreakdownItem } from "@/types";

interface HpTotalDisplayProps {
  total: number;
  valueClassName?: string;
  tooltip?: string;
  icon?: ReactNode;
}

export function HpTotalDisplay({
  total,
  valueClassName,
  tooltip,
  icon,
}: HpTotalDisplayProps) {
  const value = (
    <div className={`text-5xl font-bold mb-2 ${valueClassName ?? ""}`.trim()}>
      {icon ? <div className="relative">{total}{icon}</div> : total}
    </div>
  );

  return (
    <div className="p-2 pb-0">
      <div className="text-center">
        {tooltip ? (
          <TooltipProvider delay={100}>
            <Tooltip>
              <TooltipTrigger
                render={
                  <div className="flex justify-center cursor-help">
                    {value}
                  </div>
                }
              />
              <TooltipContent>
                <p>{tooltip}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : (
          value
        )}
        <div className="text-sm text-muted-foreground font-medium">
          Total HP
        </div>
      </div>
    </div>
  );
}

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
