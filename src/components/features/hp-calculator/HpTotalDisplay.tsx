import type { ReactNode } from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

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
