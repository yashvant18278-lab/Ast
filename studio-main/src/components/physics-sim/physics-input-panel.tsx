
'use client';

import React from 'react';
import { useKinematicsStore } from '@/stores/kinematics-store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '../ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { SciKeyboard } from '../math-graph/sci-keyboard';
import { useUIStore } from '@/stores/ui-store';
import { Slider } from '../ui/slider';
import { PhysicsEquationEditor } from './physics-equation-editor';
import { Button } from '../ui/button';
import { Plus, Trash2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Alert, AlertDescription } from '../ui/alert';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';

function ParameterControl({
  label,
  value,
  min,
  max,
  step,
  unit,
  onValueChange,
  disabled = false,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
  onValueChange: (value: number) => void;
  disabled?: boolean;
}) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Label className="text-sm">{label}</Label>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            className="w-24 h-8 text-sm"
            value={value}
            onChange={(e) => onValueChange(parseFloat(e.target.value) || 0)}
            min={min}
            max={max}
            step={step}
            disabled={disabled}
          />
          <span className="text-xs text-muted-foreground w-16 text-center">{unit}</span>
        </div>
      </div>
      <Slider
        value={[value]}
        onValueChange={(v) => onValueChange(v[0])}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
      />
    </div>
  );
}


function GraphVisibilityToggles() {
    const { visibleGraphs, toggleGraphVisibility } = useKinematicsStore();
    return (
        <div className="space-y-3">
             <h3 className="text-sm font-semibold mb-4">Graph Visibility</h3>
            <div className="flex items-center space-x-2">
                <Checkbox id="pos-check" checked={visibleGraphs.position} onCheckedChange={() => toggleGraphVisibility('position')} />
                <Label htmlFor="pos-check" className="font-normal cursor-pointer">Position vs. Time</Label>
            </div>
            <div className="flex items-center space-x-2">
                <Checkbox id="vel-check" checked={visibleGraphs.velocity} onCheckedChange={() => toggleGraphVisibility('velocity')} />
                <Label htmlFor="vel-check" className="font-normal cursor-pointer">Velocity vs. Time</Label>
            </div>
            <div className="flex items-center space-x-2">
                <Checkbox id="acc-check" checked={visibleGraphs.acceleration} onCheckedChange={() => toggleGraphVisibility('acceleration')} />
                <Label htmlFor="acc-check" className="font-normal cursor-pointer">Acceleration vs. Time</Label>
            </div>
        </div>
    );
}

function MultiStageEditor() {
  const { stages, addStage, removeStage, updateStage, setActiveTextarea, insertEquationText } = useKinematicsStore();
  const { isMobile } = useUIStore();
  const [focusedInput, setFocusedInput] = React.useState<string | null>(null);

  const handleFocus = (id: string) => {
    setFocusedInput(id);
    setActiveTextarea(id);
  };
  
  return (
    <div className="space-y-4">
      <div className="space-y-4">
        {stages.map((stage, index) => (
          <Card key={stage.id} className="p-4 bg-secondary/50">
            <div className="flex justify-between items-center mb-4">
              <p className="font-semibold text-sm">Stage {index + 1}</p>
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeStage(stage.id)}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-1 space-y-2">
                  <Label className="text-xs">Duration</Label>
                  <Input type="number" value={stage.duration} onChange={e => updateStage(stage.id, { duration: parseFloat(e.target.value) || 0 })} min={0} step={0.1} className="h-8"/>
                </div>
                 <div className="flex-1 space-y-2">
                  <Label className="text-xs">Type</Label>
                   <Select value={stage.type} onValueChange={(v) => updateStage(stage.id, {type: v as any})}>
                      <SelectTrigger className="h-8">
                        <SelectValue placeholder="Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="kinematics">Kinematics</SelectItem>
                        <SelectItem value="equation">Equation</SelectItem>
                      </SelectContent>
                    </Select>
                 </div>
              </div>
              
              {stage.type === 'kinematics' ? (
                <div className="space-y-4">
                  <ParameterControl label="Initial Velocity" value={stage.initialVelocity ?? 0} onValueChange={v => updateStage(stage.id, {initialVelocity: v})} min={-100} max={100} step={1} unit="m/s" />
                  <ParameterControl label="Acceleration" value={stage.acceleration ?? 0} onValueChange={v => updateStage(stage.id, {acceleration: v})} min={-50} max={50} step={0.1} unit="m/s²" />
                </div>
              ) : (
                 <div className="space-y-4">
                   <div className="space-y-2">
                     <Label className="text-xs">Equation Type</Label>
                     <RadioGroup 
                       value={stage.equationType} 
                       onValueChange={(v) => updateStage(stage.id, { equationType: v as any })}
                       className="flex gap-4 pt-1"
                      >
                       <div className="flex items-center space-x-2">
                         <RadioGroupItem value="position" id={`stage-pos-${stage.id}`} />
                         <Label htmlFor={`stage-pos-${stage.id}`} className="text-xs font-mono">x(t)</Label>
                       </div>
                       <div className="flex items-center space-x-2">
                         <RadioGroupItem value="velocity" id={`stage-vel-${stage.id}`} />
                         <Label htmlFor={`stage-vel-${stage.id}`} className="text-xs font-mono">v(t)</Label>
                       </div>
                       <div className="flex items-center space-x-2">
                         <RadioGroupItem value="acceleration" id={`stage-acc-${stage.id}`} />
                         <Label htmlFor={`stage-acc-${stage.id}`} className="text-xs font-mono">a(t)</Label>
                       </div>
                     </RadioGroup>
                   </div>
                   <div className="space-y-2">
                    <Label className="text-xs">Equation</Label>
                    <Input
                        id={`stage-equation-${stage.id}`}
                        value={stage.equation}
                        onChange={e => updateStage(stage.id, { equation: e.target.value })}
                        onFocus={() => handleFocus(`stage-equation-${stage.id}`)}
                        placeholder="e.g., 10*t - 4.9*t^2"
                        className="font-mono text-xs"
                        inputMode="none"
                      />
                      {stage.error && <Alert variant="destructive" className="text-xs p-2 mt-1"><AlertDescription>{stage.error}</AlertDescription></Alert>}
                   </div>
                 </div>
              )}
            </div>
          </Card>
        ))}
      </div>
      <Button onClick={addStage} variant="outline" className="w-full">
        <Plus className="mr-2" /> Add Stage
      </Button>
      
      {stages.some(s => s.type === 'equation') && !isMobile && (
         <div className="pt-4">
           <SciKeyboard onKeyClick={insertEquationText} />
         </div>
      )}

      {isMobile && stages.some(s => s.type === 'equation') && (
        <div className="sticky bottom-0 bg-background/95 backdrop-blur-sm py-2 -mx-4 -mb-4 mt-auto border-t">
          <div className="px-4">
            <SciKeyboard onKeyClick={insertEquationText} />
          </div>
        </div>
      )}
    </div>
  );
}

