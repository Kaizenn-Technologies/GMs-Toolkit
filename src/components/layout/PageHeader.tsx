import { useSettings } from "@/contexts/SettingsContext";

interface PageHeaderProps {
  title: string;
  description: string;
}

export function PageHeader({ title, description }: PageHeaderProps) {
  const { settings } = useSettings();

  if (!settings.sitewide.showHeader) return null;

  return (
    <div className="flex justify-between items-start mb-2 sm:mb-2 gap-2">
      <div>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-1 sm:mb-2 leading-tight">{title}</h1>
        <p className="text-muted-foreground text-xs sm:text-sm">{description}</p>
      </div>
    </div>
  );
}
