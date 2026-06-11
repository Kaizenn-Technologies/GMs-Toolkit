import React from "react";
import { BookOpen, Sparkles, Shield, AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  BADGE_VARIANTS,
  FEATS_PROGRESSION,
  MAGIC_ITEMS_PROGRESSION,
} from "@/lib/progression-data";

export function RarityBadge({ rarityKey }: { rarityKey: string }) {
  const config = BADGE_VARIANTS[rarityKey];
  if (!config) return null;

  if (config.isGradient) {
    return (
      <span className="inline-block p-[1px] rounded bg-gradient-to-r from-red-500 via-green-400 via-blue-500 to-purple-500 shadow-[0_0_6px_rgba(239,68,68,0.15)] shrink-0">
        <span className="block bg-card dark:bg-muted/90 rounded-[3px] px-1 py-0.2 flex items-center justify-center">
          <span className="text-[10px] font-bold uppercase tracking-wider text-foreground">
            {config.label}
          </span>
        </span>
      </span>
    );
  }

  return (
    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${config.className}`}>
      {config.label}
    </span>
  );
}

export const ProgressionReferencePanel: React.FC = () => {
  return (
    <Card className="border-border bg-card/45 backdrop-blur-sm">
      <CardContent className="">
        <div className="flex items-center gap-2 mb-4">
          <BookOpen className="size-5 text-primary/80" />
          <h2 className="text-sm font-bold uppercase tracking-wider text-foreground">
            Progression &amp; Gear Reference
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              <Sparkles className="size-4 text-amber-500/80" />
              <span>Feats &amp; Ability Score Increases</span>
            </div>

            <div className="flex flex-col gap-1.5">
              {FEATS_PROGRESSION.map((item) => (
                <div
                  key={item.id}
                  className="bg-muted/10 border border-border/40 rounded-lg p-3 hover:bg-muted/20 transition-all group"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                    <span className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors">
                      {item.name}
                    </span>
                    {item.rarityKey && <RarityBadge rarityKey={item.rarityKey} />}
                  </div>
                  <p
                    className="text-xs text-muted-foreground leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: item.description }}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Magical Items Section */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                <Shield className="size-4 text-blue-500/80" />
                <span>Stat-Enhancing Magic Items</span>
              </div>
              <TooltipProvider delay={100}>
                <Tooltip>
                  <TooltipTrigger
                    render={
                      <span className="cursor-help border-b border-dashed border-muted-foreground/50 text-[10px] font-bold uppercase tracking-wider">
                        Attunement Rules
                      </span>
                    }
                  />
                  <TooltipContent>
                    <p className="max-w-xs leading-relaxed text-xs">
                      You can attune to up to 3 magic items simultaneously. Attuned items take effect automatically.<br />
                      Items that need attunement is marked with a 💠 mark.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {MAGIC_ITEMS_PROGRESSION.map((item) => {
                if (item.isAlert) {
                  return (
                    <div
                      key={item.id}
                      className="col-span-1 sm:col-span-2 bg-amber-500/5 border border-amber-500/20 rounded-lg p-3 flex items-start gap-2.5"
                    >
                      <AlertCircle className="size-4 text-amber-500 mt-0.5 shrink-0" />
                      <div>
                        <span className="font-bold text-xs text-amber-500 block mb-0.5">
                          {item.name}
                        </span>
                        <p
                          className="text-xs text-muted-foreground leading-relaxed"
                          dangerouslySetInnerHTML={{ __html: item.description }}
                        />
                      </div>
                    </div>
                  );
                }

                return (
                  <div
                    key={item.id}
                    className={`flex flex-col gap-1.5 bg-muted/10 border border-border/40 rounded-lg p-3 hover:bg-muted/20 transition-all group ${
                      item.fullWidth ? "col-span-1 sm:col-span-2" : ""
                    }`}
                  >
                      <span className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors">
                        {item.name}
                        <TooltipProvider delay={100}>
                          <Tooltip>
                            <TooltipTrigger
                              render={
                                <span className="cursor-help">
                                  {item.attunement ? (<span className="pl-1">💠</span>) : (<></>)}
                                </span>
                              }
                            />
                            <TooltipContent>
                              <p className="leading-relaxed">
                                💠 Requires Attunement
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </span>
                    <div>
                      {item.rarityKey && <RarityBadge rarityKey={item.rarityKey} />}
                    </div>
                    <p
                      className="text-xs text-muted-foreground leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: item.description }}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
