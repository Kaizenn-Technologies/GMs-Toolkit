import { Star } from "lucide-react";
import type { ReactNode } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { Ability } from "@/types";

interface AbilityNameCellProps {
  ability: Ability;
  abilityAbbreviation: string;
  isPrimary: boolean;
  primaryTooltip: string;
}

export function AbilityNameCell({
  ability,
  abilityAbbreviation,
  isPrimary,
  primaryTooltip,
}: AbilityNameCellProps) {
  return (
    <td className="py-3 pl-4 pr-6 font-medium rounded-none">
      <div className="flex items-center gap-1.5">
        <span className="hidden sm:inline">{ability}</span>
        <span className="sm:hidden text-xs font-bold">{abilityAbbreviation}</span>
        {isPrimary ? (
          <TooltipProvider delay={100}>
            <Tooltip>
              <TooltipTrigger
                render={
                  <span className="cursor-help">
                    <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                  </span>
                }
              />
              <TooltipContent>
                <p>{primaryTooltip}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : null}
      </div>
    </td>
  );
}

export function CenteredCellContent({ children }: { children: ReactNode }) {
  return <div className="flex justify-center">{children}</div>;
}

export function TotalScoreDisplay({
  value,
  highlight = false,
}: {
  value: number | string;
  highlight?: boolean;
}) {
  return (
    <span
      className={`inline-block w-12 text-center font-bold text-lg tabular-nums ${highlight ? "text-amber-500" : "text-foreground"}`}
    >
      {value}
    </span>
  );
}

export function ModifierDisplay({
  value,
  className,
}: {
  value: string;
  className: string;
}) {
  return (
    <span className={`inline-block w-12 text-center text-base font-bold tabular-nums ${className}`}>
      {value}
    </span>
  );
}

export function PoolStatus({
  label,
  value,
  max,
  valueClassName,
}: {
  label: string;
  value: number;
  max: number;
  valueClassName: string;
}) {
  return (
    <div className="flex items-center gap-2 bg-muted/40 px-3 py-1.5 rounded-none border border-border/50 shadow-sm">
      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{label}</span>
      <div className="flex items-center font-bold tabular-nums">
        <span className={valueClassName}>{value}</span>
        <span className="text-muted-foreground/60 mx-0.5">/</span>
        <span className="text-muted-foreground">{max}</span>
      </div>
    </div>
  );
}
