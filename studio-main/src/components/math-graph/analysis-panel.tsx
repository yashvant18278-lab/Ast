
'use client';

import React, { useMemo, useState } from 'react';
import { useEquationStore } from '@/stores/equation-store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { classifyEquation } from '@/lib/classifier';
import { calculateDomainAndRange, sampleExplicit } from '@/lib/math-analysis';
import { tryCompile } from '@/lib/mathEval';
import { Badge } from '../ui/badge';
import { AlertTriangle, Bot, Lightbulb } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Button } from '../ui/button';
import { Skeleton } from '../ui/skeleton';
import { explainEquation } from '@/ai/flows/explain-equation-flow';

function AnalysisDisplay({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="text-sm flex flex-col sm:flex-row sm:items-center sm:gap-4">
      <p className="font-semibold text-foreground mb-1 sm:mb-0 w-32 shrink-0">{label}</p>
      <div className="text-muted-foreground text-xs">{value}</div>
    </div>
  );
}

function AIExplanation() {
    const { input } = useEquationStore();
    const [explanation, setExplanation] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleExplain = async () => {
        setIsLoading(true);
        setError(null);
        setExplanation('');
        try {
            const result = await explainEquation({ equation: input });
            setExplanation(result.explanation);
        } catch (err: any) {
            setError('Sorry, I could not generate an explanation for this equation.');
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="space-y-4">
             <Button onClick={handleExplain} disabled={isLoading} className="w-full">
                {isLoading ? 'Thinking...' : 'Explain this Equation'}
                <Bot className="ml-2" />
            </Button>
            
            {isLoading && (
                <div className="space-y-2 pt-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                </div>
            )}

            {error && (
                 <div className="flex flex-col items-center justify-center h-full text-destructive text-sm p-4 gap-2 text-center">
                    <AlertTriangle className="w-8 h-8"/>
                    <p className="font-semibold">Error</p>
                    <p className="text-xs">{error}</p>
                </div>
            )}

            {explanation && (
                <Card className="bg-secondary p-4 text-sm whitespace-pre-wrap font-mono">
                    <p>{explanation}</p>
                </Card>
            )}

             {!explanation && !isLoading && !error && (
                <div className="text-center text-muted-foreground text-sm p-4 space-y-2">
                    <Lightbulb className="w-8 h-8 mx-auto text-accent"/>
                    <p>Click the button above to get an AI-powered explanation of the function&apos;s properties, shape, and key points.</p>
                </div>
            )}
        </div>
    )
}

export function AnalysisPanel() {
  const { normalizedExpression } = useEquationStore();

  const analysis = useMemo(() => {
    try {
      if (!normalizedExpression || normalizedExpression.trim() === '') {
        throw new Error('No equation to analyze.');
      }
      const { compiled } = tryCompile(normalizedExpression);
      const { xs, ys } = sampleExplicit(compiled, -10, 10, 0.05);
      
      const graphType = classifyEquation(normalizedExpression);
      const { domain, range } = calculateDomainAndRange(xs, ys);

      return {
        graphType,
        domain: `[${domain.min.toFixed(3)}, ${domain.max.toFixed(3)}]`,
        range: `[${range.min.toFixed(3)}, ${range.max.toFixed(3)}]`,
        error: null,
      };
    } catch (err: any) {
      return {
        graphType: 'Unclassified',
        domain: 'N/A',
        range: 'N/A',
        error: err.message,
      };
    }
  }, [normalizedExpression]);

  return (
    <aside className="w-full shrink-0 px-4 pb-4 md:pb-0 md:px-0">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-base font-medium">Equation Analysis</CardTitle>
        </CardHeader>
        <CardContent>
            <Tabs defaultValue="analysis">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="analysis">Properties</TabsTrigger>
                    <TabsTrigger value="ai">AI Explanation</TabsTrigger>
                </TabsList>
                <TabsContent value="analysis" className="mt-4">
                    {analysis.error ? (
                        <div className="flex flex-col items-center justify-center h-full text-destructive text-sm p-4 gap-2 text-center">
                            <AlertTriangle className="w-8 h-8"/>
                            <p className="font-semibold">Could not analyze</p>
                            <p className="text-xs">{analysis.error}</p>
                        </div>
                    ) : (
                        <div className="space-y-4 p-1">
                            <AnalysisDisplay
                                label="Graph Type"
                                value={<Badge variant="secondary">{analysis.graphType}</Badge>}
                            />
                            <AnalysisDisplay label="Domain & Range" value={
                                <>
                                    <p>Domain: {analysis.domain}</p>
                                    <p>Range: {analysis.range}</p>
                                </>
                            } />
                        </div>
                    )}
                </TabsContent>
                <TabsContent value="ai" className="mt-4">
                    <AIExplanation />
                </TabsContent>
            </Tabs>
        </CardContent>
      </Card>
    </aside>
  );
}
