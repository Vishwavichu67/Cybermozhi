'use server';

/**
 * @fileOverview A Genkit flow to generate a concise title for a new chat session.
 * 
 * - generateChatTitle - A function that takes a user's query and returns a short title.
 * - ChatTitleInput - The input type for the generateChatTitle function.
 * - ChatTitleOutput - The return type for the generateChatTitle function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const ChatTitleInputSchema = z.object({
  query: z.string().describe('The first message from the user in a new chat session.'),
});
export type ChatTitleInput = z.infer<typeof ChatTitleInputSchema>;

const ChatTitleOutputSchema = z.object({
  title: z.string().describe('A short, relevant title for the chat session, no more than 5 words.'),
});
export type ChatTitleOutput = z.infer<typeof ChatTitleOutputSchema>;

export async function generateChatTitle(input: ChatTitleInput): Promise<ChatTitleOutput> {
  return generateChatTitleFlow(input);
}

const prompt = ai.definePrompt({
  name: 'chatTitlePrompt',
  input: { schema: ChatTitleInputSchema },
  output: { schema: ChatTitleOutputSchema },
  model: 'googleai/gemini-1.5-flash-latest',
  prompt: `Based on the following user query, generate a short, relevant title for the chat session. The title should be a maximum of 5 words.

User Query: {{{query}}}
`,
});

const generateChatTitleFlow = ai.defineFlow(
  {
    name: 'generateChatTitleFlow',
    inputSchema: ChatTitleInputSchema,
    outputSchema: ChatTitleOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) {
      // Fallback in case the AI fails to generate a title
      const fallbackTitle = input.query.substring(0, 40) + (input.query.length > 40 ? '...' : '');
      return { title: fallbackTitle };
    }
    return output;
  }
);
