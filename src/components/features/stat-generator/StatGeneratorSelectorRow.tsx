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

interface StatGeneratorSelectorRowProps {
  classValue: string;
  onClassChange: (value: string | null) => void;
  classOptions: readonly string[];
  classPlaceholder?: string;
  backgroundValue: string;
  onBackgroundChange: (value: string | null) => void;
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
