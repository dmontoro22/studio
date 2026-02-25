'use server';
/**
 * @fileOverview A Genkit flow for suggesting personalized workout variations or new routines.
 *
 * - suggestWorkoutPlan - A function that generates workout suggestions based on user history and goals.
 * - SuggestWorkoutPlanInput - The input type for the suggestWorkoutPlan function.
 * - SuggestWorkoutPlanOutput - The return type for the suggestWorkoutPlan function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const ExerciseRecordSchema = z.object({
  exerciseName: z.string().describe('Name of the exercise performed.'),
  weight: z.number().describe('Weight used for the exercise in kilograms.'),
  repetitions: z.number().describe('Number of repetitions performed.'),
  rpe: z.number().describe('Rate of Perceived Exertion (1-10).'),
  date: z.string().describe('Date when the exercise was performed (YYYY-MM-DD).'),
});

const SuggestWorkoutPlanInputSchema = z.object({
  exerciseHistory: z.array(ExerciseRecordSchema).describe('A chronological list of the user\'s past exercise records.'),
  userGoals: z.string().describe('The user\'s fitness goals (e.g., "Ganar fuerza en las piernas", "Aumentar resistencia general").'),
});
export type SuggestWorkoutPlanInput = z.infer<typeof SuggestWorkoutPlanInputSchema>;

const SuggestWorkoutPlanOutputSchema = z.object({
  suggestions: z.array(z.string()).describe('An array of detailed workout variation or new routine suggestions.'),
  rationale: z.string().describe('An explanation of why these suggestions were made based on the history and goals.'),
});
export type SuggestWorkoutPlanOutput = z.infer<typeof SuggestWorkoutPlanOutputSchema>;

export async function suggestWorkoutPlan(input: SuggestWorkoutPlanInput): Promise<SuggestWorkoutPlanOutput> {
  return suggestWorkoutPlanFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestWorkoutPlanPrompt',
  input: { schema: SuggestWorkoutPlanInputSchema },
  output: { schema: SuggestWorkoutPlanOutputSchema },
  prompt: `Eres un entrenador personal experto en fuerza y acondicionamiento. Tu objetivo es ayudar al usuario a progresar en sus entrenamientos y evitar el estancamiento.

Basándote en el historial de ejercicios proporcionado y los objetivos del usuario, genera sugerencias personalizadas de variaciones de ejercicios o nuevas rutinas de entrenamiento. Las sugerencias deben ser detalladas y estar orientadas a evitar el estancamiento y fomentar la progresión.

Considera la progresión lógica, la variación de estímulos y la adaptación a los objetivos del usuario. Cada sugerencia debe ser viable y explicada claramente.

Historial de ejercicios del usuario:
{{#each exerciseHistory}}
- Ejercicio: {{{exerciseName}}}, Peso: {{{weight}}}kg, Repeticiones: {{{repetitions}}}, RPE: {{{rpe}}} (Fecha: {{{date}}})
{{/each}}

Objetivos del usuario: {{{userGoals}}}

Genera las sugerencias y su justificación en formato JSON, siguiendo estrictamente el esquema de salida proporcionado.`,
});

const suggestWorkoutPlanFlow = ai.defineFlow(
  {
    name: 'suggestWorkoutPlanFlow',
    inputSchema: SuggestWorkoutPlanInputSchema,
    outputSchema: SuggestWorkoutPlanOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
