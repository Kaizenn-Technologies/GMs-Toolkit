import React, { useRef, useEffect, useCallback, useReducer } from "react";
import { X, Upload, FileJson, Check, AlertCircle, Folder, Dice6 } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface ImportedDiceConfig {
  id?: string;
  name?: string;
  count?: number;
  sides?: number;
  modifier?: number;
  explode?: "single" | "compound";
  reroll?: {
    type: "once" | "until";
    threshold: number;
  };
  rule?: {
    type: "keep" | "drop";
    target: "highest" | "lowest";
    value: number;
  };
  type?: string;
}

export interface ImportedGroup {
  id?: string;
  name?: string;
  collapsed?: boolean;
  dice?: ImportedDiceConfig[];
}

export interface ImportedData {
  groups?: ImportedGroup[];
  ungrouped?: ImportedDiceConfig[];
  count?: number;
  sides?: number;
  type?: string;
}

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (data: ImportedData, mode: "merge" | "replace") => { success: boolean; error?: string };
}

export const ImportModal: React.FC<ImportModalProps> = ({ isOpen, onClose, onImport }) => {
  const [state, dispatch] = useReducer((s: any, a: any) => ({ ...s, ...a }), {
    inputText: "",
    dragActive: false,
    parsedData: null as ImportedData | null,
    validationError: null as string | null,
    importMode: "merge" as "merge" | "replace"
  });

  const { inputText, dragActive, parsedData, validationError, importMode } = state;

  const setInputText = (inputText: string) => dispatch({ inputText });
  const setDragActive = (dragActive: boolean) => dispatch({ dragActive });
  const setParsedData = (parsedData: ImportedData | null) => dispatch({ parsedData });
  const setValidationError = (validationError: string | null) => dispatch({ validationError });
  const setImportMode = (importMode: "merge" | "replace") => dispatch({ importMode });
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleClose = useCallback(() => {
    dispatch({ inputText: "", parsedData: null, validationError: null });
    onClose();
  }, [onClose]);

  // Validate incoming JSON
  const validateJson = (jsonString: string) => {
    if (!jsonString.trim()) {
      setParsedData(null);
      setValidationError(null);
      return;
    }
    
    try {
      const data = JSON.parse(jsonString) as ImportedData;
      
      // Basic checks
      let hasDice = false;
      let hasGroups = false;
      
      if (typeof data === "object" && data !== null) {
        const groupsArr = (data as ImportedData).groups;
        const ungroupedArr = (data as ImportedData).ungrouped;
        
        if (Array.isArray(groupsArr) && groupsArr.length > 0) hasGroups = true;
        if (Array.isArray(ungroupedArr) && ungroupedArr.length > 0) hasDice = true;
        
        // Single die format or array format check
        if (Array.isArray(data) && data.length > 0) hasDice = true;
        
        const singleConfig = data as ImportedDiceConfig;
        if (singleConfig.count && (singleConfig.sides || singleConfig.type)) hasDice = true;
      }
      
      if (!hasDice && !hasGroups) {
        setValidationError("JSON parsed successfully, but no valid dice presets or groups were found.");
        setParsedData(null);
      } else {
        setValidationError(null);
        setParsedData(data);
      }
    } catch (e) {
      setValidationError(`Invalid JSON format: ${(e as Error).message}`);
      setParsedData(null);
    }
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setInputText(text);
    validateJson(text);
  };

  // Handle drag and drop
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const processFile = (file: File) => {
    if (file.type !== "application/json" && !file.name.endsWith(".json")) {
      setValidationError("Please upload a valid JSON file.");
      setParsedData(null);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      setInputText(text);
      validateJson(text);
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleImportSubmit = () => {
    if (!parsedData) return;
    
    const result = onImport(parsedData, importMode);
    if (result.success) {
      handleClose();
    } else {
      setValidationError(result.error || "Failed to import configurations.");
    }
  };

  // Close on ESC
  const handleCloseRef = useRef(handleClose);
  handleCloseRef.current = handleClose;

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleCloseRef.current();
    };
    if (isOpen) window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen]);

  if (!isOpen) return null;

  // Extract preview metrics
  const previewGroups = Array.isArray(parsedData?.groups) ? parsedData.groups : [];
  let previewUngroupedCount = 0;
  if (Array.isArray(parsedData?.ungrouped)) {
    previewUngroupedCount = parsedData.ungrouped.length;
  } else if (Array.isArray(parsedData)) {
    previewUngroupedCount = parsedData.length;
  } else if (parsedData?.count) {
    previewUngroupedCount = 1;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Click-away backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300 animate-in fade-in"
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Modal Content Panel */}
      <div className="relative z-10 w-full max-w-2xl bg-card border border-border/80 shadow-2xl p-5 sm:p-6 rounded-xl flex flex-col gap-4 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/40 pb-3 shrink-0">
          <h2 className="text-sm font-bold tracking-wider uppercase text-foreground m-0 flex items-center gap-2">
            <Upload className="size-4.5 text-primary" />
            Import Dice Presets
          </h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClose}
            aria-label="Close dialog"
            className="hover:bg-muted/50 transition-colors size-7"
          >
            <X className="size-4 text-muted-foreground hover:text-foreground" />
          </Button>
        </div>

        {/* Scrollable Container */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1 min-h-0">
          
          {/* File Drag-and-Drop Area */}
          <button
            type="button"
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`w-full border-2 border-dashed rounded-lg p-5 flex flex-col items-center justify-center cursor-pointer transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/50 ${
              dragActive 
                ? "border-primary bg-primary/10 text-primary" 
                : "border-border/60 hover:border-primary/50 hover:bg-muted/5 text-muted-foreground"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileChange}
              className="hidden"
              aria-label="Upload JSON config file"
            />
            <FileJson className={`w-8 h-8 mb-2 transition-transform ${dragActive ? "scale-110 text-primary" : "text-muted-foreground/60"}`} />
            <p className="text-xs font-semibold uppercase tracking-wider text-foreground">
              Drag & Drop JSON File or <span className="text-primary underline">Browse</span>
            </p>
            <p className="text-[10px] text-muted-foreground/80 mt-1 uppercase font-bold tracking-tight">
              Accepts .json configuration backups
            </p>
          </button>

          {/* Paste JSON Editor */}
          <div className="space-y-1.5">
            <label htmlFor="json-paste" className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
              Or Paste JSON Content
            </label>
            <textarea
              id="json-paste"
              value={inputText}
              onChange={handleTextChange}
              placeholder='{\n  "groups": [],\n  "ungrouped": []\n}'
              className="w-full h-36 font-mono text-xs p-3 rounded-lg border border-border/80 bg-background/50 focus:border-primary/50 focus:ring-1 focus:ring-primary/30 outline-none resize-none"
            />
          </div>

          {/* Validation Feedback */}
          {validationError && (
            <div className="flex items-start gap-2.5 p-3 border border-destructive/20 bg-destructive/5 rounded-lg text-destructive text-xs animate-in fade-in duration-200">
              <AlertCircle className="size-4 shrink-0 mt-0.5" />
              <div className="font-semibold">{validationError}</div>
            </div>
          )}

          {parsedData && (
            <ImportPreviewSection
              previewGroups={previewGroups}
              previewUngroupedCount={previewUngroupedCount}
              importMode={importMode}
              setImportMode={setImportMode}
            />
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 border-t border-border/40 pt-3 shrink-0">
          <Button variant="outline" size="sm" onClick={handleClose} className="h-9 text-xs font-semibold uppercase tracking-wider">
            Cancel
          </Button>
          <Button
            variant={importMode === "replace" ? "destructive" : "default"}
            size="sm"
            onClick={handleImportSubmit}
            disabled={!parsedData}
            className="h-9 text-xs font-semibold uppercase tracking-wider min-w-[90px]"
          >
            Import
          </Button>
        </div>

      </div>
    </div>
  );
};

interface ImportPreviewSectionProps {
  previewGroups: ImportedGroup[];
  previewUngroupedCount: number;
  importMode: "merge" | "replace";
  setImportMode: (mode: "merge" | "replace") => void;
}

const ImportPreviewSection: React.FC<ImportPreviewSectionProps> = ({
  previewGroups,
  previewUngroupedCount,
  importMode,
  setImportMode,
}) => {
  return (
    <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* Validation Success Card */}
      <div className="flex items-center gap-2 p-2 px-3 border border-emerald-500/20 bg-emerald-500/5 rounded-lg text-emerald-500 text-xs font-semibold">
        <Check className="size-4" />
        <span>JSON Validated Successfully!</span>
      </div>

      {/* Data Preview Pane */}
      <div className="border border-border/50 rounded-lg bg-muted/10 p-3.5 space-y-3">
        <h4 className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">
          Configuration Preview
        </h4>
        
        <div className="grid grid-cols-2 gap-4">
          {/* Groups Stats */}
          <div className="flex items-start gap-2.5">
            <Folder className="size-4.5 text-primary shrink-0 mt-0.5" />
            <div>
              <div className="text-xs font-bold">{previewGroups.length} Groups</div>
              <div className="text-[10px] text-muted-foreground uppercase font-semibold mt-0.5">
                {previewGroups.map((g: ImportedGroup) => g.name || "Unnamed").join(", ") || "None"}
              </div>
            </div>
          </div>

          {/* Dice Stats */}
          <div className="flex items-start gap-2.5">
            <Dice6 className="size-4.5 text-primary shrink-0 mt-0.5" />
            <div>
              <div className="text-xs font-bold">{previewUngroupedCount} Standalone Rolls</div>
              <div className="text-[10px] text-muted-foreground uppercase font-semibold mt-0.5">
                {previewUngroupedCount > 0 ? "Ready to import" : "None"}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Conflict Options Segmented Controller */}
      <div className="space-y-2 border-t border-border/30 pt-3">
        <div className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
          Import Action / Conflict Handling
        </div>
        <div className="grid grid-cols-2 gap-2 p-1 bg-muted/40 border border-border/50 rounded-lg">
          <button
            type="button"
            onClick={() => setImportMode("merge")}
            className={`py-2 px-3 text-xs font-bold uppercase tracking-wider rounded-md transition-all ${
              importMode === "merge"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Merge with Existing
          </button>
          <button
            type="button"
            onClick={() => setImportMode("replace")}
            className={`py-2 px-3 text-xs font-bold uppercase tracking-wider rounded-md transition-all ${
              importMode === "replace"
                ? "bg-destructive/10 border border-destructive/20 text-destructive"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Replace All Existing
          </button>
        </div>
        <p className="text-[10px] text-muted-foreground/80 uppercase font-semibold pl-1">
          {importMode === "merge" 
            ? "✓ Safe. Merges presets together and generates new IDs to avoid conflicts."
            : "⚠ Warning: Clears all current presets and groups and writes the imported set."}
        </p>
      </div>
    </div>
  );
};
