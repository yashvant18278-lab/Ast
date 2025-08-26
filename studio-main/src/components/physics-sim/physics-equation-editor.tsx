
'use client';

import { useEffect, useRef, useState } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import { useKinematicsStore } from '@/stores/kinematics-store';
import { Label } from '../ui/label';

export function PhysicsEquationEditor() {
  const store = useKinematicsStore();
  if (!store) return null;

  const { equation, setEquationInput } = store;
  const previewRef = useRef<HTMLDivElement>(null);

  const detectedVar = equation.variable || 't';
  const displayVar = ['x', 'y', 'z'].includes(detectedVar) ? detectedVar : 'f';

  useEffect(() => {
    if (previewRef.current) {
      try {
        const katexInput = equation.input.trim() === '' ? `${displayVar}(${detectedVar}) =` : `${displayVar}(${detectedVar}) = ${equation.input}`;
        katex.render(katexInput, previewRef.current, {
          throwOnError: true,
          displayMode: true,
          macros: {
            "\\times": "\\cdot",
            "\\div": "\\frac",
          }
        });
      } catch (err: any) {
        previewRef.current.innerHTML = '';
      }
    }
  }, [equation.input, displayVar, detectedVar]);

  return (
    <div>
       <Label htmlFor="physics-equation-editor" className="text-xs text-muted-foreground">Enter an equation for position vs. time</Label>
       <Textarea
          id="physics-equation-editor"
          aria-label="physics-equation-editor"
          value={equation.input}
          onChange={(e) => setEquationInput(e.target.value)}
          autoComplete="off"
          placeholder="e.g., 10*t - 4.9*t^2"
          className="resize-y bg-background focus:ring-2 focus:ring-ring text-base mt-1 font-mono"
          inputMode="none"
        />
      <div
        ref={previewRef}
        className="mt-2 min-h-[3.5rem] p-3 border rounded-md bg-secondary flex items-center justify-center"
        aria-live="polite"
      />
      {equation.error && (
        <Alert variant="destructive" className="mt-2 text-xs">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Equation Error</AlertTitle>
            <AlertDescription>{equation.error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}
