
'use client';

import { Header } from '@/components/math-graph/header';
import { Footer } from '@/components/math-graph/footer';
import { PhysicsInputPanel } from '@/components/physics-sim/physics-input-panel';
import { KinematicsProvider } from '@/components/physics-sim/kinematics-provider';
import { useKinematicsStore } from '@/stores/kinematics-store';
import { PhysicsGraphPanel } from '@/components/physics-sim/physics-graph-panel';
import { usePhysicsStore } from '@/stores/physics-store';
import { useEffect } from 'react';
import { MotionSummary } from '@/components/physics-sim/motion-summary';

function KinematicsPageContent() {
  const { setPlotData } = usePhysicsStore();

  useEffect(() => {
    // Clear the AI plot data when entering the kinematics page
    setPlotData(null);
  }, [setPlotData]);

  return (
    <div className="min-h-screen flex flex-col bg-secondary text-foreground transition-colors duration-300">
      <Header />
      <main className="p-4 flex-1 flex flex-col md:flex-row gap-4">
        <div className="flex-grow">
            <PhysicsGraphPanel useKinematics={true} />
        </div>
        <aside className="w-full md:w-96 shrink-0 space-y-4">
            <PhysicsInputPanel />
            <MotionSummary />
        </aside>
      </main>
      <Footer />
    </div>
  )
}

export default function KinematicsPage() {
  return (
    <KinematicsProvider>
      <KinematicsPageContent />
    </KinematicsProvider>
  );
}
