
'use client';

import { useKinematicsStore } from '@/stores/kinematics-store';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

function SummaryItem({ label, value, unit }: { label: string; value: number; unit: string }) {
  const displayValue = Number.isFinite(value) ? value.toFixed(2) : 'N/A';
  return (
    <div className="text-center">
      <p className="font-semibold">{label}</p>
      <p className="text-muted-foreground">
        {displayValue} {unit}
      </p>
    </div>
  );
}

export function MotionSummary() {
  const store = useKinematicsStore();
  if (!store) return null;

  const { summary } = store;

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="text-base font-medium">Motion Summary</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-3 gap-4 text-sm">
        <SummaryItem label="Displacement" value={summary.displacement} unit="m" />
        <SummaryItem label="Total Distance" value={summary.totalDistance} unit="m" />
        <SummaryItem label="Final Velocity" value={summary.finalVelocity} unit="m/s" />
      </CardContent>
    </Card>
  );
}
