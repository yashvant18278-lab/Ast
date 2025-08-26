
'use client';

import { useEffect, useRef, useState } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import { useEquationStore } from '@/stores/equation-store';

interface EquationEditorProps {
  id: string;
  placeholder: string;
}

export function EquationEditor({ id, placeholder }: EquationEditorProps) {
  const { input, setInput } = useEquationStore();
  const previewRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (previewRef.current) {
      try {
        const katexInput = input.trim() === '' ? 'y=' : input;
        katex.render(katexInput, previewRef.current, {
          throwOnError: true,
          displayMode: true,
          macros: {
            "\\times": "\\cdot",
            "\\div": "\\frac",
          }
        });
        setError(null);
      } catch (err: any) {
        setError(err.message.replace(/KaTeX parse error: /g, ''));
        previewRef.current.innerHTML = '';
      }
    }
  }, [input]);

  return (
    <div>
      <Textarea
        id={id}
        aria-label={id}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        inputMode="none"
        autoComplete="off"
        placeholder={placeholder}
        className="resize-y bg-background focus:ring-2 focus:ring-ring text-base"
      />
      <div
        ref={previewRef}
        className="mt-2 min-h-[3.5rem] p-3 border rounded-md bg-secondary flex items-center justify-center"
        aria-live="polite"
      />
      {error && (
        <Alert variant="destructive" className="mt-2 text-xs">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Render Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}
