
'use server';
/**
 * @fileOverview An AI flow for solving general physics problems and generating graph data.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { solveKinematicsProblem } from './solve-kinematics-flow'; // Reuse the tool

const TraceSchema = z.object({
    x: z.array(z.number()).describe("The x-coordinates for the data points."),
    y: z.array(z.number()).describe("The y-coordinates for the data points."),
    mode: z.string().describe("The plotting mode (e.g., 'lines', 'markers')."),
    name: z.string().optional().describe("The name of the trace for the legend."),
});

const PlotLayoutSchema = z.object({
    title: z.string().describe("The title of the graph."),
    xaxis: z.object({
        title: z.string().describe("The label for the x-axis.")
    }).describe("The x-axis configuration."),
    yaxis: z.object({
        title: z.string().describe("The label for the y-axis.")
    }).describe("The y-axis configuration."),
});

const PlotSchema = z.object({
    traces: z.array(TraceSchema).describe("An array of data traces to be plotted."),
    layout: PlotLayoutSchema.describe("The layout and styling of the plot."),
});

const SolvePhysicsProblemInputSchema = z.object({
  question: z.string().describe('A physics word problem.'),
});
export type SolvePhysicsProblemInput = z.infer<typeof SolvePhysicsProblemInputSchema>;

const SolvePhysicsProblemOutputSchema = z.object({
  explanation: z.string().describe("A step-by-step explanation of how the problem was solved."),
  plots: z.array(PlotSchema).optional().describe("An array of plots to be displayed."),
  equations: z.array(z.string()).optional().describe("A list of relevant equations as LaTeX strings."),
  answer: z.string().optional().describe("The final numerical answer to the question, with units.")
});
export type SolvePhysicsProblemOutput = z.infer<typeof SolvePhysicsProblemOutputSchema>;


export async function solvePhysicsProblem(input: SolvePhysicsProblemInput): Promise<SolvePhysicsProblemOutput> {
  return solvePhysicsProblemFlow(input);
}

const prompt = ai.definePrompt({
    name: 'physicsProblemTutorPrompt',
    input: { schema: SolvePhysicsProblemInputSchema },
    output: { schema: SolvePhysicsProblemOutputSchema },
    tools: [solveKinematicsProblem],
    prompt: `You are an expert physics tutor. Your role is to analyze a user's word problem, generate a step-by-step solution, and provide data to visualize the problem on a graph.

**Instructions:**

1.  **Analyze the Problem**:
    *   Read the user's question carefully: \`{{{question}}}\`.
    *   Identify the type of physics problem (e.g., 1D Kinematics, Projectile Motion, etc.).
    *   If no graph is relevant, just provide the explanation and answer.

2.  **Generate Explanation & Answer**:
    *   Provide a clear, step-by-step explanation of how to solve the problem.
    *   Calculate the final answer and include it in the \`answer\` field with appropriate units.
    *   List the key equations used in LaTeX format in the \`equations\` array.

3.  **Generate Plot Data (if applicable)**:
    *   Based on the problem type, decide which graph(s) are most appropriate. For kinematics, this might be position, velocity, and/or acceleration vs. time. For projectile motion, it would be height (y) vs. range (x).
    *   For each plot you decide to create, construct a \`Plot\` object.
    *   **Layout**:
        *   Define a clear \`title\` for the graph (e.g., "Velocity vs. Time", "Projectile Trajectory").
        *   Define the axis labels in \`xaxis.title\` and \`yaxis.title\` (e.g., "Time (s)", "Velocity (m/s)", "Range (m)", "Height (m)").
    *   **Traces**:
        *   Calculate the data points for each trace. A trace is a single line or set of points on a graph.
        *   Generate arrays of numbers for the \`x\` and \`y\` coordinates. Ensure they have the same length.
        *   Set the \`mode\` to "lines".
        *   Give the trace a \`name\` if it would be useful for a legend.
    *   **Example: Projectile Motion**:
        *   You would generate one plot.
        *   The layout would have titles like "Height (m)" for the y-axis and "Range (m)" for the x-axis.
        *   The trace would have x-points representing the horizontal distance and y-points representing the vertical height at each point in the trajectory.
    *   **Example: Multi-stage Kinematics**:
        *   You might generate up to three plots (position-time, velocity-time, acceleration-time).
        *   Each plot would have its own layout and data traces.
        *   For a multi-stage problem, you can create a single trace that spans the entire duration, with the data points calculated from the different equations for each stage.

4.  **Final Output**: Populate the \`SolvePhysicsProblemOutputSchema\` with the explanation, plots, equations, and the final answer.
`,
});

const solvePhysicsProblemFlow = ai.defineFlow(
  {
    name: 'solvePhysicsProblemFlow',
    inputSchema: SolvePhysicsProblemInputSchema,
    outputSchema: SolvePhysicsProblemOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) {
      throw new Error("The AI model could not solve this problem.");
    }
    return output;
  }
);
