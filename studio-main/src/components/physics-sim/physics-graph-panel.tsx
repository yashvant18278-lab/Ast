
'use client';

import dynamic from 'next/dynamic';
import React from 'react';
import { usePhysicsStore } from '@/stores/physics-store';
import { useKinematicsStore } from '@/stores/kinematics-store';
import { Card, CardContent } from '@/components/ui/card';
import { useUIStore } from '@/stores/ui-store';
import { cn } from '@/lib/utils';
import { Info } from 'lucide-react';
import type { PlotData as PlotlyPlotData, Layout } from 'plotly.js';

const Plot = dynamic(() => import('react-plotly.js'), {
  ssr: false,
  loading: () => <div className="h-full w-full flex items-center justify-center">Loading graph...</div>,
});


const ThemedGraph = React.memo(function ThemedGraph({ plot, index }: { plot: any, index: number }) {
    const { theme } = useUIStore();
    const colorKey = `--chart-${(index % 5) + 1}`;

    const layout: Partial<Layout> = {
        title: plot.layout?.title,
        autosize: true,
        margin: { t: 40, r: 20, l: 60, b: 50 },
        paper_bgcolor: 'transparent',
        plot_bgcolor: 'transparent',
        font: { color: theme === 'dark' ? '#F9FAFB' : '#111827', family: 'Inter, sans-serif' },
        dragmode: 'pan',
        hovermode: 'x unified',
        hoverlabel: {
          bgcolor: theme === 'dark' ? 'hsl(var(--secondary))' : 'hsl(var(--background))',
          bordercolor: 'hsl(var(--border))',
          font: { color: theme === 'dark' ? '#F9FAFB' : '#111827', family: 'Inter, sans-serif' }
        },
        xaxis: {
            ...plot.layout?.xaxis,
            gridcolor: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
            zerolinecolor: theme === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)',
            showspikes: true,
            spikesnap: 'cursor',
            spikedash: 'dot',
            spikecolor: theme === 'dark' ? '#A78BFA' : '#4F46E5',
        },
        yaxis: {
            ...plot.layout?.yaxis,
            gridcolor: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
            zerolinecolor: theme === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)',
            showspikes: true,
            spikesnap: 'cursor',
            spikedash: 'dot',
            spikecolor: theme === 'dark' ? '#A78BFA' : '#4F46E5',
        },
        showlegend: plot.traces.length > 1,
        legend: {
            orientation: 'h',
            yanchor: 'bottom',
            y: 1.02,
            xanchor: 'right',
            x: 1
        }
    };
    
    const traces = plot.traces.map((trace: any, traceIndex: number) => ({
        ...trace,
        type: 'scatter',
        mode: 'lines',
        line: { color: `hsl(var(--chart-${((index + traceIndex) % 5) + 1}))` },
        hovertemplate: `${plot.layout?.yaxis?.title?.text ?? 'y'}: %{y:.2f}<br>${plot.layout?.xaxis?.title?.text ?? 'x'}: %{x:.2f}<extra></extra>`,
    }));

    return (
        <Card className="h-full shadow-md flex-grow">
            <CardContent className="p-2 h-full">
                <Plot
                    data={traces as PlotlyPlotData[]}
                    layout={layout}
                    useResizeHandler={true}
                    style={{ width: '100%', height: '100%' }}
                    config={{ responsive: true, displaylogo: false, modeBarButtonsToRemove: ['select2d', 'lasso2d'] }}
                />
            </CardContent>
        </Card>
    );
});


export function PhysicsGraphPanel({ useKinematics }: { useKinematics: boolean }) {
  const { plotData: aiPlotData, aiIsLoading } = usePhysicsStore();
  const kinematicsStore = useKinematics ? useKinematicsStore() : null;
  
  const plotData = aiPlotData ?? (kinematicsStore ? kinematicsStore.plotData : null);

  if (aiIsLoading) {
      return (
          <section className="flex flex-col gap-4 flex-grow">
              <div className="flex-grow flex items-center justify-center h-full rounded-lg border-2 border-dashed bg-card p-4">
                  <div className="text-center text-muted-foreground">
                      <p className="font-semibold">Generating graphs...</p>
                  </div>
              </div>
          </section>
      )
  }

  if (!plotData || plotData.length === 0) {
      return (
        <section className="flex flex-col gap-4 flex-grow">
            <div className="flex-grow flex items-center justify-center h-full rounded-lg border-2 border-dashed bg-card p-4">
                <div className="text-center text-muted-foreground">
                    <Info className="w-10 h-10 mx-auto mb-2" />
                    <p className="font-semibold">No Graph to Display</p>
                    <p className="text-sm">Enter parameters or use the AI solver to generate graphs.</p>
                </div>
            </div>
        </section>
      );
  }

  return (
    <section className="flex flex-col gap-4 flex-grow">
        <div className={cn(
            "grid grid-cols-1 gap-4 flex-grow",
            plotData.length === 2 && "lg:grid-cols-2",
            plotData.length >= 3 && "lg:grid-rows-3",
            plotData.length > 1 && "h-[calc(100vh-150px)]"
        )}>
           {plotData.map((plot, index) => (
                <div key={index} className="min-h-0">
                    <ThemedGraph plot={plot} index={index} />
                </div>
           ))}
        </div>
    </section>
  );
}
