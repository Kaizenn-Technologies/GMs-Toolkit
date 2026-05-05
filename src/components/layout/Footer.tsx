export function Footer() {
  return (
    <footer className="mt-auto pt-14 pb-0 flex flex-col sm:flex-row items-center justify-center gap-4 text-sm text-muted-foreground">
      <span>2026</span>
      <span className="hidden sm:inline">|</span>
      <a
        href="https://creativecommons.org/licenses/by-nc-sa/4.0/deed.en"
        target="_blank"
        rel="noopener noreferrer"
        className="hover:text-foreground transition-colors flex items-center"
        title="Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License"
      >
        <span className="flex items-center ml-2 space-x-1">
          <img src="https://mirrors.creativecommons.org/presskit/icons/cc.svg" alt="" className="h-4 w-4 dark:invert opacity-80" />
          <img src="https://mirrors.creativecommons.org/presskit/icons/by.svg" alt="" className="h-4 w-4 dark:invert opacity-80" />
          <img src="https://mirrors.creativecommons.org/presskit/icons/nc.svg" alt="" className="h-4 w-4 dark:invert opacity-80" />
          <img src="https://mirrors.creativecommons.org/presskit/icons/sa.svg" alt="" className="h-4 w-4 dark:invert opacity-80" />
        </span>
      </a>
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
