import { Star } from "lucide-react";
import type { ReactNode } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { Ability } from "@/types";

interface StatGeneratorSelectorRowProps {
  classValue: string;
  onClassChange: (value: string) => void;
  classOptions: readonly string[];
  classPlaceholder?: string;
  backgroundValue: string;
  onBackgroundChange: (value: string) => void;
  backgroundOptions: readonly string[];
  featBonusEnabled: boolean;
  onFeatBonusChange: (checked: boolean) => void;
  primaryDisplay?: string;
}

export function StatGeneratorSelectorRow({
  classValue,
  onClassChange,
  classOptions,
  classPlaceholder,
  backgroundValue,
  onBackgroundChange,
  backgroundOptions,
  featBonusEnabled,
  onFeatBonusChange,
  primaryDisplay,
}: StatGeneratorSelectorRowProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-3 flex-wrap">
      <label className="text-sm font-semibold shrink-0 sm:w-28">
        Select Class:
      </label>
      <div className="flex-1 max-w-xs">
        <Select value={classValue} onValueChange={onClassChange}>
          <SelectTrigger>
            <SelectValue placeholder={classPlaceholder} />
          </SelectTrigger>
          <SelectContent>
            {classOptions.map((name) => (
              <SelectItem
                key={name}
                value={name}
                className={name === classPlaceholder ? "text-muted-foreground" : undefined}
              >
                {name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <label className="text-sm font-semibold shrink-0">
        Background:
      </label>
      <div className="flex-1 max-w-xs">
        <Select value={backgroundValue} onValueChange={onBackgroundChange}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {backgroundOptions.map((name) => (
              <SelectItem key={name} value={name}>
                {name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <TooltipProvider delay={100}>
          <Tooltip>
            <TooltipTrigger
              render={
                <span className="cursor-help border-b border-dashed border-muted-foreground">
                  Feat Bonus
                </span>
              }
            />
            <TooltipContent>
              <p>Manually add a bonus to ability scores granted by feats.</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <Switch
          size="sm"
          checked={featBonusEnabled}
          onCheckedChange={onFeatBonusChange}
          aria-label="Toggle feat bonus"
        />
      </div>

      {primaryDisplay ? (
        <p className="text-xs text-muted-foreground sm:ml-auto">
          Primary:{" "}
          <span className="font-semibold text-foreground">
            {primaryDisplay}
          </span>
        </p>
      ) : null}
    </div>
  );
}

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
    <td className="py-2 pl-3 pr-4 font-medium rounded-l-md">
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
      className={`inline-block w-10 text-center font-bold text-base ${highlight ? "text-amber-500" : ""}`}
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
    <span className={`inline-block w-10 text-center text-sm font-semibold ${className}`}>
      {value}
    </span>
  );
}