export function PhysicsInputPanel() {
  const store = useKinematicsStore();
  if (!store) return null;

  const {
    mode,
    setMode,
    params,
    setParams,
    simulationTime,
    setSimulationTime,
    insertEquationText,
    setActiveTextarea,
    equation,
    setEquationType,
  } = store;
  
  const { isMobile } = useUIStore();

  const handleFocus = (id: string) => {
    setActiveTextarea(id);
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="text-base font-medium">Simulation Controls</CardTitle>
        <CardDescription>Adjust parameters for different simulation modes.</CardDescription>
      </CardHeader>
      <CardContent>
         <Tabs value={mode} onValueChange={(v) => setMode(v as any)} className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="kinematics">Kinematics</TabsTrigger>
                  <TabsTrigger value="equation">Custom</TabsTrigger>
                  <TabsTrigger value="multistage">Multi-Stage</TabsTrigger>
              </TabsList>
              <TabsContent value="kinematics" className="mt-4 space-y-6">
                <div className="space-y-4 p-1">
                    <ParameterControl
                      label="Initial Position"
                      value={params.initialPosition}
                      min={-100}
                      max={100}
                      step={1}
                      unit="m"
                      onValueChange={(v) => setParams({ initialPosition: v })}
                    />
                    <ParameterControl
                      label="Initial Velocity"
                      value={params.initialVelocity}
                      min={-100}
                      max={100}
                      step={1}
                      unit="m/s"
                      onValueChange={(v) => setParams({ initialVelocity: v })}
                    />
                    <ParameterControl
                      label="Acceleration"
                      value={params.acceleration}
                      min={-50}
                      max={50}
                      step={0.1}
                      unit="m/s²"
                      onValueChange={(v) => setParams({ acceleration: v })}
                    />
                     <ParameterControl
                      label="Simulation Time"
                      value={simulationTime}
                      min={1}
                      max={200}
                      step={1}
                      unit="s"
                      onValueChange={(v) => setSimulationTime(v)}
                    />
                </div>
                <Separator />
                <GraphVisibilityToggles />
              </TabsContent>
              <TabsContent value="equation" className="mt-4">
                   <div className="space-y-6">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Equation Type</Label>
                        <RadioGroup 
                          value={equation.type} 
                          onValueChange={(v) => setEquationType(v as any)}
                          className="flex gap-4 pt-1"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="position" id="eq-type-pos" />
                            <Label htmlFor="eq-type-pos" className="font-mono">x(t)</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="velocity" id="eq-type-vel" />
                            <Label htmlFor="eq-type-vel" className="font-mono">v(t)</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="acceleration" id="eq-type-acc" />
                            <Label htmlFor="eq-type-acc" className="font-mono">a(t)</Label>
                          </div>
                        </RadioGroup>
                      </div>
                      <div className="space-y-4" onFocus={() => handleFocus('physics-equation-editor')}>
                          <PhysicsEquationEditor />
                          {!isMobile && <SciKeyboard onKeyClick={insertEquationText} />}
                      </div>
                      <Separator />
                       <ParameterControl
                          label="Simulation Time"
                          value={simulationTime}
                          min={1}
                          max={200}
                          step={1}
                          unit="s"
                          onValueChange={(v) => setSimulationTime(v)}
                        />
                      <Separator />
                       <GraphVisibilityToggles />
                  </div>
                   {isMobile && (
                      <div className="sticky bottom-0 bg-background/95 backdrop-blur-sm py-2 -mx-4 -mb-4 mt-auto border-t">
                          <div className="px-4">
                              <SciKeyboard onKeyClick={insertEquationText} />
                          </div>
                      </div>
                  )}
              </TabsContent>
               <TabsContent value="multistage" className="mt-4">
                 <div className="space-y-6">
                    <ParameterControl
                        label="Global Initial Position"
                        value={params.initialPosition}
                        min={-100}
                        max={100}
                        step={1}
                        unit="m"
                        onValueChange={(v) => setParams({ initialPosition: v })}
                      />
                      <Separator />
                    <MultiStageEditor />
                    <Separator />
                    <GraphVisibilityToggles />
                 </div>
              </TabsContent>
         </Tabs>
      </CardContent>
    </Card>
  );
}
