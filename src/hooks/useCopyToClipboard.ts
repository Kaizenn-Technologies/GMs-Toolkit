import { useState, useCallback } from "react";

export function useCopyToClipboard(resetIntervalMs = 1500) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), resetIntervalMs);
    } catch {
      // If clipboard permissions are blocked, fail quietly.
    }
  }, [resetIntervalMs]);

  return { copied, copyToClipboard };
}
