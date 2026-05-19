import type { HTMLAttributes } from "react";
import { User } from "lucide-react";

interface VerifiedLoadPanelProps extends HTMLAttributes<HTMLDivElement> {
  name?: string;
  rolls?: number | null;
  timestamp?: string;
  timezone?: string;
}

export function VerifiedLoadPanel({
  name,
  rolls,
  timestamp,
  timezone,
  className = "",
  ...props
}: VerifiedLoadPanelProps) {
  const hasName = Boolean(name && name.trim().length > 0);
  const hasRolls = rolls !== undefined && rolls !== null && rolls !== 0;
  const hasTimestamp = Boolean(timestamp && timestamp.trim().length > 0);

  if (!hasName && !hasRolls && !hasTimestamp) return null;

  return (
    <div
      className={`border border-blue-400 bg-blue-400/10 p-2 rounded-none text-left flex flex-col gap-1.5 shadow-sm animate-in fade-in duration-300 ${className}`}
      {...props}
    >
      <div className="flex flex-row gap-2">
        <User className="w-10 h-10 text-primary shrink-0 my-auto" />
        <div className="flex flex-col py-1">
          <p className="text-[14px] font-bold text-primary uppercase tracking-wider">
            Loaded Character Information
          </p>
          <div className="flex flex-wrap gap-x-6 gap-y-1.5 text-xs text-muted-foreground font-mono">
            {hasName && (
              <p>
                Name: <span className="text-foreground font-semibold">{name}</span>
              </p>
            )}
            {hasRolls && (
              <p>
                Rolls: <span className="text-foreground font-semibold">{rolls}</span>
              </p>
            )}
            {hasTimestamp && (
              <p>
                Timestamp: <span className="text-foreground font-semibold">
                  {new Date(timestamp!).toLocaleString()}
                  {timezone ? ` (${timezone})` : ""}
                </span>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
