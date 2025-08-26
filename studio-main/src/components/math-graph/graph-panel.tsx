
'use client';

import { useMemo } from 'react';
import dynamic from 'next/dynamic';
import { useEquationStore } from '@/stores/equation-store';
import { useUIStore } from '@/stores/ui-store';
import { Card } from '@/components/ui/card';
import { AlertTriangle, Info } from 'lucide-react';
import { tryCompile, sampleExplicit, isImplicit } from '@/lib/mathEval';
import { normalizeExpression } from '@/lib/math-utils';
import type { PlotData as PlotlyPlotData, Layout } from 'plotly.js';

const Plot = dynamic(() => import('react-plotly.js'), {
  ssr: false,
  loading: () => <div className="h-full w-full flex items-center justify-center">Loading graph...</div>,
});

export function GraphPanel() {
  const { input } = useEquationStore();
  const { theme, isMobile } = useUIStore();
  
  const normalizedExpression = useMemo(() => normalizeExpression(input), [input]);
  const isImplicitEquation = useMemo(() => isImplicit(normalizedExpression), [normalizedExpression]);

  const plotData = useMemo(() => {
    try {
      if (!normalizedExpression || normalizedExpression.trim() === '' || isImplicitEquation) {
        return { data: [], error: null };
      }
      const { compiled } = tryCompile(normalizedExpression);
      const { xs, ys } = sampleExplicit(compiled, -20, 20, 0.1);

      return {
        data: [{
          x: xs,
          y: ys,
          type: 'scatter' as const,
          mode: 'lines',
          line: { color: 'hsl(var(--primary))' },
          connectgaps: false,
          hovertemplate: 'y: %{y:.2f}<br>x: %{x:.2f}<extra></extra>',
        }] as Partial<PlotlyPlotData>[],
        error: null,
      };
    } catch (err: any) {
      return { data: [], error: err.message };
    }
  }, [normalizedExpression, theme, isImplicitEquation]);

  return (
    <section className="flex-1 p-4 flex flex-col">
      <Card className="h-[45vh] md:h-auto shadow-lg border-2 border-primary/20 relative overflow-hidden flex-grow">
        {plotData.error ? (
          <div className="flex flex-col items-center justify-center h-full text-destructive text-sm p-4 gap-2">
            <AlertTriangle className="w-8 h-8"/>
            <p className="font-semibold">Could not plot equation</p>
            <p className="text-xs text-center max-w-sm">{plotData.error}</p>
          </div>
        ) : isImplicitEquation ? (
             <div className="flex flex-col items-center justify-center h-full text-muted-foreground text-sm p-4 gap-2">
                <Info className="w-8 h-8"/>
                <p className="font-semibold">Cannot Plot Implicit Equations</p>
                <p className="text-xs text-center max-w-sm">This calculator only supports explicit functions like <code>y = x^2</code>. Equations for circles or ellipses (e.g., <code>x^2 + y^2 = 4</code>) are not supported.</p>
          </div>
        ) : (
          <Plot
            data={plotData.data}
            layout={{
              autosize: true,
              dragmode: 'pan',
              margin: { t: 40, r: 40, l: 40, b: 40 },
              paper_bgcolor: 'transparent',
              plot_bgcolor: 'transparent',
              font: {
                color: theme === 'dark' ? '#F9FAFB' : '#111827',
                family: 'Inter, sans-serif',
              },
              hovermode: 'closest',
              hoverlabel: {
                bgcolor: theme === 'dark' ? 'hsl(var(--secondary))' : 'hsl(var(--background))',
                bordercolor: 'hsl(var(--border))',
                font: {
                  color: theme === 'dark' ? '#F9FAFB' : '#111827',
                  family: 'Inter, sans-serif',
                }
              },
              xaxis: { 
                range: [-10, 10],
                zeroline: true, 
                gridcolor: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                zerolinecolor: theme === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)',
                griddash: 'dot',
                showspikes: true,
                spikesnap: 'cursor' as const,
                spikedash: 'dot',
                spikecolor: theme === 'dark' ? '#A78BFA' : '#4F46E5',
              },
              yaxis: { 
                range: [-10, 10],
                zeroline: true, 
                gridcolor: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                zerolinecolor: theme === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)',
                scaleanchor: 'x',
                scaleratio: 1,
                griddash: 'dot',
                showspikes: true,
                spikesnap: 'cursor' as const,
                spikedash: 'dot',
                spikecolor: theme === 'dark' ? '#A78BFA' : '#4F46E5',
              },
              showlegend: false,
            } as Partial<Layout>}
            useResizeHandler={true}
            style={{ width: '100%', height: '100%' }}
            config={{ 
              responsive: true, 
              displaylogo: false, 
              modeBarButtons: [['pan2d', 'zoomIn2d', 'zoomOut2d', 'resetScale2d']], 
              scrollZoom: isMobile,
            }}
          />
        )}
      </Card>
    </section>
  );
}
