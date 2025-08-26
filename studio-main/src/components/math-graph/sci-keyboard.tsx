
'use client';

import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Eraser } from 'lucide-react';

const keyCategories = [
  {
    name: 'Digits',
    keys: [
      { label: '7', value: '7' }, { label: '8', value: '8' }, { label: '9', value: '9' },
      { label: '4', value: '4' }, { label: '5', value: '5' }, { label: '6', value: '6' },
      { label: '1', value: '1' }, { label: '2', value: '2' }, { label: '3', value: '3' },
      { label: '0', value: '0' }, { label: '.', value: '.' }, { icon: Eraser, value: 'backspace' }
    ],
  },
  {
    name: 'Operators',
    keys: [
      { label: '+', value: '+' }, { label: '−', value: '-' }, { label: '×', value: '*' },
      { label: '÷', value: '/' }, { label: '^', value: '^()' }, { label: 'x²', value: '^2' }, { label: '|x|', value: '||' },
      { label: '=', value: '=' },
    ],
  },
  {
    name: 'Trig/Log',
    keys: [
      { label: 'sin', value: 'sin()' }, { label: 'cos', value: 'cos()' }, { label: 'tan', value: 'tan()' },
      { label: 'log', value: 'log()' }, { label: 'ln', value: 'ln()' }, { label: 'exp', value: 'exp()' },
      { label: 'sqrt', value: 'sqrt()' },
    ],
  },
  {
    name: 'Calculus',
    keys: [
      { label: 'd/dx', value: 'd/dx ' }, { label: '∫', value: 'integral(' }, 
      { label: 'lim', value: 'lim(' },
    ]
  },
  {
    name: 'Symbols',
    keys: [
      { label: 'π', value: 'pi' }, { label: 'e', value: 'e' }, { label: '∞', value: 'Infinity' },
      { label: '≤', value: '<=' }, { label: '≥', value: '>=' }, { label: '≠', value: '!=' },
    ],
  },
  {
    name: 'Variables',
    keys: [
      { label: 'x', value: 'x' }, { label: 'y', value: 'y' }, { label: 't', value: 't' },
      { label: 'θ', value: 'theta' }, { label: 'a', value: 'a' }, { label: 'b', value: 'b' },
      { label: 'c', 'value': 'c' }, { label: 'k', value: 'k' }, { label: 'm', value: 'm' }, { label: 'n', value: 'n' },
    ],
  },
];

export function SciKeyboard({ onKeyClick }: { onKeyClick: (key: string) => void }) {
  return (
    <Tabs defaultValue="Digits" className="w-full">
      <ScrollArea className="w-full whitespace-nowrap rounded-md">
        <TabsList>
          {keyCategories.map((category) => (
            <TabsTrigger key={category.name} value={category.name}>
              {category.name}
            </TabsTrigger>
          ))}
        </TabsList>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>

      {keyCategories.map((category) => (
        <TabsContent key={category.name} value={category.name}>
          <div className="grid grid-cols-6 md:grid-cols-4 gap-2">
            {category.keys.map((key) => (
              <Button
                key={key.label || 'backspace'}
                variant="outline"
                className="text-base"
                onClick={() => onKeyClick(key.value)}
                aria-label={`Insert ${key.label || 'backspace'}`}
              >
                {key.icon ? <key.icon /> : key.label}
              </Button>
            ))}
          </div>
        </TabsContent>
      ))}
    </Tabs>
  );
}
