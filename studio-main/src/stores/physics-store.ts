
'use client';

import { create } from 'zustand';
import type { SolvePhysicsProblemOutput } from '@/ai/flows/solve-physics-problem-flow';

type PlotData = SolvePhysicsProblemOutput['plots'];

interface AiSolverState {
    aiQuestion: string;
    aiIsLoading: boolean;
    aiResponse: (SolvePhysicsProblemOutput & { error?: string }) | null;
    plotData: PlotData | null;
    setAiQuestion: (question: string) => void;
    setAiIsLoading: (isLoading: boolean) => void;
    setAiResponse: (response: (SolvePhysicsProblemOutput & { error?: string }) | null) => void;
    setPlotData: (plotData: PlotData | null) => void;
}

export const usePhysicsStore = create<AiSolverState>((set) => ({
  // AI Solver State
  aiQuestion: 'A ball is thrown from the ground with an initial velocity of 25 m/s at an angle of 30 degrees. Find the maximum height and the total range.',
  aiIsLoading: false,
  aiResponse: null,
  plotData: null,
  setAiQuestion: (question) => set({ aiQuestion: question }),
  setAiIsLoading: (isLoading) => set({ aiIsLoading: isLoading }),
  setAiResponse: (response) => set({ aiResponse: response }),
  setPlotData: (plotData) => set({ plotData: plotData }),
}));
