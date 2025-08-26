
'use client';

import React, { useMemo, useState } from 'react';
import { useEquationStore } from '@/stores/equation-store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { classifyEquation } from '@/lib/classifier';
import { calculateDomainAndRange, sampleExplicit } from '@/lib/math-analysis';
import { tryCompile } from '@/lib/mathEval';
import { Badge } from '../ui/badge';
import { AlertTriangle } from 'lucide-react';

function AnalysisDisplay({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="text-sm flex flex-col sm:flex-row sm:items-center sm:gap-4">
      <p className="font-semibold text-foreground mb-1 sm:mb-0 w-32 shrink-0">{label}</p>
      <div className="text-muted-foreground text-xs">{value}</div>
    </div>
  );
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
        </CardContent>
      </Card>
    </aside>
  );
}
