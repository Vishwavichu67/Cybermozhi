'use server';
/**
 * @fileOverview Summarizes a cyber attack and provides relevant laws.
 *
 * - summarizeCyberAttack - A function that summarizes the attack and provides relevant laws.
 * - CyberAttackInput - The input type for the summarizeCyberAttack function.
 * - CyberAttackOutput - The return type for the summarizeCyberAttack function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CyberAttackInputSchema = z.object({
  description: z.string().describe('The description of the cyber attack.'),
});
export type CyberAttackInput = z.infer<typeof CyberAttackInputSchema>;

const CyberAttackOutputSchema = z.object({
  summary: z.string().describe('A summary of the cyber attack.'),
  relevantLaws: z
    .string()
    .describe('The relevant Indian cyber laws applicable to the attack.'),
});
export type CyberAttackOutput = z.infer<typeof CyberAttackOutputSchema>;

export async function summarizeCyberAttack(input: CyberAttackInput): Promise<CyberAttackOutput> {
  return summarizeCyberAttackFlow(input);
}

const prompt = ai.definePrompt({
  name: 'cyberAttackSummaryPrompt',
  input: {schema: CyberAttackInputSchema},
  output: {schema: CyberAttackOutputSchema},
  prompt: `You are an expert in Indian Cyber Law.  Given a description of a cyber attack, provide a summary of the attack and identify the relevant Indian cyber laws that apply to it.

Description: {{{description}}}`,
});

const summarizeCyberAttackFlow = ai.defineFlow(
  {
    name: 'summarizeCyberAttackFlow',
    inputSchema: CyberAttackInputSchema,
    outputSchema: CyberAttackOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
