
'use client';

import { create } from 'zustand';
import * as math from 'mathjs';
import { getActiveTextarea, insertTextInInput } from '@/lib/editor-utils';
import { normalizeExpression } from '@/lib/math-utils';
import { createStore, useStore } from 'zustand';
import { useContext, createContext } from 'react';
import type { PlotData as PlotlyPlotData, Layout } from 'plotly.js';

type GraphType = 'position' | 'velocity' | 'acceleration';
type SimulationMode = 'kinematics' | 'equation' | 'multistage';
type StageType = 'kinematics' | 'equation';
type EquationType = 'position' | 'velocity' | 'acceleration';


interface KinematicsParams {
  initialPosition: number;
  initialVelocity: number;
  acceleration: number;
}

interface MotionStage {
  id: string;
  type: StageType;
  duration: number;
  // For 'kinematics' type
  initialVelocity?: number;
  acceleration?: number;
  // For 'equation' type
  equation: string;
  equationType: EquationType;
  error?: string | null;
}

interface MotionSummary {
    displacement: number;
    totalDistance: number;
    finalVelocity: number;
}

interface KinematicsPlot {
  traces: Array<Partial<PlotlyPlotData>>;
  layout?: Partial<Layout>;
}

interface KinematicsState {
  params: KinematicsParams;
  equation: {
    input: string;
    error: string | null;
    variable: string;
    type: EquationType;
  };
  stages: MotionStage[];
  mode: SimulationMode;
  visibleGraphs: {
    position: boolean;
    velocity: boolean;
    acceleration: boolean;
  };
  simulationTime: number;
  plotData: KinematicsPlot[] | null;
  summary: MotionSummary;
  setMode: (mode: SimulationMode) => void;
  setParams: (newParams: Partial<KinematicsParams>) => void;
  setEquationInput: (input: string) => void;
  setEquationType: (type: EquationType) => void;
  toggleGraphVisibility: (graph: GraphType) => void;
  setSimulationTime: (time: number) => void;
  insertEquationText: (text: string) => void;
  // Multi-stage actions
  addStage: () => void;
  removeStage: (id: string) => void;
  updateStage: (id: string, updates: Partial<MotionStage>) => void;
  setActiveTextarea: (id: string | null) => void;
  activeTextareaId: string | null;
}

const defaultParams = { initialPosition: 0, initialVelocity: 0, acceleration: 9.8 };

// This function only handles differentiation
const getFunctionsFromEquation = (input: string, type: EquationType) => {
    const node = math.parse(input || "0");
    const symbols = (node as any).filter((n: any) => n.isSymbolNode && !['pi', 'e'].includes(n.name)).map((n: any) => n.name);
    const independentVar = symbols[0] || 't';

    let posExpr: math.MathNode, velExpr: math.MathNode, accExpr: math.MathNode;

    switch(type) {
        case 'position':
            posExpr = node;
            velExpr = math.derivative(posExpr, independentVar);
            accExpr = math.derivative(velExpr, independentVar);
            break;
        case 'velocity':
            velExpr = node;
            accExpr = math.derivative(velExpr, independentVar);
            posExpr = math.parse("0"); // Placeholder, will be numerically integrated
            break;
        case 'acceleration':
            accExpr = node;
            velExpr = math.parse("0"); // Placeholder, will be numerically integrated
            posExpr = math.parse("0"); // Placeholder, will be numerically integrated
            break;
    }

    return {
        posFunc: posExpr.compile(),
        velFunc: velExpr.compile(),
        accFunc: accExpr.compile(),
        independentVar,
    }
}


