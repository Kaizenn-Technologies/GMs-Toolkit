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
import { SettingsOverlay } from "@/components/features/SettingsOverlay";
import { SettingsProvider } from "@/contexts/SettingsContext";
import { PageHeader } from "@/components/layout/PageHeader";
import { ResetButton, ShareButton } from "@/components/ui/action-buttons";
import { CUSTOM_CLASS_NAME, CUSTOM_HIT_DIE_OPTIONS } from "@/lib/constants";
import { useHpCalculator, hpClassOptions } from "./useHpCalculator";

function HpCalculatorInner() {
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
    openSettings,
    addClassSelection,
    handleResetClassSelections,
    removeClassSelection,
    updateClassSelection,
    handleRollAgain,
    handleShareLink,
  } = useHpCalculator();

  return (
    <>
      <PageHeader
        title="D&D 5.5e Health Calculator"
        description="Calculate your character's hit points based on class, level, and modifiers."
        onSettingsClick={openSettings}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* INPUT SECTION */}
        <div>
          <Card>
            <CardContent className="space-y-6">
              <p className="text-xl font-semibold text-center pb-2 pt-6">Class Picker</p>
              {/* Class Selections */}
              <div className="space-y-4">
                {classSelections.map((selection, index) => (
                  <div key={selection.id} className="space-y-2">
                    <label className="text-xs font-medium text-muted-foreground block">
                      Class {index + 1}
                    </label>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 min-w-0">
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
                        <div className="w-32 shrink-0">
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

                      <div className="w-32 shrink-0">
                        <StepperInput
                          className="rounded-none"
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

                      {classSelections.length > 1 && (
                        <Button
                          variant="ghost"
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

              <div className="flex flex-wrap gap-2 mb-4">
                <Button onClick={addClassSelection} variant="outline" className="m-0">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Another Class
                </Button>
                <ResetButton onClick={handleResetClassSelections} className="m-0" size="default" />
              </div>

              {/* CON Modifier & Feats */}
              <div className="pt-2 border-t">
                <div className="flex flex-wrap items-center gap-3 mb-4 mt-4">
                  <label className="text-sm font-semibold">
                    Constitution Modifier:
                  </label>
                  <div className="w-32">
                    <StepperInput
                      className="rounded-none"
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
            <CardContent className="pt-6">
              <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "average" | "rolled")} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="average">Average</TabsTrigger>
                  <TabsTrigger value="rolled">Rolled</TabsTrigger>
                </TabsList>

                <TabsContent value="average" className="mt-6 space-y-6">
                  <HpTotalDisplay total={result.totalHP} />
                  <HpBreakdown items={result.breakdown} />
                  <ShareButton onClick={() => handleShareLink("average")} copied={copied} className="w-full m-0" />
                </TabsContent>

                <TabsContent value="rolled" className="mt-6 space-y-6">
                  <HpTotalDisplay
                    total={rolledResult.totalHP}
                    valueClassName={rollColorClass}
                    tooltip={`Difference from average: ${diff > 0 ? `+${diff}` : diff}`}
                    icon={rollIcon ? <span className={`absolute -right-5 ${rollIcon === "▲" ? "top-0" : "top-1"} text-[18px]`}>{rollIcon}</span> : null}
                  />

                  <div className="mb-2">
                    <HpBreakdown items={rolledResult.breakdown} />
                  </div>
                  
                  {activeTab === "rolled" && shouldShowMetaPanel && (
                    <div className="mt-3 mb-2 border border-border/70 bg-muted/40 px-3 py-2 text-sm">
                      {sharedNameFromLink.length > 0 && (
                        <p>Character: <span className="font-medium">{sharedNameFromLink}</span></p>
                      )}
                      {showRollCounter && (
                        <p>Rolls done: <span className="font-medium">{rerollCountForCurrentCombo}</span></p>
                      )}
                    </div>
                  )}
                  
                  <div className="flex flex-col gap-2 mt-4">
                    <Button onClick={handleRollAgain} className="w-full m-0">
                      <Dices className="w-4 h-4 mr-2" />
                      Roll Again
                    </Button>
                    <ShareButton onClick={() => handleShareLink("rolled")} copied={copied} />
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
      <SettingsOverlay enabledTabs={["hp"]} />
    </>
  );
}

export function HpCalculator() {
  return (
    <SettingsProvider>
      <HpCalculatorInner />
    </SettingsProvider>
  );
}
