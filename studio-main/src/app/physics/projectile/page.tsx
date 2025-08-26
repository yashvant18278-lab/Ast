
'use client';

import { useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { Header } from '@/components/math-graph/header';
import { Footer } from '@/components/math-graph/footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { useUIStore } from '@/stores/ui-store';

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

export default function ProjectileMotionPage() {
  const { theme, isMobile } = useUIStore();
  const [initialVelocity, setInitialVelocity] = useState(25); // m/s
  const [angle, setAngle] = useState(45); // degrees
  const [gravity, setGravity] = useState(9.8); // m/s^2

  const { trajectory, timeOfFlight, maxHeight, range } = useMemo(() => {
    const angleRad = (angle * Math.PI) / 180;
    const v0x = initialVelocity * Math.cos(angleRad);
    const v0y = initialVelocity * Math.sin(angleRad);

    const timeOfFlight = (2 * v0y) / gravity;
    const maxHeight = (v0y ** 2) / (2 * gravity);
    const range = v0x * timeOfFlight;

    const tPoints = Array.from({ length: 101 }, (_, i) => (i / 100) * timeOfFlight);
    const xPoints = tPoints.map(t => v0x * t);
    const yPoints = tPoints.map(t => v0y * t - 0.5 * gravity * t ** 2);

    return {
      trajectory: { x: xPoints, y: yPoints },
      timeOfFlight,
      maxHeight,
      range,
    };
  }, [initialVelocity, angle, gravity]);
  
  const layout = {
      autosize: true,
      dragmode: 'pan',
      margin: { t: 40, r: 40, l: 60, b: 60 },
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
        title: 'Range (m)', 
        range: [0, Math.max(10, range * 1.1)], 
        zeroline: true, 
        gridcolor: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
        showspikes: true,
        spikesnap: 'cursor',
        spikedash: 'dot',
        spikecolor: theme === 'dark' ? '#A78BFA' : '#4F46E5',
      },
      yaxis: { 
        title: 'Height (m)', 
        range: [0, Math.max(10, maxHeight * 1.2)], 
        zeroline: true, 
        gridcolor: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)', 
        scaleanchor: 'x', 
        scaleratio: 1,
        showspikes: true,
        spikesnap: 'cursor',
        spikedash: 'dot',
        spikecolor: theme === 'dark' ? '#A78BFA' : '#4F46E5',
      },
      showlegend: false,
      title: 'Projectile Trajectory',
  };

  return (
    <div className="min-h-screen flex flex-col bg-secondary">
      <Header />
      <main className="p-4 flex-1 flex flex-col md:flex-row gap-4">
        <div className="flex-grow">
           <Card className="shadow-lg h-full">
            <CardContent className="p-2 h-full">
              <Plot
                data={[{
                  x: trajectory.x,
                  y: trajectory.y,
                  type: 'scatter',
                  mode: 'lines',
                  line: { color: 'hsl(var(--accent))' },
                  hovertemplate: 'Height: %{y:.2f} m<br>Range: %{x:.2f} m<extra></extra>',
                }]}
                layout={layout}
                useResizeHandler
                style={{ width: '100%', height: '100%' }}
                config={{ responsive: true, displaylogo: false, modeBarButtonsToRemove: ['select2d', 'lasso2d'] }}
              />
            </CardContent>
           </Card>
        </div>
        <aside className="w-full md:w-96 shrink-0 space-y-4">
            <Card className="shadow-lg">
                <CardHeader>
                    <CardTitle className="text-base font-medium">Projectile Controls</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <ParameterSlider label="Initial Velocity" value={initialVelocity} onChange={setInitialVelocity} min={1} max={100} step={1} unit="m/s" />
                    <ParameterSlider label="Launch Angle" value={angle} onChange={setAngle} min={0} max={90} step={1} unit="°" />
                    <ParameterSlider label="Gravity" value={gravity} onChange={setGravity} min={1} max={30} step={0.1} unit="m/s²" />
                </CardContent>
            </Card>
            <Card className="shadow-lg">
                 <CardHeader>
                    <CardTitle className="text-base font-medium">Flight Summary</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-3 gap-4 text-center text-sm">
                    <div>
                        <p className="font-semibold">Range</p>
                        <p className="text-muted-foreground">{range.toFixed(2)} m</p>
                    </div>
                     <div>
                        <p className="font-semibold">Max Height</p>
                        <p className="text-muted-foreground">{maxHeight.toFixed(2)} m</p>
                    </div>
                     <div>
                        <p className="font-semibold">Time of Flight</p>
                        <p className="text-muted-foreground">{timeOfFlight.toFixed(2)} s</p>
                    </div>
                </CardContent>
            </Card>
        </aside>
      </main>
      <Footer />
    </div>
  );
}