const updateCalculations = (state: KinematicsState): { plotData: KinematicsPlot[] | null; summary: MotionSummary } => {
    const { mode, params, equation, stages, visibleGraphs, simulationTime } = state;
    
    let posData: number[] = [], velData: number[] = [], accData: number[] = [], timeData: number[] = [];
    let lastPos = params.initialPosition;
    let lastVel = params.initialVelocity; 
    let cumulativeTime = 0;
    
    try {
        if (mode === 'multistage' && stages.length > 0) {
             for (const stage of stages) {
                if (stage.duration <= 0) continue;
                const numPoints = Math.max(2, Math.round(stage.duration * 50));
                const dt = stage.duration / (numPoints -1);

                if (stage.type === 'kinematics') {
                    const v0 = stage.initialVelocity !== undefined ? stage.initialVelocity : lastVel;
                    const a = stage.acceleration !== undefined ? stage.acceleration : 0;
                    
                    for (let i = 0; i < numPoints; i++) {
                        const t = i * dt;
                        timeData.push(cumulativeTime + t);
                        posData.push(lastPos + v0 * t + 0.5 * a * t*t);
                        velData.push(v0 + a * t);
                        accData.push(a);
                    }
                    lastPos += v0 * stage.duration + 0.5 * a * stage.duration*stage.duration;
                    lastVel = v0 + a * stage.duration;

                } else if (stage.type === 'equation' && stage.equation) {
                    const { posFunc, velFunc, accFunc, independentVar } = getFunctionsFromEquation(stage.equation, stage.equationType);
                    let currentPos = lastPos;
                    let currentVel = lastVel;
                   
                    for (let i = 0; i < numPoints; i++) {
                        const t_stage = i * dt; // time within the stage
                        timeData.push(cumulativeTime + t_stage);
                        
                        let a_val: number, v_val: number, p_val: number;
                        
                        const scope = {[independentVar]: t_stage};

                        switch(stage.equationType) {
                            case 'acceleration':
                                a_val = accFunc.evaluate(scope);
                                currentVel += a_val * dt;
                                currentPos += currentVel * dt;
                                v_val = currentVel;
                                p_val = currentPos;
                                break;
                            case 'velocity':
                                v_val = velFunc.evaluate(scope);
                                a_val = accFunc.evaluate(scope);
                                currentPos += v_val * dt;
                                p_val = currentPos;
                                break;
                            case 'position':
                                // Equation is absolute position for the stage, so we need an offset
                                const initialStagePos = posFunc.evaluate({[independentVar]: 0});
                                p_val = lastPos + (posFunc.evaluate(scope) - initialStagePos);
                                v_val = velFunc.evaluate(scope);
                                a_val = accFunc.evaluate(scope);
                                break;
                        }

                        posData.push(p_val);
                        velData.push(v_val);
                        accData.push(a_val);
                    }
                    lastPos = posData[posData.length-1];
                    lastVel = velData[velData.length-1];
                }
                cumulativeTime += stage.duration;
            }
        } else {
             const numPoints = Math.max(2, Math.round(simulationTime * 50));
             const dt = simulationTime / (numPoints - 1);
             let currentPos = params.initialPosition;
             let currentVel = params.initialVelocity;

            if (mode === 'equation' && equation.input) {
                const { posFunc, velFunc, accFunc, independentVar } = getFunctionsFromEquation(equation.input, equation.type);
                
                for (let i = 0; i < numPoints; i++) {
                    const t = i * dt;
                    const scope = { [independentVar]: t };
                    timeData.push(t);

                    let a_val: number, v_val: number, p_val: number;

                    switch(equation.type) {
                      case 'acceleration':
                        a_val = accFunc.evaluate(scope);
                        if(i > 0) { // prevent double counting initial velocity
                           currentVel += a_val * dt;
                           currentPos += currentVel * dt;
                        }
                        v_val = currentVel;
                        p_val = currentPos;
                        break;
                      case 'velocity':
                        v_val = velFunc.evaluate(scope);
                        a_val = accFunc.evaluate(scope);
                         if(i > 0) {
                           currentPos += v_val * dt;
                         }
                        p_val = currentPos;
                        break;
                      case 'position':
                        p_val = params.initialPosition + posFunc.evaluate(scope);
                        v_val = params.initialVelocity + velFunc.evaluate(scope);
                        a_val = accFunc.evaluate(scope);
                        break;
                    }
                    posData.push(p_val);
                    velData.push(v_val);
                    accData.push(a_val);
                }

            } else { // Kinematics mode
                const { initialPosition: x0, initialVelocity: v0, acceleration: a } = params;
                for (let i = 0; i < numPoints; i++) {
                    const t = i * dt;
                    timeData.push(t);
                    posData.push(x0 + v0*t + 0.5*a*t*t);
                    velData.push(v0 + a*t);
                    accData.push(a);
                }
            }
        }

        const plots: KinematicsPlot[] = [];
        
        if (visibleGraphs.position) plots.push({
            traces: [{ x: timeData, y: posData, type: 'scatter', mode: 'lines', name: 'Position'}],
            layout: { title: 'Position vs. Time', xaxis: { title: 'Time (s)' }, yaxis: { title: 'Position (m)'}}
        });
        if (visibleGraphs.velocity) plots.push({
            traces: [{ x: timeData, y: velData, type: 'scatter', mode: 'lines', name: 'Velocity'}],
            layout: { title: 'Velocity vs. Time', xaxis: { title: 'Time (s)' }, yaxis: { title: 'Velocity (m/s)'}}
        });
        if (visibleGraphs.acceleration) plots.push({
            traces: [{ x: timeData, y: accData, type: 'scatter', mode: 'lines', name: 'Acceleration'}],
            layout: { title: 'Acceleration vs. Time', xaxis: { title: 'Time (s)' }, yaxis: { title: 'Acceleration (m/s²)'}}
        });

        const displacement = (posData[posData.length - 1] ?? 0) - (posData[0] ?? 0);
        let totalDistance = 0;
        for (let i = 1; i < posData.length; i++) {
            totalDistance += Math.abs(posData[i] - posData[i-1]);
        }
        const finalVelocity = velData[velData.length - 1] ?? 0;

        return {
            plotData: plots,
            summary: {
                displacement: isFinite(displacement) ? displacement : 0,
                totalDistance: isFinite(totalDistance) ? totalDistance : 0,
                finalVelocity: isFinite(finalVelocity) ? finalVelocity : 0
            }
        };

    } catch (e) {
        console.error("Calculation Error:", e);
        return { 
            plotData: state.plotData, // Keep old plot data on error
            summary: state.summary 
        };
    }
};

