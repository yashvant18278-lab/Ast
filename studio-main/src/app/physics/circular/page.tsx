
'use client';

import { useState, useMemo, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Header } from '@/components/math-graph/header';
import { Footer } from '@/components/math-graph/footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { useUIStore } from '@/stores/ui-store';
import { Button } from '@/components/ui/button';
import { Play, Pause } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Layout, PlotData as PlotlyPlotData } from 'plotly.js';

const Plot = dynamic(() => import('react-plotly.js'), {
  ssr: false,
  loading: () => <div className="h-full w-full flex items-center justify-center">Loading graph...</div>,
});

function ParameterSlider({ label, value, min, max, step, unit, onChange }: { label: string, value: number, min: number, max: number, step: number, unit: string, onChange: (value: number) => void }) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Label className="text-sm">{label}</Label>
        <div className="flex items-center gap-2">
          <Input type="number" className="w-24 h-8 text-sm" value={value} onChange={e => onChange(parseFloat(e.target.value) || 0)} min={min} max={max} step={step} />
          <span className="text-xs text-muted-foreground">{unit}</span>
        </div>
      </div>
      <Slider value={[value]} onValueChange={v => onChange(v[0])} min={min} max={max} step={step} />
    </div>
  );
}

export default function CircularMotionPage() {
  const { theme } = useUIStore();
  const [radius, setRadius] = useState(5); // m
  const [angularVelocity, setAngularVelocity] = useState(1); // rad/s
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(true);

  useEffect(() => {
    if (!isRunning) return;
    const interval = setInterval(() => {
      setTime(t => (t + 0.02) % (2 * Math.PI / angularVelocity * 2));
    }, 20);
    return () => clearInterval(interval);
  }, [isRunning, angularVelocity]);

  const { position, angle } = useMemo(() => {
    const currentAngle = (time * angularVelocity) % (2 * Math.PI);
    return {
      position: { x: radius * Math.cos(currentAngle), y: radius * Math.sin(currentAngle) },
      angle: currentAngle,
    };
  }, [radius, angularVelocity, time]);

  const layout: Partial<Layout> = {
      autosize: true,
      dragmode: 'pan',
      margin: { t: 40, r: 20, l: 40, b: 40 },
      paper_bgcolor: 'transparent',
      plot_bgcolor: 'transparent',
      font: { color: theme === 'dark' ? '#F9FAFB' : '#111827', family: 'Inter, sans-serif' },
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
        range: [-radius * 1.2, radius * 1.2], 
        zeroline: true, 
        showgrid: true, 
        gridcolor: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
        showspikes: true,
        spikesnap: 'cursor' as const,
        spikedash: 'dot',
        spikecolor: theme === 'dark' ? '#A78BFA' : '#4F46E5',
      },
      yaxis: { 
        range: [-radius * 1.2, radius * 1.2], 
        zeroline: true, 
        showgrid: true, 
        gridcolor: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)', 
        scaleanchor: 'x', 
        scaleratio: 1,
        showspikes: true,
        spikesnap: 'cursor' as const,
        spikedash: 'dot',
        spikecolor: theme === 'dark' ? '#A78BFA' : '#4F46E5',
      },
      showlegend: false,
      title: 'Circular Path',
  };

  const circleTrace: Partial<PlotlyPlotData> = {
      x: Array.from({length: 101}, (_, i) => radius * Math.cos(i/50 * Math.PI)),
      y: Array.from({length: 101}, (_, i) => radius * Math.sin(i/50 * Math.PI)),
      type: 'scatter' as const,
      mode: 'lines',
      line: { color: 'hsl(var(--border))', dash: 'dot' },
      hoverinfo: 'none'
  };
  
  const objectTrace: Partial<PlotlyPlotData> = {
      x: [position.x],
      y: [position.y],
      type: 'scatter' as const,
      mode: 'markers',
      marker: { color: 'hsl(var(--primary))', size: 12 },
      hovertemplate: 'x: %{x:.2f}<br>y: %{y:.2f}<extra></extra>',
  };

  return (
    <div className="min-h-screen flex flex-col bg-secondary">
      <Header />
      <main className="p-4 flex-1 flex flex-col md:flex-row gap-4">
        <div className="flex-grow">
           <Card className="shadow-lg h-full">
            <CardContent className="p-2 h-full">
              <Plot
                data={[circleTrace, objectTrace]}
                layout={layout}
                useResizeHandler
                style={{ width: '100%', height: '100%' }}
                config={{ responsive: true, displaylogo: false, staticPlot: true }}
              />
            </CardContent>
           </Card>
        </div>
        <aside className="w-full md:w-96 shrink-0 space-y-4">
            <Card className="shadow-lg">
                <CardHeader>
                    <CardTitle className="text-base font-medium">Circular Motion Controls</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <ParameterSlider label="Radius" value={radius} onChange={setRadius} min={1} max={20} step={0.5} unit="m" />
                    <ParameterSlider label="Angular Velocity" value={angularVelocity} onChange={setAngularVelocity} min={0.1} max={10} step={0.1} unit="rad/s" />
                    <div className="flex justify-center pt-2">
                        <Button onClick={() => setIsRunning(!isRunning)} size="lg" className="rounded-full w-24">
                           {isRunning ? <Pause /> : <Play />}
                           <span className="ml-2">{isRunning ? 'Pause' : 'Play'}</span>
                        </Button>
                    </div>
                </CardContent>
            </Card>
            <Card className="shadow-lg">
                 <CardHeader>
                    <CardTitle className="text-base font-medium">Motion Summary</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4 text-center text-sm">
                    <div>
                        <p className="font-semibold">Angle</p>
                        <p className="text-muted-foreground">{(angle * 180 / Math.PI).toFixed(1)}°</p>
                    </div>
                     <div>
                        <p className="font-semibold">Time</p>
                        <p className="text-muted-foreground">{time.toFixed(2)} s</p>
                    </div>
                </CardContent>
            </Card>
        </aside>
      </main>
      <Footer />
    </div>
  );
}
