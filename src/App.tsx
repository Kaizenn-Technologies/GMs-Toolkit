import { useState, useEffect } from "react";
import { Plus, Trash2, RotateCw, Moon, Sun } from "lucide-react";
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
import type { ClassSelection } from "@/types";
import { classNames } from "@/lib/classes";
import { calculateHP } from "@/lib/calculations";

export default function App() {
  const [classSelections, setClassSelections] = useState<ClassSelection[]>([
    { id: "1", className: "Wizard", level: 1 },
  ]);
  const [conModifier, setConModifier] = useState(0);
  const [tough, setTough] = useState(false);
  const [highElf, setHighElf] = useState(false);
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
    setClassSelections([
      ...classSelections,
      { id: newId, className: "Wizard", level: 1 },
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

  const result = calculateHP(classSelections, conModifier, tough, highElf, true);
  const rolledResult = calculateHP(classSelections, conModifier, tough, highElf, false);

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
            <h2 className="text-xl font-semibold mb-4">Input</h2>
            <Card>
              <CardContent className="pt-6 space-y-6">
                {/* Class Selections */}
                <div className="space-y-4">
                  {classSelections.map((selection, index) => (
                    <div
                      key={selection.id}
                      className="border rounded-lg p-4 space-y-3"
                    >
                      <div className="flex justify-between items-start">
                        <span className="text-sm font-semibold">
                          Class {index + 1}
                        </span>
                        {classSelections.length > 1 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeClassSelection(selection.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs font-medium text-muted-foreground mb-2 block">
                            Class
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
                              {classNames.map((className) => (
                                <SelectItem
                                  key={className}
                                  value={className}
                                >
                                  {className}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <label className="text-xs font-medium text-muted-foreground mb-2 block">
                            Level
                          </label>
                          <Input
                            type="number"
                            min="1"
                            max="20"
                            value={selection.level}
                            onChange={(e) =>
                              updateClassSelection(
                                selection.id,
                                "level",
                                parseInt(e.target.value) || 1
                              )
                            }
                          />
                        </div>
                      </div>
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

                {/* CON Modifier */}
                <div>
                  <label className="text-sm font-semibold mb-2 block">
                    CON Modifier
                  </label>
                  <Input
                    type="number"
                    value={conModifier}
                    onChange={(e) => setConModifier(parseInt(e.target.value) || 0)}
                  />
                </div>

                {/* Checkboxes */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="tough"
                      checked={tough}
                      onCheckedChange={(checked) =>
                        setTough(checked as boolean)
                      }
                    />
                    <label
                      htmlFor="tough"
                      className="text-sm font-medium cursor-pointer"
                    >
                      Tough
                    </label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="highElf"
                      checked={highElf}
                      onCheckedChange={(checked) =>
                        setHighElf(checked as boolean)
                      }
                    />
                    <label
                      htmlFor="highElf"
                      className="text-sm font-medium cursor-pointer"
                    >
                      High Elf
                    </label>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* OUTPUT SECTION */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Output</h2>
            <Card>
              <CardContent className="pt-6">
                <Tabs defaultValue="average" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="average">Average</TabsTrigger>
                    <TabsTrigger value="rolled">Rolled</TabsTrigger>
                  </TabsList>

                  <TabsContent value="average" className="mt-6 space-y-6">
                    <div className="border rounded-lg p-6">
                      <div className="text-center">
                        <div className="text-5xl font-bold mb-2">
                          {result.totalHP}
                        </div>
                        <div className="text-sm text-muted-foreground font-medium">
                          Total HP
                        </div>
                      </div>
                    </div>

                    <div className="border rounded-lg p-4">
                      <div className="text-xs font-semibold text-muted-foreground mb-3">
                        Breakdown:
                      </div>
                      <pre className="text-xs whitespace-pre-wrap font-mono bg-muted p-3 rounded">
                        {result.breakdown}
                      </pre>
                    </div>
                  </TabsContent>

                  <TabsContent value="rolled" className="mt-6 space-y-6" key={rolledKey}>
                    <div className="border rounded-lg p-6">
                      <div className="text-center">
                        <div className="text-5xl font-bold mb-2">
                          {rolledResult.totalHP}
                        </div>
                        <div className="text-sm text-muted-foreground font-medium">
                          Total HP
                        </div>
                      </div>
                    </div>

                    <div className="border rounded-lg p-4">
                      <div className="text-xs font-semibold text-muted-foreground mb-3">
                        Breakdown:
                      </div>
                      <pre className="text-xs whitespace-pre-wrap font-mono bg-muted p-3 rounded">
                        {rolledResult.breakdown}
                      </pre>
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
