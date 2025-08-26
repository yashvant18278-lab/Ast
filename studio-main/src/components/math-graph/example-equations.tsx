'use client';

import { useEquationStore } from '@/stores/equation-store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea, ScrollBar } from '../ui/scroll-area';

const examples = [
  { name: 'Linear', equation: 'y = 2x + 1' },
  { name: 'Quadratic', equation: 'y = x² - 4' },
  { name: 'Cubic', equation: 'y = x³ - 6x' },
  { name: 'Circle', equation: 'x² + y² = 9' },
  { name: 'Sine Wave', equation: 'y = sin(x)' },
  { name: 'Exponential', equation: 'y = exp(-x/4) * cos(pi*x)' },
  { name: 'Rational', equation: 'y = (x-1)/(x^2-4)' },
  { name: 'Tangent', equation: 'y = tan(x)' },
];

export function ExampleEquations() {
  const { setInput } = useEquationStore();

  return (
    <div className="px-4 pb-4">
        <Card className="shadow-lg">
            <CardHeader>
                <CardTitle className="text-base font-medium">Examples</CardTitle>
            </CardHeader>
            <CardContent>
                <ScrollArea className="w-full whitespace-nowrap">
                    <div className="flex w-max space-x-2">
                        {examples.map((ex) => (
                            <Button
                            key={ex.name}
                            variant="outline"
                            onClick={() => setInput(ex.equation)}
                            >
                            {ex.name}
                            </Button>
                        ))}
                    </div>
                    <ScrollBar orientation="horizontal" />
                </ScrollArea>
            </CardContent>
        </Card>
    </div>
  );
}
