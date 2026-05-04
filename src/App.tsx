import { useState } from "react";
import { Plus, Trash2, RotateCw } from "lucide-react";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  const [rolledKey, setRolledKey] = useState(0); // Force recalculation when rolling

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
    <div className="min-h-screen bg-linear-to-br from-slate-900 to-slate-800 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8 text-center">
          D&D HP Calculator
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* INPUT SECTION */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">INPUT</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Class Selections */}
              <div className="space-y-4">
                {classSelections.map((selection, index) => (
                  <div
                    key={selection.id}
                    className="space-y-3 p-4 bg-slate-700 rounded-lg"
                  >
                    <div className="flex justify-between items-start">
                      <span className="text-sm font-semibold text-slate-300">
                        Class {index + 1}
                      </span>
                      {classSelections.length > 1 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeClassSelection(selection.id)}
                          className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-slate-400 mb-1 block">
                          Class
                        </label>
                        <Select
                          value={selection.className}
                          onValueChange={(value) =>
                            value && updateClassSelection(selection.id, "className", value)
                          }
                        >
                          <SelectTrigger className="bg-slate-600 border-slate-500 text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-slate-600 border-slate-500">
                            {classNames.map((className) => (
                              <SelectItem
                                key={className}
                                value={className}
                                className="text-white hover:bg-slate-500"
                              >
                                {className}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <label className="text-xs text-slate-400 mb-1 block">
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
                          className="bg-slate-600 border-slate-500 text-white"
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
                className="w-full border-slate-500 text-slate-300 hover:bg-slate-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Another Class
              </Button>

              {/* CON Modifier */}
              <div>
                <label className="text-sm font-semibold text-slate-300 mb-2 block">
                  CON Modifier
                </label>
                <Input
                  type="number"
                  value={conModifier}
                  onChange={(e) => setConModifier(parseInt(e.target.value) || 0)}
                  className="bg-slate-600 border-slate-500 text-white"
                />
              </div>

              {/* Checkboxes */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="tough"
                    checked={tough}
                    onCheckedChange={(checked) =>
                      setTough(checked as boolean)
                    }
                    className="border-slate-400"
                  />
                  <label
                    htmlFor="tough"
                    className="text-sm font-medium text-slate-300 cursor-pointer"
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
                    className="border-slate-400"
                  />
                  <label
                    htmlFor="highElf"
                    className="text-sm font-medium text-slate-300 cursor-pointer"
                  >
                    High Elf
                  </label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* OUTPUT SECTION */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">OUTPUT</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="average" className="w-full">
                <TabsList className="grid w-full grid-cols-2 bg-slate-700">
                  <TabsTrigger value="average" className="text-slate-300">
                    Average
                  </TabsTrigger>
                  <TabsTrigger value="rolled" className="text-slate-300">
                    Rolled
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="average" className="mt-6 space-y-6">
                  <div className="bg-slate-700 rounded-lg p-6">
                    <div className="text-center">
                      <div className="text-5xl font-bold text-emerald-400 mb-4">
                        {result.totalHP}
                      </div>
                      <div className="text-sm text-slate-400 font-semibold mb-4">
                        Total HP
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-700 rounded-lg p-4">
                    <div className="text-xs font-semibold text-slate-400 mb-3">
                      Breakdown:
                    </div>
                    <pre className="text-xs text-slate-300 whitespace-pre-wrap font-mono">
                      {result.breakdown}
                    </pre>
                  </div>
                </TabsContent>

                <TabsContent value="rolled" className="mt-6 space-y-6" key={rolledKey}>
                  <div className="bg-slate-700 rounded-lg p-6">
                    <div className="text-center">
                      <div className="text-5xl font-bold text-emerald-400 mb-4">
                        {rolledResult.totalHP}
                      </div>
                      <div className="text-sm text-slate-400 font-semibold mb-4">
                        Total HP
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-700 rounded-lg p-4">
                    <div className="text-xs font-semibold text-slate-400 mb-3">
                      Breakdown:
                    </div>
                    <pre className="text-xs text-slate-300 whitespace-pre-wrap font-mono">
                      {rolledResult.breakdown}
                    </pre>
                  </div>

                  <Button
                    onClick={handleRollAgain}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
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
  );
}
