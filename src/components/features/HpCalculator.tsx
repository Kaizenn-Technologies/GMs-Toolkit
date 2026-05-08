import { useMemo, useState } from "react";
import { Plus, Trash2, RotateCw, Share2 } from "lucide-react";
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
import type { ClassSelection } from "@/types";
import { classNames } from "@/lib/classes";
import { calculateHP } from "@/lib/calculations";
import { StepperInput } from "@/components/ui/stepper-input";
import { HpBreakdown, HpTotalDisplay } from "@/components/features/HpCalculatorParts";
import {
  buildCoreData,
  buildRollEntries,
  classSelectionsToClassInput,
} from "@/utils/coreDataEncoder";
import { decodedClassesToSelections, parseCoreData } from "@/utils/coreDataDecoder";

const CUSTOM_CLASS_NAME = "Custom";
const CUSTOM_HIT_DIE_OPTIONS = [6, 8, 10, 12] as const;
const hpClassOptions = [CUSTOM_CLASS_NAME, ...classNames];
const INITIAL_CLASS_SELECTIONS: ClassSelection[] = [{ id: "1", className: "Wizard", level: 1 }];

function generateRolledValues(classSelections: ClassSelection[]): number[] {
  return calculateHP(classSelections, 0, false, false, false).rolls ?? [];
}

function getInitialHpState() {
  const fallback = {
    classSelections: INITIAL_CLASS_SELECTIONS,
    conModifier: 0,
    tough: false,
    hillDwarf: false,
    activeTab: "average" as const,
    rolledValues: generateRolledValues(INITIAL_CLASS_SELECTIONS),
  };

  try {
    const params = new URLSearchParams(window.location.search);
    const core = params.get("core");
    if (!core) return fallback;

    const decoded = parseCoreData(core);
    const nextSelections = decodedClassesToSelections(decoded.classes);
    const classSelections = nextSelections.length > 0 ? nextSelections : INITIAL_CLASS_SELECTIONS;
    const hasRolls = decoded.rolls.length > 0;

    return {
      classSelections,
      conModifier: decoded.conMod,
      tough: decoded.tough,
      hillDwarf: decoded.hillDwarf,
      activeTab: hasRolls ? ("rolled" as const) : ("average" as const),
      rolledValues: hasRolls
        ? decoded.rolls.map((entry) => entry.value)
        : generateRolledValues(classSelections),
    };
  } catch {
    return fallback;
  }
}

