
import { z } from 'genkit';

// Define the schema for known variables
export const KinematicsVariablesSchema = z.object({
  displacement: z.number().optional().describe('Displacement (Δx) in meters'),
  initialVelocity: z.number().optional().describe('Initial velocity (v₀) in m/s'),
  finalVelocity: z.number().optional().describe('Final velocity (v) in m/s'),
  acceleration: z.number().optional().describe('Acceleration (a) in m/s²'),
  time: z.number().optional().describe('Time (t) in seconds'),
});

// Define the input for the solver tool
export const KinematicsSolverInputSchema = z.object({
  knowns: KinematicsVariablesSchema.describe('An object of the known variables.'),
  unknown: z.enum(['displacement', 'initialVelocity', 'finalVelocity', 'acceleration', 'time']).describe('The single variable to solve for.'),
});

export const SolveKinematicsInputSchema = z.object({
  question: z.string().describe('A physics word problem related to 1D motion.'),
});
export type SolveKinematicsInput = z.infer<typeof SolveKinematicsInputSchema>;

export const MotionStageSchema = z.object({
    equation: z.string().describe("The position-time equation x(t) for this specific stage."),
    startTime: z.number().describe("The absolute start time of this stage in seconds."),
    endTime: z.number().describe("The absolute end time of this stage in seconds."),
});

export const SolveKinematicsOutputSchema = z.object({
  explanation: z.string().describe("A step-by-step explanation of how the problem was solved, including the formula used and the values substituted."),
  answer: z.number().optional().describe("The final numerical answer, rounded to 2 decimal places if necessary."),
  stages: z.array(MotionStageSchema).optional().describe("An array of objects, where each object describes a single stage of the motion."),
  simulationTime: z.number().optional().describe("A reasonable time duration to run the simulation for, in seconds."),
});
export type SolveKinematicsOutput = z.infer<typeof SolveKinematicsOutputSchema>;
