import { Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface PageHeaderProps {
  title: string;
  description: string;
  onSettingsClick: () => void;
}

export function PageHeader({ title, description, onSettingsClick }: PageHeaderProps) {
  return (
    <div className="flex justify-between items-start mb-5 sm:mb-8 gap-2">
      <div>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-1 sm:mb-2 leading-tight">{title}</h1>
        <p className="text-muted-foreground text-xs sm:text-sm">{description}</p>
      </div>
      <div className="flex items-center gap-1 mt-0.5 shrink-0">
        <TooltipProvider delay={100}>
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Open settings"
                  onClick={onSettingsClick}
                >
                  <Settings className="w-5 h-5" />
                </Button>
              }
            />
            <TooltipContent>
              <p>Settings</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
}
