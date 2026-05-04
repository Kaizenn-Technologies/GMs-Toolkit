import { useState, useEffect } from "react";
import { Plus, Trash2, RotateCw, Moon, Sun, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

function StepperInput({ value, onChange, min = -99, max = 99, className }: { value: number, onChange: (val: number) => void, min?: number, max?: number, className?: string }) {
  return (
    <div className={`flex items-center border rounded-md ${className || ""}`}>
      <Button variant="ghost" size="icon" className="h-9 w-9 shrink-0 rounded-r-none" onClick={() => onChange(Math.max(min, value - 1))}>
        <Minus className="h-4 w-4" />
      </Button>
      <Input
        type="number"
        value={value}
        onChange={(e) => {
          const val = parseInt(e.target.value);
          onChange(isNaN(val) ? 0 : Math.min(Math.max(val, min), max));
        }}
        className="h-9 w-full text-center border-0 focus-visible:ring-0 focus-visible:ring-offset-0 rounded-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
      />
      <Button variant="ghost" size="icon" className="h-9 w-9 shrink-0 rounded-l-none" onClick={() => onChange(Math.min(max, value + 1))}>
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  )
}

export default function App() {
  const [classSelections, setClassSelections] = useState<ClassSelection[]>([
    { id: "1", className: "Wizard", level: 1 },
  ]);
  const [conModifier, setConModifier] = useState(0);
  const [tough, setTough] = useState(false);
  const [hillDwarf, setHillDwarf] = useState(false);
  const [rolledKey, setRolledKey] = useState(0);
  const [darkMode, setDarkMode] = useState(true);

  // Apply dark mode to document
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const addClassSelection = () => {
    const newId = (Math.max(...classSelections.map((c) => parseInt(c.id)), 0) + 1).toString();
    const availableClass = classNames.find(name => !classSelections.some(c => c.className === name)) || "Wizard";
    
    setClassSelections([
      ...classSelections,
      { id: newId, className: availableClass, level: 1 },
    ]);
  };

  const removeClassSelection = (id: string) => {
    if (classSelections.length > 1) {
      setClassSelections(classSelections.filter((c) => c.id !== id));
    }
  };

  const updateClassSelection = (
    id: string,
    field: "className" | "level",
    value: string | number
  ) => {
    setClassSelections(
      classSelections.map((c) =>
        c.id === id ? { ...c, [field]: value } : c
      )
    );
  };

  const result = calculateHP(classSelections, conModifier, tough, hillDwarf, true);
  const rolledResult = calculateHP(classSelections, conModifier, tough, hillDwarf, false);

  const handleRollAgain = () => {
    setRolledKey((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">D&D HP Calculator</h1>
            <p className="text-muted-foreground">Calculate your character's hit points based on class, level, and modifiers.</p>
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={toggleDarkMode}
            className="ml-auto"
          >
            {darkMode ? (
              <Sun className="w-4 h-4" />
            ) : (
              <Moon className="w-4 h-4" />
            )}
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* INPUT SECTION */}
          <div>
            {/* <h2 className="text-xl font-semibold mb-4">Input</h2> */}
            <Card>
              <CardContent className=" space-y-6">
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
                            {classNames.map((className) => {
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
                          <TooltipTrigger asChild>
                            <label
                              htmlFor="tough"
                              className="text-sm font-medium cursor-help border-b border-dashed border-muted-foreground/50"
                            >
                              Tough Origin Feat
                            </label>
                          </TooltipTrigger>
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
                          <TooltipTrigger asChild>
                            <label
                              htmlFor="hillDwarf"
                              className="text-sm font-medium cursor-help border-b border-dashed border-muted-foreground/50"
                            >
                              Hill Dwarf Lineage
                            </label>
                          </TooltipTrigger>
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
            {/* <h2 className="text-xl font-semibold mb-4">Result</h2> */}
            <Card>
              <CardContent className="">
                <Tabs defaultValue="average" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="average">Average</TabsTrigger>
                    <TabsTrigger value="rolled">Rolled</TabsTrigger>
                  </TabsList>

                  <TabsContent value="average" className="mt-6 space-y-6">
                    <div className="border  p-6">
                      <div className="text-center">
                        <div className="text-5xl font-bold mb-2">
                          {result.totalHP}
                        </div>
                        <div className="text-sm text-muted-foreground font-medium">
                          Total HP
                        </div>
                      </div>
                    </div>

                    <div className="border  p-4">
                      <div className="text-xs font-semibold text-muted-foreground mb-3">
                        Breakdown:
                      </div>
                      <div className="text-xs font-mono bg-muted p-3 space-y-1">
                        <TooltipProvider delay={100}>
                          {result.breakdown.map((item, idx) => (
                            <div key={idx} className="flex flex-col lg:flex-row">
                              <span className="pr-2 flex-shrink-0">{item.label}:</span>
                              <Tooltip>
                                <TooltipTrigger className="cursor-help hover:text-foreground text-muted-foreground transition-colors text-left border-b border-dashed border-muted-foreground/50">
                                  {item.value}
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>{item.tooltip}</p>
                                </TooltipContent>
                              </Tooltip>
                            </div>
                          ))}
                        </TooltipProvider>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="rolled" className="mt-6 space-y-6" key={rolledKey}>
                    <div className="border  p-6">
                      <div className="text-center">
                        <div className="text-5xl font-bold mb-2">
                          {rolledResult.totalHP}
                        </div>
                        <div className="text-sm text-muted-foreground font-medium">
                          Total HP
                        </div>
                      </div>
                    </div>

                    <div className="border  p-4">
                      <div className="text-xs font-semibold text-muted-foreground mb-3">
                        Breakdown:
                      </div>
                      <div className="text-xs font-mono bg-muted p-3 space-y-1">
                        <TooltipProvider delay={100}>
                          {rolledResult.breakdown.map((item, idx) => (
                            <div key={idx} className="flex flex-col lg:flex-row">
                              <span className="pr-2 flex-shrink-0">{item.label}:</span>
                              <Tooltip>
                                <TooltipTrigger className="cursor-help hover:text-foreground text-muted-foreground transition-colors text-left border-b border-dashed border-muted-foreground/50">
                                  {item.value}
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>{item.tooltip}</p>
                                </TooltipContent>
                              </Tooltip>
                            </div>
                          ))}
                        </TooltipProvider>
                      </div>
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
      </div>
    </div>
  );
}