export function HpCalculator() {
  const initialState = useMemo(() => getInitialHpState(), []);
  const [classSelections, setClassSelections] = useState<ClassSelection[]>(initialState.classSelections);
  const [conModifier, setConModifier] = useState(initialState.conModifier);
  const [tough, setTough] = useState(initialState.tough);
  const [hillDwarf, setHillDwarf] = useState(initialState.hillDwarf);
  const [activeTab, setActiveTab] = useState<"average" | "rolled">(initialState.activeTab);
  const [rolledValues, setRolledValues] = useState<number[]>(initialState.rolledValues);
  const [copied, setCopied] = useState(false);

  const addClassSelection = () => {
    const newId = (Math.max(...classSelections.map((c) => parseInt(c.id)), 0) + 1).toString();
    const availableClass = hpClassOptions.find(name => !classSelections.some(c => c.className === name)) || "Wizard";

    const nextSelections = [
      ...classSelections,
      { id: newId, className: availableClass, level: 1 },
    ];
    setClassSelections(nextSelections);
    setRolledValues(generateRolledValues(nextSelections));
  };

  const removeClassSelection = (id: string) => {
    if (classSelections.length > 1) {
      const nextSelections = classSelections.filter((c) => c.id !== id);
      setClassSelections(nextSelections);
      setRolledValues(generateRolledValues(nextSelections));
    }
  };

  const updateClassSelection = (
    id: string,
    field: "className" | "level" | "customHitDie",
    value: string | number
  ) => {
    const nextSelections = classSelections.map((c) =>
        c.id === id
          ? field === "className"
            ? {
                ...c,
                className: value as string,
                customHitDie:
                  value === CUSTOM_CLASS_NAME
                    ? (c.customHitDie ?? CUSTOM_HIT_DIE_OPTIONS[0])
                    : undefined,
              }
            : { ...c, [field]: value }
          : c
    );
    setClassSelections(nextSelections);
    setRolledValues(generateRolledValues(nextSelections));
  };

  const result = useMemo(
    () => calculateHP(classSelections, conModifier, tough, hillDwarf, true),
    [classSelections, conModifier, tough, hillDwarf]
  );
  const rolledResult = useMemo(
    () => calculateHP(classSelections, conModifier, tough, hillDwarf, false, rolledValues),
    [classSelections, conModifier, tough, hillDwarf, rolledValues]
  );

  const diff = rolledResult.totalHP - result.totalHP;
  const threshold = Math.abs(conModifier) + (tough ? 2 : 0) + (hillDwarf ? 1 : 0);

  let rollColorClass = "text-muted-foreground";
  let rollIcon = null;

  if (diff > threshold) {
    rollColorClass = "text-[#00c93cff] dark:text-[#10ff58ff]";
    rollIcon = <span className="absolute -right-5 top-0 text-[18px]">▲</span>;
  } else if (diff < -threshold) {
    rollColorClass = "text-[#ff3d3d]";
    rollIcon = <span className="absolute -right-5 top-1 text-[18px]">▼</span>;
  }

  const handleRollAgain = () => {
    setActiveTab("rolled");
    setRolledValues(generateRolledValues(classSelections));
  };

  const buildShareableCoreData = (): string => {
    const encodedRolls =
      activeTab === "rolled"
        ? buildRollEntries(classSelections, rolledValues)
        : undefined;

    return buildCoreData({
      classes: classSelectionsToClassInput(classSelections),
      conMod: conModifier,
      tough,
      hillDwarf,
      rolls: encodedRolls,
    });
  };

  const handleShareLink = async () => {
    const shareUrl = new URL(window.location.href);
    shareUrl.search = "";
    shareUrl.searchParams.set("core", buildShareableCoreData());

    try {
      await navigator.clipboard.writeText(shareUrl.toString());
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      // If clipboard permissions are blocked, fail quietly.
    }
  };

  return (
    <>
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">D&D 5.5e Health Calculator</h1>
          <p className="text-muted-foreground">Calculate your character's hit points based on class, level, and modifiers.</p>
        </div>
        <Button variant="outline" size="sm" onClick={handleShareLink}>
          <Share2 className="w-4 h-4 mr-2" />
          {copied ? "Shared" : "Share"}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* INPUT SECTION */}
        <div>
          <Card>
            <CardContent className=" space-y-6">
              <p className="text-xl font-semibold text-center pb-2">Class Picker</p>
              {/* Class Selections */}
              <div className="space-y-4">
                {classSelections.map((selection, index) => (
                  <div
                    key={selection.id}
                    className="flex items-end gap-3"
                  >
                    <div className="flex-1">
                      <label className="text-xs font-medium text-muted-foreground mb-2 block">
                        Class {index + 1}
                      </label>
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
                              <SelectItem
                                key={className}
                                value={className}
                                disabled={isSelected}
                              >
                                {className}
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                    </div>

                    {selection.className === CUSTOM_CLASS_NAME && (
                      <div className="w-32 shrink-0">
                        <label className="text-xs font-medium text-muted-foreground mb-2 block">
                          Hit Die
                        </label>
                        <Select
                          value={`d${selection.customHitDie ?? CUSTOM_HIT_DIE_OPTIONS[0]}`}
                          onValueChange={(value) => {
                            if (!value) return;
                            updateClassSelection(
                              selection.id,
                              "customHitDie",
                              Number(value.replace("d", ""))
                            );
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
                      <label className="text-xs font-medium text-muted-foreground mb-2 block">
                        Level
                      </label>
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
                        className="shrink-0 mb-[1px]"
                        onClick={() => removeClassSelection(selection.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>

              {/* Add Class Button */}
              <Button
                onClick={addClassSelection}
                variant="outline"
                className="w-full"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Another Class
              </Button>

              {/* CON Modifier & Feats */}
              <div className="pt-2 border-t mt-6">
                <div className="flex items-center gap-4 mb-4 mt-4">
                  <label className="text-sm font-semibold shrink-0">
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
                      <Checkbox
                        id="tough"
                        checked={tough}
                        onCheckedChange={(checked) => setTough(checked as boolean)}
                      />
                      <Tooltip>
                        <TooltipTrigger
                          render={
                            <label
                              htmlFor="tough"
                              className="text-sm font-medium cursor-help border-b border-dashed border-muted-foreground/50"
                            >
                              Tough Origin Feat
                            </label>
                          }
                        />
                        <TooltipContent>
                          <p>+2 for each level</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="hillDwarf"
                        checked={hillDwarf}
                        onCheckedChange={(checked) => setHillDwarf(checked as boolean)}
                      />
                      <Tooltip>
                        <TooltipTrigger
                          render={
                            <label
                              htmlFor="hillDwarf"
                              className="text-sm font-medium cursor-help border-b border-dashed border-muted-foreground/50"
                            >
                              Hill Dwarf Lineage
                            </label>
                          }
                        />
                        <TooltipContent>
                          <p>Dwarven Toughness: +1 for each level</p>
                        </TooltipContent>
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
            <CardContent className="">
              <Tabs
                value={activeTab}
                onValueChange={(value) => setActiveTab(value as "average" | "rolled")}
                className="w-full"
              >
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="average">Average</TabsTrigger>
                  <TabsTrigger value="rolled">Rolled</TabsTrigger>
                </TabsList>

                <TabsContent value="average" className="mt-6 space-y-6">
                  <HpTotalDisplay total={result.totalHP} />
                  <HpBreakdown items={result.breakdown} />
                </TabsContent>

                <TabsContent value="rolled" className="mt-6 space-y-6">
                  <HpTotalDisplay
                    total={rolledResult.totalHP}
                    valueClassName={rollColorClass}
                    tooltip={`Difference from average: ${diff > 0 ? `+${diff}` : diff}`}
                    icon={rollIcon}
                  />

                  <div className="mb-2">
                    <HpBreakdown items={rolledResult.breakdown} />
                  </div>

                  <Button
                    onClick={handleRollAgain}
                    className="w-full"
                  >
                    <RotateCw className="w-4 h-4 mr-2" />
                    Roll Again
                  </Button>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