const triggerUpdate = (get: any, set: any) => {
    const newState = updateCalculations(get());
    set(newState);
};

export const createKinematicsStore = () => createStore<KinematicsState>((set, get) => ({
    params: defaultParams,
    equation: { input: '10*t - 4.9*t^2', error: null, variable: 't', type: 'position' },
    stages: [],
    mode: 'kinematics',
    visibleGraphs: { position: true, velocity: true, acceleration: false },
    simulationTime: 10,
    plotData: null,
    summary: { displacement: 0, totalDistance: 0, finalVelocity: 0 },
    activeTextareaId: null,

    setMode: (mode) => {
        set({ mode });
        triggerUpdate(get, set);
    },
    setParams: (newParams) => {
        set((state) => ({ params: { ...state.params, ...newParams } }));
        triggerUpdate(get, set);
    },
    setEquationInput: (input) => {
        if (!input) {
            set((state) => ({ equation: { ...state.equation, input: '', error: null } }));
            triggerUpdate(get, set);
            return;
        }
        try {
            const normalized = normalizeExpression(input);
            const node = math.parse(normalized);
            const symbols = (node as any).filter((n: any) => n.isSymbolNode && !['pi', 'e'].includes(n.name)).map((n: any) => n.name);
            set(state => ({ equation: { ...state.equation, input, error: null, variable: symbols[0] || 't' } }));
            triggerUpdate(get, set);
        } catch (e: any) {
            set((state) => ({ equation: { ...state.equation, input, error: e.message } }));
        }
    },
    setEquationType: (type) => {
        set(state => ({ equation: { ...state.equation, type } }));
        triggerUpdate(get, set);
    },
    toggleGraphVisibility: (graph) => {
        set((state) => ({ visibleGraphs: { ...state.visibleGraphs, [graph]: !state.visibleGraphs[graph] } }));
        triggerUpdate(get, set);
    },
    setSimulationTime: (time) => {
        set({ simulationTime: time });
        triggerUpdate(get, set);
    },
    insertEquationText: (text: string) => {
        const { activeTextareaId, stages } = get();
        if (!activeTextareaId) return;

        const textarea = document.getElementById(activeTextareaId) as HTMLTextAreaElement | null;
        if (!textarea) return;

        if (activeTextareaId.startsWith('stage-equation-')) {
            const stageId = activeTextareaId.replace('stage-equation-', '');
            const stage = stages.find(s => s.id === stageId);
            if (!stage) return;
            
            const { newText, cursorPos } = insertTextInInput(stage.equation, text, textarea);
            get().updateStage(stageId, { equation: newText });

            requestAnimationFrame(() => {
                textarea.selectionStart = textarea.selectionEnd = cursorPos;
                textarea.focus();
            });

        } else { // Custom equation tab
            const { newText, cursorPos } = insertTextInInput(get().equation.input, text, textarea);
            get().setEquationInput(newText);

            requestAnimationFrame(() => {
                textarea.selectionStart = textarea.selectionEnd = cursorPos;
                textarea.focus();
            });
        }
    },
    addStage: () => {
        set(state => ({
            stages: [...state.stages, {
                id: `stage-${Date.now()}`,
                type: 'kinematics',
                duration: 5,
                acceleration: 0,
                initialVelocity: undefined,
                equation: '',
                equationType: 'position'
            }]
        }));
        triggerUpdate(get, set);
    },
    removeStage: (id) => {
        set(state => ({ stages: state.stages.filter(s => s.id !== id) }));
        triggerUpdate(get, set);
    },
    updateStage: (id, updates) => {
        let error: string | null = null;
        if (updates.equation) {
            try {
                math.parse(updates.equation);
            } catch(e: any) {
                error = e.message;
            }
        }

        set(state => ({
            stages: state.stages.map(s => s.id === id ? { ...s, ...updates, error } : s)
        }));

        if(!error) {
           triggerUpdate(get, set);
        }
    },
    setActiveTextarea: (id) => {
        set({ activeTextareaId: id });
    },
}));


export const KinematicsContext = createContext<ReturnType<typeof createKinematicsStore> | null>(null);

export function useKinematicsStore(): KinematicsState;
export function useKinematicsStore<T>(selector: (state: KinematicsState) => T, equalityFn?: (a: T, b: T) => boolean): T;
export function useKinematicsStore<T>(selector?: (state: KinematicsState) => T, equalityFn?: (a: T, b: T) => boolean) {
    const store = useContext(KinematicsContext);
    if (!store) {
        throw new Error('useKinematicsStore must be used within a KinematicsProvider');
    }
    return useStore(store, selector!, equalityFn);
}
