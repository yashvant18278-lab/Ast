
'use server';
/**
 * @fileOverview An AI flow for solving 1D kinematics problems, including multi-stage scenarios.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import * as math from 'mathjs';
import { KinematicsSolverInputSchema, SolveKinematicsInputSchema, SolveKinematicsOutputSchema } from '../schemas/kinematics-schemas';
import type { SolveKinematicsInput, SolveKinematicsOutput } from '../schemas/kinematics-schemas';

export const solveKinematicsProblem = ai.defineTool(
  {
    name: 'solveKinematicsProblem',
    description: 'Calculates an unknown variable in a 1D kinematics problem given at least three other variables. Returns the solved value.',
    inputSchema: KinematicsSolverInputSchema,
    outputSchema: z.number(),
  },
  async ({ knowns, unknown }) => {
    const { displacement, initialVelocity, finalVelocity, acceleration, time } = knowns;

    // Equation 1: v = v₀ + at
    if (unknown === 'finalVelocity' && initialVelocity !== undefined && acceleration !== undefined && time !== undefined) {
      return initialVelocity + acceleration * time;
    }
    if (unknown === 'initialVelocity' && finalVelocity !== undefined && acceleration !== undefined && time !== undefined) {
      return finalVelocity - acceleration * time;
    }
    if (unknown === 'acceleration' && finalVelocity !== undefined && initialVelocity !== undefined && time !== undefined) {
      if (time === 0) throw new Error("Time cannot be zero for this calculation.");
      return (finalVelocity - initialVelocity) / time;
    }
    if (unknown === 'time' && finalVelocity !== undefined && initialVelocity !== undefined && acceleration !== undefined) {
        if (acceleration === 0) throw new Error("Acceleration cannot be zero for this calculation.");
        return (finalVelocity - initialVelocity) / acceleration;
    }

    // Equation 2: Δx = v₀t + ½at²
    if (unknown === 'displacement' && initialVelocity !== undefined && time !== undefined && acceleration !== undefined) {
        return initialVelocity * time + 0.5 * acceleration * time * time;
    }
    if (unknown === 'initialVelocity' && displacement !== undefined && time !== undefined && acceleration !== undefined) {
        if (time === 0) throw new Error("Time cannot be zero for this calculation.");
        return (displacement - 0.5 * acceleration * time * time) / time;
    }
    if (unknown === 'acceleration' && displacement !== undefined && initialVelocity !== undefined && time !== undefined) {
        if (time === 0) throw new Error("Time cannot be zero for this calculation.");
        return (2 * (displacement - initialVelocity * time)) / (time * time);
    }
     if (unknown === 'time' && displacement !== undefined && initialVelocity !== undefined && acceleration !== undefined) {
        if (acceleration === 0) {
            if (initialVelocity === 0) throw new Error("Cannot solve for time when acceleration and initial velocity are zero.");
            return displacement / initialVelocity;
        }
        const discriminant = initialVelocity * initialVelocity + 2 * acceleration * displacement;
        if (discriminant < 0) throw new Error("No real solution for time exists.");
        const t1 = (-initialVelocity + Math.sqrt(discriminant)) / acceleration;
        const t2 = (-initialVelocity - Math.sqrt(discriminant)) / acceleration;
        const validTimes = [t1, t2].filter(t => t >= 0);
        if (validTimes.length > 0) return Math.min(...validTimes);
        return Math.max(t1, t2);
    }

    // Equation 3: v² = v₀² + 2aΔx
     if (unknown === 'finalVelocity' && initialVelocity !== undefined && acceleration !== undefined && displacement !== undefined) {
        const result = initialVelocity * initialVelocity + 2 * acceleration * displacement;
        if (result < 0) throw new Error("Cannot calculate final velocity, results in imaginary number.");
        return Math.sqrt(result);
    }
    if (unknown === 'initialVelocity' && finalVelocity !== undefined && acceleration !== undefined && displacement !== undefined) {
        const result = finalVelocity * finalVelocity - 2 * acceleration * displacement;
        if (result < 0) throw new Error("Cannot calculate initial velocity, results in imaginary number.");
        return Math.sqrt(result);
    }
    if (unknown === 'acceleration' && finalVelocity !== undefined && initialVelocity !== undefined && displacement !== undefined) {
        if (displacement === 0) throw new Error("Displacement cannot be zero for this calculation.");
        return (finalVelocity * finalVelocity - initialVelocity * initialVelocity) / (2 * displacement);
    }
    if (unknown === 'displacement' && finalVelocity !== undefined && initialVelocity !== undefined && acceleration !== undefined) {
        if (acceleration === 0) throw new Error("Acceleration cannot be zero for this calculation.");
        return (finalVelocity * finalVelocity - initialVelocity * initialVelocity) / (2 * acceleration);
    }

    throw new Error('Not enough information to solve for the unknown variable with the provided knowns.');
  }
);

export type { SolveKinematicsInput, SolveKinematicsOutput };

export async function solveKinematics(input: SolveKinematicsInput): Promise<SolveKinematicsOutput> {
  return solveKinematicsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'kinematicsTutorPrompt',
  input: { schema: SolveKinematicsInputSchema },
  output: { schema: SolveKinematicsOutputSchema },
  tools: [solveKinematicsProblem],
  prompt: `You are an expert physics tutor specializing in 1D kinematics. Your role is to analyze a user's word problem, identify the known and unknown variables, use the provided tool to solve for the unknown, and then provide a clear, step-by-step explanation and the data needed to graph the motion.

  **Instructions:**
  1.  **Analyze the Problem**: Read the user's question carefully: \`{{{question}}}\`.
  2.  **Identify Motion Stages**: Check if the problem involves multiple distinct stages of motion (e.g., accelerates, then moves at constant velocity, then decelerates). If so, identify the number of stages.
  3.  **Process Each Stage Sequentially**:
      *   For each stage, identify the known variables (initial velocity, final velocity, acceleration, time, displacement).
      *   The initial conditions for Stage 1 (e.g., \`x0\`, \`v0\`) are taken from the problem. Assume initial position \`x0 = 0\` and initial velocity \`v0 = 0\` (from rest) if not specified.
      *   The final velocity and final position of one stage become the initial conditions for the next stage.
      *   Use the \`solveKinematicsProblem\` tool to calculate any missing variables needed for the explanation or the next stage's calculations.
  4.  **Formulate Explanation**:
      *   Provide a step-by-step explanation of the entire journey.
      *   For each stage, clearly state the knowns, the unknown being solved for, the kinematic equation used, and the result.
  5.  **Calculate Total Distance/Answer**: Sum the results (e.g., displacement) from each stage to find the final answer to the user's question. Round the final numerical answer to two decimal places.
  6.  **Construct Motion Stages Output**:
      *   Populate the \`stages\` array in the output. Each element in the array represents one stage of motion.
      *   For each stage, provide:
          *   \`equation\`: The position-time equation for that stage *relative to the absolute start time of the simulation*. For a stage starting at time \`t_start\` with initial conditions \`x_start\`, \`v_start\`, and acceleration \`a\`, the equation is: \`x(t) = x_start + v_start*(t - t_start) + 0.5*a*(t - t_start)^2\`.
          *   \`startTime\`: The absolute time when the stage begins.
          *   \`endTime\`: The absolute time when the stage ends.
      *   Example for a 2-stage problem: Stage 1 from t=0 to t=5, Stage 2 from t=5 to t=15. The output would be two objects in the \`stages\` array.
  7.  **Determine Simulation Time**: The \`simulationTime\` should be the total duration of all stages combined (the end time of the final stage).
  `,
});

const solveKinematicsFlow = ai.defineFlow(
  {
    name: 'solveKinematicsFlow',
    inputSchema: SolveKinematicsInputSchema,
    outputSchema: SolveKinematicsOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) {
      throw new Error("The AI model could not solve this problem.");
    }
    // Round the answer for clean presentation
    if (output.answer) {
      output.answer = parseFloat(math.format(output.answer, { notation: 'fixed', precision: 2 }));
    }
    return output;
  }
);
