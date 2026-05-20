import { useSettings } from "@/contexts/SettingsContext";

export function Footer() {
  const { settings } = useSettings();

  if (!settings.sitewide.showFooter) return null;

  return (
    <footer className="mt-auto pt-14 pb-0 flex flex-col sm:flex-row items-center justify-center gap-4 text-sm text-muted-foreground">
      <span>2026</span>
      <span className="hidden sm:inline">|</span>
      <a
        href="https://www.gnu.org/licenses/gpl-3.0.html"
        target="_blank"
        rel="noopener noreferrer"
        className="hover:text-foreground transition-colors flex items-center gap-1.5"
        title="GNU General Public License v3.0"
      >
        <span>🄯 GPLv3</span>
      </a>
      <span className="hidden sm:inline">|</span>
      <a
        href="https://discord.gg/nBzSVyHfMy"
        target="_blank"
        rel="noopener noreferrer"
        className="hover:text-foreground transition-colors flex items-center gap-1.5"
        title="Discord"
      >
        <span>Discord</span>
      </a>
      {/* <span className="hidden sm:inline">|</span>
      <a
        href="https://github.com/"
        target="_blank"
        rel="noopener noreferrer"
        className="hover:text-foreground transition-colors flex items-center gap-1.5"
        title="Source Code"
      >
        <span>Source Code</span>
      </a> */}
      <span className="hidden sm:inline">|</span>
      <span>
        Made with 🩵 by{" "}
        <a
          href="https://github.com/ThunderE75/"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:underline text-foreground font-medium"
        >
          Thunder
        </a>{" "}
        for his friends.
      </span>
    </footer>
  );
}
