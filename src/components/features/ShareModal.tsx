import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import { X, Copy, Check, QrCode, AlertTriangle, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const logoUrl = "/gm-toolkit-logo-black.svg";

export interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  encodedData: string;
  characterName?: string;
  isRandomized: boolean;
  rollMeta?: {
    rolls?: number;
    timestamp?: string;
  };
  onGenerateUrl?: (name: string) => string | Promise<string>;
}

export function ShareModal({
  isOpen,
  onClose,
  encodedData,
  characterName = "",
  isRandomized,
  rollMeta,
  onGenerateUrl,
}: ShareModalProps) {
  const [localName, setLocalName] = useState(characterName);
  const [copied, setCopied] = useState(false);
  const [shareUrl, setShareUrl] = useState("");
  const [qrError, setQrError] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Initialize and update localName when characterName prop changes
  useEffect(() => {
    if (isOpen) {
      setLocalName(characterName);
    }
  }, [isOpen, characterName]);

  // Generate share URL dynamically when state changes
  useEffect(() => {
    if (!isOpen) return;

    if (onGenerateUrl) {
      const generated = onGenerateUrl(localName);
      if (generated instanceof Promise) {
        setShareUrl(""); // Temporarily empty to trigger loading state in UI
        generated
          .then((url) => {
            setShareUrl(url);
          })
          .catch((err) => {
            console.error("Failed to generate async share URL:", err);
            setShareUrl("Error generating secure link");
          });
      } else {
        setShareUrl(generated);
      }
    } else {
      // Default URL builder
      const url = new URL(window.location.href);
      url.search = "";
      url.searchParams.set("code", encodedData);

      if (isRandomized) {
        const nameToUse = localName.trim() || "Unnamed Character";
        url.searchParams.set("name", nameToUse);
        if (rollMeta?.rolls !== undefined) {
          url.searchParams.set("rolls", String(rollMeta.rolls));
        }
        url.searchParams.set(
          "ts",
          rollMeta?.timestamp || new Date().toISOString()
        );
      }
      setShareUrl(url.toString());
    }
  }, [isOpen, encodedData, localName, isRandomized, rollMeta, onGenerateUrl]);

  // Render QR Code with Logo overlay
  useEffect(() => {
    if (!isOpen || !shareUrl || !canvasRef.current) return;

    const canvas = canvasRef.current;

    QRCode.toCanvas(
      canvas,
      shareUrl,
      {
        width: 500, // High-resolution retina generation
        margin: 3,
        errorCorrectionLevel: "H", // High correction enables center logo overlay
        color: {
          dark: "#0f172a", // Very dark slate (premium look)
          light: "#ffffff",
        },
      },
      (error) => {
        if (error) {
          console.error("QR Code generation error:", error);
          setQrError("Failed to generate QR Code");
          return;
        }

        setQrError(null);

        // Draw central logo overlay
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const size = canvas.width;
        const maxSize = size * 0.22; // ~22% size

        // Aspect ratio of /gm-toolkit-logo-black.svg is 174 / 126
        const originalWidth = 174;
        const originalHeight = 126;
        const aspectRatio = originalWidth / originalHeight;

        const logoWidth = maxSize;
        const logoHeight = maxSize / aspectRatio;

        const logoX = (size - logoWidth) / 2;
        const logoY = (size - logoHeight) / 2;

        // Draw clean white rounded square behind the logo
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        const padX = 8;
        const padY = 6;
        const radius = 6;

        const rectX = logoX - padX;
        const rectY = logoY - padY;
        const rectWidth = logoWidth + padX * 2;
        const rectHeight = logoHeight + padY * 2;

        if (ctx.roundRect) {
          ctx.roundRect(rectX, rectY, rectWidth, rectHeight, radius);
        } else {
          ctx.rect(rectX, rectY, rectWidth, rectHeight);
        }
        ctx.fill();

        // Draw custom GM Toolkit Logo
        const img = new Image();
        img.src = logoUrl;
        img.onload = () => {
          ctx.drawImage(img, logoX, logoY, logoWidth, logoHeight);
        };
      }
    );
  }, [isOpen, shareUrl]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
      // Autofocus input field on open
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  const handleCopy = async () => {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
      }, 2500);
    } catch (err) {
      console.error("Failed to copy URL:", err);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="share-modal-title"
    >
      {/* Click-away backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300 animate-in fade-in"
        onClick={onClose}
      />

      {/* Modal Content Panel */}
      <div className="relative z-10 w-full max-w-3xl bg-background border border-border/80 shadow-2xl p-4 sm:p-6 rounded-none flex flex-col gap-5 animate-in zoom-in-95 duration-200 max-h-[95vh] overflow-y-auto">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/60 pb-3">
          <h2 id="share-modal-title" className="text-base font-bold tracking-wide uppercase text-foreground m-0 flex items-center gap-2">
            <QrCode className="w-5 h-5 text-primary" />
            Share
          </h2>
          <Button
            variant="outline"
            size="icon-xs"
            onClick={onClose}
            aria-label="Close dialog"
            className="hover:bg-muted/50 transition-colors"
          >
            <X className="w-4 h-4 text-muted-foreground hover:text-foreground" />
          </Button>
        </div>
        {/* QR Code and Content Container */}
        <div className="flex flex-col md:flex-row gap-6 items-center md:items-start w-full">
          {/* QR Code Column */}
          <div id="qr-code-container" className="shrink-0 w-full md:w-auto flex justify-center">
            <div className="flex flex-col items-center justify-center pb-6 md:pb-0 md:pr-6 border-b md:border-b-0 md:border-r border-border/40 w-full md:w-auto">
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                Scan QR Code
              </p>
              {qrError ? (
                <div className="flex items-center justify-center border border-dashed border-destructive/40 text-destructive text-xs py-10 px-6 w-[200px] h-[200px] text-center">
                  {qrError}
                </div>
              ) : (
                <div className="relative p-2.5 bg-white border border-border shadow-sm w-[222px] h-[222px] flex items-center justify-center">
                  <canvas
                    ref={canvasRef}
                    className="block !w-[200px] !h-[200px]"
                  />
                </div>
              )}
            </div>
          </div>
          {/* Input & Info Column */}
          <div className="flex flex-col gap-3 text-left flex-1 min-w-0 w-full">
            {/* Description */}
            <div>
              <p className="text-xs font-semibold text-foreground uppercase tracking-wider">
                Share with Friends
              </p>
              <div className="text-xs leading-relaxed">
                {/* info callout */}
                <div className="flex flex-row gap-2 border border-blue-400 rounded px-3 py-2 mt-1 mb-0 bg-blue-500/5 rounded">
                  <div className="flex items-center pr-0.5">
                    <Info className="w-4 h-4 text-blue-400" />
                  </div>
                  <span className="text-blue-400 font-medium ">
                    The links are not reliable yet for rolled stats, they will be fixed soon.
                  </span>
                </div>
                {isRandomized && (
                  // Randomized rolls disclosure note
                  <div className="flex flex-row gap-2 border border-orange-400 rounded px-3 py-2 mt-1 mb-0 bg-amber-500/5 rounded">
                    <div className="flex items-center pr-0.5">
                      <AlertTriangle className="w-4 h-4 text-orange-400" />
                    </div>
                    <span className="text-orange-400 font-medium ">
                      If randomized rolls were used (HP or Ability Scores), the number of rolls, timestamp, and character name are included for verification.
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Character Name Input */}
            <div className="space-y-1.5">
              <label
                htmlFor="char-name-input"
                className="text-xs font-semibold text-muted-foreground uppercase tracking-wider"
              >
                Character Name
              </label>
              <Input
                id="char-name-input"
                ref={inputRef}
                placeholder="e.g. Unnamed Character"
                value={localName}
                onChange={(e) => setLocalName(e.target.value)}
                className="w-full text-xs rounded-none border-border focus-visible:ring-1 focus-visible:ring-primary/45 font-mono"
              />
            </div>

            {/* Share Link Row */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Share Link
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={shareUrl || "Generating secure link..."}
                  aria-label="Generated Share Link"
                  className="flex-1 h-8 px-2 border border-border bg-muted/20 text-xs font-mono select-all overflow-x-auto whitespace-nowrap outline-none focus:border-primary/50"
                />
                <TooltipProvider delay={100}>
                  <Tooltip>
                    <TooltipTrigger
                      render={
                        <Button
                          variant={copied ? "default" : "outline"}
                          size="sm"
                          disabled={!shareUrl}
                          onClick={handleCopy}
                          aria-label="Copy share link"
                          className={`h-8 min-w-[76px] transition-all duration-200 ${copied
                            ? "bg-emerald-600 text-white hover:bg-emerald-600 border-emerald-600"
                            : "hover:border-primary hover:text-primary"
                            }`}
                        >
                          {copied ? (
                            <>
                              <Check className="w-3.5 h-3.5 mr-1" />
                              Copied!
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5 mr-1" />
                              Copy
                            </>
                          )}
                        </Button>
                      }
                    />
                    <TooltipContent className="text-[10px] py-1 px-2">
                      {copied ? "Copied to clipboard" : "Copy link"}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          </div>
        </div>

        {/* Footer buttons
        <div className="flex justify-end gap-2 border-t border-border/40 pt-4 shrink-0">
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="default" size="sm" onClick={handleCopy} className="gap-1.5">
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? "Copied" : "Copy Link"}
          </Button>
        </div> */}
      </div>
    </div>
  );
}
