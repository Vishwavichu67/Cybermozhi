
"use server";

import { cyberLawChatbot, type CyberLawChatbotInput, type ChatMessage as AIChatMessage } from '@/ai/flows/cyber-law-chatbot';
import { z } from 'zod';
import type { CyberLawChatbotOutput } from '@/ai/flows/cyber-law-chatbot';


const ChatAIInputSchema = z.object({
  query: z.string(),
  userName: z.string().optional(),
  chatHistory: z.array(z.object({
    role: z.enum(['user', 'model']),
    parts: z.array(z.object({ text: z.string() })),
  })).optional(),
});

/**
 * Handles calling the Genkit AI flow to get a chatbot response.
 * This is a server-only action and does not interact with Firestore.
 */
export async function getAIChatResponse(input: {
  query: string, 
  userName?: string, 
  chatHistory?: AIChatMessage[]
}): Promise<CyberLawChatbotOutput & { error?: string }> {

  const validatedFields = ChatAIInputSchema.safeParse(input);

  if (!validatedFields.success) {
      const errorMsg = validatedFields.error.flatten().fieldErrors.query?.join(", ") || "Invalid input.";
      return { answer: '', error: errorMsg };
  }

  try {
    const aiInput: CyberLawChatbotInput = validatedFields.data;
    const result = await cyberLawChatbot(aiInput);
    return result;
  } catch (e) {
    let errorMessage = "An unexpected error occurred with the AI assistant.";
    if (e instanceof Error) errorMessage = e.message;
    else if (typeof e === 'string') errorMessage = e;
    else { try { errorMessage = JSON.stringify(e); } catch { /* ignore */ } }
    console.error("Error in getAIChatResponse:", e);
    return { answer: '', error: errorMessage };
  }
}
