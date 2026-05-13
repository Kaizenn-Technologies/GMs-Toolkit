import { RotateCcw, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ComponentProps } from "react";

export interface ResetButtonProps extends ComponentProps<typeof Button> {
  onClick: () => void;
}

export function ResetButton({ onClick, className, size = "sm", variant = "outline", ...props }: ResetButtonProps) {
  return (
    <Button variant={variant} size={size} onClick={onClick} className={className} {...props}>
      <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
      Reset
    </Button>
  );
}

export interface ShareButtonProps extends ComponentProps<typeof Button> {
  copied: boolean;
  onClick: () => void;
}

export function ShareButton({ copied, onClick, className, size = "sm", variant = "outline", ...props }: ShareButtonProps) {
  return (
    <Button variant={variant} size={size} onClick={onClick} className={className} {...props}>
      <Share2 className="w-4 h-4 mr-2" />
      {copied ? "Copied" : "Share"}
    </Button>
  );
}
