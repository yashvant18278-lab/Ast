
'use server';
/**
 * @fileOverview An AI flow for explaining mathematical equations.
 *
 * - explainEquation - A function that provides a detailed explanation of a given equation.
 * - ExplainEquationInput - The input type for the explainEquation function.
 * - ExplainEquationOutput - The return type for the explainEquation function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const ExplainEquationInputSchema = z.object({
  equation: z.string().describe('The mathematical equation to be explained, e.g., "y = x^2 - 4".'),
});
export type ExplainEquationInput = z.infer<typeof ExplainEquationInputSchema>;

const ExplainEquationOutputSchema = z.object({
  explanation: z.string().describe('A detailed, easy-to-understand explanation of the equation.'),
});
export type ExplainEquationOutput = z.infer<typeof ExplainEquationOutputSchema>;

export async function explainEquation(input: ExplainEquationInput): Promise<ExplainEquationOutput> {
  return explainEquationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'explainEquationPrompt',
  input: { schema: ExplainEquationInputSchema },
  output: { schema: ExplainEquationOutputSchema },
  prompt: `You are a friendly and knowledgeable math tutor. A student has provided you with an equation and needs help understanding it.

Analyze the following equation: {{{equation}}}

Provide a clear, step-by-step explanation of the equation's properties. Your explanation should be easy for a high school student to understand. Cover the following points if applicable:
1.  **Classification**: What type of equation is it (e.g., linear, quadratic, trigonometric)?
2.  **Shape**: What is the general shape of the graph (e.g., a line, a parabola, a sine wave)?
3.  **Key Features**: Describe the key features, such as slope, y-intercept, vertex, roots (x-intercepts), asymptotes, period, and amplitude.
4.  **Transformations**: Explain how the equation is transformed from a parent function (e.g., "the '- 4' shifts the graph down by 4 units").

Keep the tone encouraging and accessible. Format the output as a single block of text.`,
});

const explainEquationFlow = ai.defineFlow(
  {
    name: 'explainEquationFlow',
    inputSchema: ExplainEquationInputSchema,
    outputSchema: ExplainEquationOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
