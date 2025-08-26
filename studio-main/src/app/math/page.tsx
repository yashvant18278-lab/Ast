
'use client';

import { Header } from '@/components/math-graph/header';
import { LeftPanel } from '@/components/math-graph/left-panel';
import { GraphPanel } from '@/components/math-graph/graph-panel';
import { Footer } from '@/components/math-graph/footer';
import { AnalysisPanel } from '@/components/math-graph/analysis-panel';

export default function MathGraphPage() {
  return (
    <div className="min-h-screen flex flex-col bg-secondary text-foreground transition-colors duration-300">
      <Header />
      <main className="flex-1 grid grid-cols-1 md:grid-cols-[384px_1fr] gap-4">
        <LeftPanel />
        <div className="flex flex-col gap-4">
          <GraphPanel />
          <AnalysisPanel />
        </div>
      </main>
      <Footer />
    </div>
  );
}
