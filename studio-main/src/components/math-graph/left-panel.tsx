
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EquationEditor } from './equation-editor';
import { SciKeyboard } from './sci-keyboard';
import { useUIStore } from '@/stores/ui-store';
import { ExampleEquations } from './example-equations';
import { Separator } from '../ui/separator';
import { useEquationStore } from '@/stores/equation-store';

export function LeftPanel() {
  const { isMobile } = useUIStore();
  const { insertText } = useEquationStore();

  return (
    <aside className="w-full md:w-96 shrink-0 border-r p-4 space-y-4 flex flex-col bg-secondary md:bg-transparent">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-base font-medium">Equation Input</CardTitle>
        </CardHeader>
        <CardContent>
          <EquationEditor 
            id="math-equation"
            placeholder="y = f(x)"
          />
          {!isMobile && (
            <>
              <Separator className="my-4" />
              <SciKeyboard onKeyClick={insertText} />
            </>
          )}
        </CardContent>
      </Card>
      
      <ExampleEquations />

      {isMobile && (
        <div className="sticky bottom-0 bg-background/95 backdrop-blur-sm py-2 -mx-4 -mb-4 mt-auto border-t">
         <div className="px-4">
            <SciKeyboard onKeyClick={insertText} />
         </div>
      </div>
      )}
    </aside>
  );
}
