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
    <div className="bg-muted/30 border border-border/50 rounded-none p-4 mb-6 shadow-sm">
      <div className="flex flex-col lg:flex-row lg:items-center gap-4 lg:gap-8">
        {/* Class Selection */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 lg:gap-3 flex-1">
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground shrink-0 sm:w-24 lg:w-auto">
            Class
          </label>
          <div className="flex-1 max-w-sm">
            <Select value={classValue} onValueChange={onClassChange}>
              <SelectTrigger className="bg-background/50 hover:bg-background transition-colors">
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
        </div>

        {/* Background Selection */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 lg:gap-3 flex-1">
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground shrink-0 sm:w-24 lg:w-auto">
            Background
          </label>
          <div className="flex-1 max-w-sm">
            <Select value={backgroundValue} onValueChange={onBackgroundChange}>
              <SelectTrigger className="bg-background/50 hover:bg-background transition-colors">
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
        </div>

        {/* Settings & Primary Info */}
        <div className="flex items-center justify-between lg:justify-start gap-6 pt-2 lg:pt-0 border-t lg:border-t-0 border-border/30">
          <div className="flex items-center gap-3 bg-background/40 px-3 py-1.5 rounded-none border border-border/40">
            <TooltipProvider delay={100}>
              <Tooltip>
                <TooltipTrigger
                  render={
                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground cursor-help border-b border-dashed border-muted-foreground/50">
                      Feats
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
            <div className="flex flex-col items-end lg:items-start">
              <span className="text-[10px] font-bold uppercase tracking-tight text-muted-foreground">Primary Stats</span>
              <span className="text-sm font-semibold text-foreground">
                {primaryDisplay}
              </span>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
