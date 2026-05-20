import { Plus, Trash2, Dices } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { StepperInput } from "@/components/ui/stepper-input";
import { HpBreakdown } from "./HpBreakdown";
import { HpTotalDisplay } from "./HpTotalDisplay";
import { PageHeader } from "@/components/layout/PageHeader";
import { ResetButton, ShareButton } from "@/components/ui/action-buttons";
import { CUSTOM_CLASS_NAME, CUSTOM_HIT_DIE_OPTIONS } from "@/lib/constants";
import { ShareModal } from "@/components/features/ShareModal";
import { VerifiedLoadPanel } from "@/components/features/VerifiedLoadPanel";
import { useHpCalculator, hpClassOptions } from "./useHpCalculator";

export function HpCalculator() {
  const {
    classSelections,
    conModifier,
    setConModifier,
    tough,
    setTough,
    hillDwarf,
    setHillDwarf,
    activeTab,
    setActiveTab,
    result,
    rolledResult,
    diff,
    rollColorClass,
    rollIcon,
    copied,
    shouldShowMetaPanel,
    sharedNameFromLink,
    showRollCounter,
    rerollCountForCurrentCombo,
    sharedTimestamp,
    sharedTimezone,
    initialRerolls,
    addClassSelection,
    handleResetClassSelections,
    removeClassSelection,
    updateClassSelection,
    handleRollAgain,
    handleShareLink,
    isRolling,
    isShareModalOpen,
    setIsShareModalOpen,
    shareModalProps,
  } = useHpCalculator();

  return (
    <>
      <PageHeader
        title="D&D 5.5e Health Calculator"
        description="Calculate your character's hit points based on class, level, and modifiers."
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* INPUT SECTION */}
        <div>
          <Card>
            <CardContent className="space-y-6">
              <div className="mb-4">
                <p className="text-xl font-semibold text-center border-b pb-2">Class Picker</p>
              </div>
              {/* Class Selections */}
              <div className="space-y-4">
                {classSelections.map((selection, index) => (
                  <div key={selection.id} className="space-y-2">
                    <label className="text-xs font-medium text-muted-foreground block">
                      Class {index + 1}
                    </label>
                    <div className="flex justify-between items-center gap-2">
                      <div className="flex flex-row flex-1 justify-between gap-2">
                        <div className="min-w-0">
                          <Select
                            value={selection.className}
                            onValueChange={(value) =>
                              value && updateClassSelection(selection.id, "className", value)
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {hpClassOptions.map((className) => {
                                const isSelected = classSelections.some(c => c.className === className && c.id !== selection.id);
                                return (
                                  <SelectItem key={className} value={className} disabled={isSelected}>
                                    {className}
                                  </SelectItem>
                                );
                              })}
                            </SelectContent>
                          </Select>
                        </div>

                        {selection.className === CUSTOM_CLASS_NAME && (
                          <div className="shrink-0">
                            <Select
                              value={`d${selection.customHitDie ?? CUSTOM_HIT_DIE_OPTIONS[0]}`}
                              onValueChange={(value) => {
                                if (!value) return;
                                updateClassSelection(selection.id, "customHitDie", Number(value.replace("d", "")));
                              }}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {CUSTOM_HIT_DIE_OPTIONS.map((die) => (
                                  <SelectItem key={die} value={`d${die}`}>
                                    {`d${die}`}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        )}

                        <div>
                          <StepperInput
                            className="rounded-none h-8 w-24"
                            min={classSelections.length > 1 ? 0 : 1}
                            max={20}
                            value={selection.level}
                            onChange={(val) => {
                              if (val === 0) {
                                removeClassSelection(selection.id);
                              } else {
                                updateClassSelection(selection.id, "level", val);
                              }
                            }}
                          />
                        </div>
                      </div>

                      {classSelections.length > 1 && (
                        <Button
                          variant="destructive"
                          size="icon"
                          className="shrink-0"
                          onClick={() => removeClassSelection(selection.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap justify-between mb-2 py-2 border-y ">
                <Button onClick={addClassSelection} variant="outline" className="m-0">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Another Class
                </Button>
                <ResetButton onClick={handleResetClassSelections} className="m-0" size="default" />
              </div>

              {/* CON Modifier & Feats */}
              <div className="">
                <div className="flex flex-wrap items-center gap-3 mb-4 mt-4">
                  <label className="text-sm font-semibold">
                    Constitution Modifier:
                  </label>
                  <div className="w-32">
                    <StepperInput
                      className="rounded-none h-8"
                      value={conModifier}
                      onChange={(val) => setConModifier(val)}
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <TooltipProvider delay={100}>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="tough" checked={tough} onCheckedChange={(checked) => setTough(checked as boolean)} />
                      <Tooltip>
                        <TooltipTrigger render={<label htmlFor="tough" className="text-sm font-medium cursor-help border-b border-dashed border-muted-foreground/50">Tough Origin Feat</label>} />
                        <TooltipContent><p>+2 for each level</p></TooltipContent>
                      </Tooltip>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox id="hillDwarf" checked={hillDwarf} onCheckedChange={(checked) => setHillDwarf(checked as boolean)} />
                      <Tooltip>
                        <TooltipTrigger render={<label htmlFor="hillDwarf" className="text-sm font-medium cursor-help border-b border-dashed border-muted-foreground/50">Dwarf Lineage</label>} />
                        <TooltipContent><p>Dwarven Toughness: +1 for each level</p></TooltipContent>
                      </Tooltip>
                    </div>
                  </TooltipProvider>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* OUTPUT SECTION */}
        <div>
          <Card>
            <CardContent>
              <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "average" | "rolled")} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="average">Average</TabsTrigger>
                  <TabsTrigger value="rolled">Rolled</TabsTrigger>
                </TabsList>

                <TabsContent value="average" className="flex flex-col gap-2">
                  <HpTotalDisplay className="mt-6 mb-4" total={result.totalHP} />
                  <HpBreakdown items={result.breakdown} />
                  <ShareButton onClick={() => handleShareLink("average")} copied={copied} className="w-full m-0" />
                </TabsContent>

                <TabsContent value="rolled" className="flex flex-col gap-2">
                  {showRollCounter && (
                    <div className="flex justify-end -mb-4 mt-1">
                      <div className="flex items-center gap-1.5 font-mono text-[11px] text-muted-foreground bg-muted/40 border border-border/30 px-2 py-0.5 rounded-none">
                        <span className="font-semibold uppercase tracking-wider text-[10px] text-muted-foreground/80">Reroll Count:</span>
                        <span className="text-primary font-bold text-sm">{rerollCountForCurrentCombo}</span>
                      </div>
                    </div>
                  )}

                  <HpTotalDisplay
                    className="mt-6 mb-4"
                    total={rolledResult.totalHP}
                    valueClassName={`${rollColorClass} ${isRolling ? "animate-number-flicker" : ""}`}
                    tooltip={`Difference from average: ${diff > 0 ? `+${diff}` : diff}`}
                    icon={rollIcon ? <span className={`absolute -right-5 ${rollIcon === "▲" ? "top-0" : "top-1"} text-[18px]`}>{rollIcon}</span> : null}
                  />

                  {shouldShowMetaPanel && (
                    <VerifiedLoadPanel
                      name={sharedNameFromLink}
                      rolls={initialRerolls > 0 ? initialRerolls : null}
                      timestamp={sharedTimestamp}
                      timezone={sharedTimezone}
                      className="mb-2"
                    />
                  )}

                  <div>
                    <HpBreakdown items={rolledResult.breakdown} />
                  </div>

                  <div className="flex flex-col gap-2 mt-4">
                    <Button onClick={handleRollAgain} className="w-full m-0" disabled={isRolling}>
                      <Dices className="w-4 h-4 mr-2" />
                      {isRolling ? "Rolling..." : "Roll Again"}
                    </Button>
                    <ShareButton onClick={() => handleShareLink("rolled")} copied={copied} />
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>

      {shareModalProps && (
        <ShareModal
          isOpen={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
          {...shareModalProps}
        />
      )}
    </>
  );
}
