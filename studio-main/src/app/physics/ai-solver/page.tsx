
'use client';

import { Header } from '@/components/math-graph/header';
import { Footer } from '@/components/math-graph/footer';
import { PhysicsGraphPanel } from '@/components/physics-sim/physics-graph-panel';
import { AiSolverPanel } from '@/components/physics-sim/ai-solver-panel';
import { PhysicsStateProvider } from '@/components/physics-sim/physics-state-provider';

function AiSolverPageContent() {
  return (
    <div className="min-h-screen flex flex-col bg-secondary text-foreground transition-colors duration-300">
      <Header />
      <main className="p-4 flex-1 flex flex-col md:flex-row gap-4">
        <div className="flex-grow">
            <PhysicsGraphPanel useKinematics={false} />
        </div>
        <aside className="w-full md:w-[420px] shrink-0 space-y-4">
            <AiSolverPanel />
        </aside>
      </main>
      <Footer />
    </div>
  );
}

export default function AiSolverPage() {
    return (
        <PhysicsStateProvider>
            <AiSolverPageContent />
        </PhysicsStateProvider>
    )
}
