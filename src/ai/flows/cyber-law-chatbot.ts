
'use server';

/**
 * @fileOverview This file defines a Genkit flow for a bilingual chatbot that answers questions about cyber law and cybersecurity.
 *
 * - cyberLawChatbot - A function that handles the chatbot interactions.
 * - CyberLawChatbotInput - The input type for the cyberLawChatbot function.
 * - CyberLawChatbotOutput - The return type for the cyberLawChatbot function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CyberLawChatbotInputSchema = z.object({
  query: z
    .string()
    .describe('The user query about cyber law or cybersecurity in Tamil or English.'),
});
export type CyberLawChatbotInput = z.infer<typeof CyberLawChatbotInputSchema>;

const CyberLawChatbotOutputSchema = z.object({
  answer: z
    .string()
    .describe('The chatbot response providing a layman-friendly explanation and mitigation techniques.'),
});
export type CyberLawChatbotOutput = z.infer<typeof CyberLawChatbotOutputSchema>;

export async function cyberLawChatbot(input: CyberLawChatbotInput): Promise<CyberLawChatbotOutput> {
  return cyberLawChatbotFlow(input);
}

const prompt = ai.definePrompt({
  name: 'cyberLawChatbotPrompt',
  input: {schema: CyberLawChatbotInputSchema},
  output: {schema: CyberLawChatbotOutputSchema},
  prompt: `You are an AI Cyber Legal Assistant, a highly knowledgeable and empathetic bilingual chatbot (Tamil and English) specializing in Indian cyber law and cybersecurity. Your primary goal is to provide clear, accurate, and helpful information to users.

When responding to a user's query:
1.  **Language:** Answer in the same language (Tamil or English) as the user's query.
2.  **Clarity & Simplicity:** Explain complex legal and technical terms in simple, layman-friendly language. Avoid jargon where possible, or explain it clearly if unavoidable.
3.  **Accuracy & Detail:** Provide accurate information based on your knowledge of Indian cyber laws and current cybersecurity best practices. Be as detailed as necessary to fully address the query.
4.  **Mitigation & Advice:** Where applicable, suggest practical mitigation techniques, preventive measures, or steps users can take.
5.  **Structure:** For longer answers or when explaining multiple points/mitigation steps, consider using bullet points or numbered lists to enhance readability.
6.  **Tone:** Maintain a helpful, patient, and reassuring tone. Users might be seeking help for concerning situations.
7.  **Scope:** Focus on providing information and general guidance. Remind users that your information is for educational purposes and does not constitute formal legal advice.

User's Question: {{{query}}}`,
});

const cyberLawChatbotFlow = ai.defineFlow(
  {
    name: 'cyberLawChatbotFlow',
    inputSchema: CyberLawChatbotInputSchema,
    outputSchema: CyberLawChatbotOutputSchema,
  },
  async (input: CyberLawChatbotInput): Promise<CyberLawChatbotOutput> => {
    const {output} = await prompt(input);

    if (!output) {
      console.error('Cyber law chatbot: AI did not return the expected output structure.');
      throw new Error('The AI failed to generate a response in the expected format. Please try rephrasing your query.');
    }
    return output;
  }
);
