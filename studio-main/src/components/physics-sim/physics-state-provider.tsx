
'use client';

import { usePhysicsStore } from '@/stores/physics-store';
import React, { useEffect } from 'react';

export function PhysicsStateProvider({ children }: { children: React.ReactNode }) {
  const { setAiQuestion, setAiResponse, setPlotData } = usePhysicsStore();

  useEffect(() => {
    // Reset AI solver state on mount
    setAiResponse(null);
    setPlotData(null);
  }, [setAiResponse, setPlotData]);

  return <>{children}</>;
}
