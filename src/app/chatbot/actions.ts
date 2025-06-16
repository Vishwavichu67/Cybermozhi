"use server";

import { cyberLawChatbot, type CyberLawChatbotInput, type CyberLawChatbotOutput } from '@/ai/flows/cyber-law-chatbot';
import { z } from 'zod';

const ChatQuerySchema = z.object({
  query: z.string().min(1, "Query cannot be empty."),
});

export async function handleChatQuery(formData: FormData): Promise<CyberLawChatbotOutput & { error?: string }> {
  const rawQuery = formData.get('query');

  const validatedFields = ChatQuerySchema.safeParse({
    query: rawQuery,
  });

  if (!validatedFields.success) {
    return { answer: '', error: validatedFields.error.flatten().fieldErrors.query?.join(", ") || "Invalid input." };
  }

  const input: CyberLawChatbotInput = {
    query: validatedFields.data.query,
  };

  try {
    const result = await cyberLawChatbot(input);
    return result;
  } catch (error) {
    console.error("Error in cyberLawChatbot flow:", error);
    // Check if error is an instance of Error to safely access message property
    const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred while processing your request.";
    return { answer: '', error: errorMessage };
  }
}
