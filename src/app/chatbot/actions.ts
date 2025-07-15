
'use server';

import {
  cyberLawChatbot,
  type CyberLawChatbotInput,
  type CyberLawChatbotOutput,
  type ChatMessage as AIChatMessage,
} from '@/ai/flows/cyber-law-chatbot';
import { z } from 'zod';
import {
  getFirestore,
  doc,
  collection,
  addDoc,
  serverTimestamp,
  updateDoc,
  getDoc,
} from 'firebase/firestore';
import { app } from '@/lib/firebase-admin'; // Use admin SDK on server

const db = getFirestore(app);

const UserDetailsSchema = z.object({
  gender: z.string().optional(),
  age: z.number().nullable().optional(),
  maritalStatus: z.string().optional(),
  state: z.string().optional(),
  city: z.string().optional(),
  preferredLanguage: z.string().optional(),
}).nullable().optional();


const ChatAIInputSchema = z.object({
  query: z.string(),
  userName: z.string().optional(),
  chatHistory: z.array(z.object({
    role: z.enum(['user', 'model']),
    parts: z.array(z.object({ text: z.string() })),
  })),
  userDetails: UserDetailsSchema,
  isProfileIncomplete: z.boolean().optional(),
  chatSessionId: z.string().nullable(),
  userId: z.string(),
});

export async function getAIChatResponse(
  input: z.infer<typeof ChatAIInputSchema>
): Promise<{ output: CyberLawChatbotOutput; newChatSessionId?: string }> {

  const validatedFields = ChatAIInputSchema.safeParse(input);

  if (!validatedFields.success) {
    console.error("Validation failed:", validatedFields.error.flatten());
    throw new Error('Invalid input for getAIChatResponse');
  }

  const { query, userName, chatHistory, userDetails, isProfileIncomplete, userId } = validatedFields.data;
  let { chatSessionId } = validatedFields.data;

  // Save the user's message
  const userMessage = {
    role: 'user',
    text: query,
    timestamp: serverTimestamp(),
  };

  try {
    // If it's a new chat, create a session first
    if (!chatSessionId) {
      const firstMessageSummary = query.substring(0, 40) + (query.length > 40 ? '...' : '');
      const sessionRef = await addDoc(collection(db, `users/${userId}/chatSessions`), {
        title: firstMessageSummary,
        userId: userId,
        createdAt: serverTimestamp(),
        lastMessageAt: serverTimestamp(),
      });
      chatSessionId = sessionRef.id;
      // Add the first message to this new session
      await addDoc(collection(db, `users/${userId}/chatSessions/${chatSessionId}/messages`), userMessage);
    } else {
      // Just add the message to the existing session
      await addDoc(collection(db, `users/${userId}/chatSessions/${chatSessionId}/messages`), userMessage);
      await updateDoc(doc(db, `users/${userId}/chatSessions/${chatSessionId}`), {
        lastMessageAt: serverTimestamp(),
      });
    }

    // Prepare input for the Genkit flow
    const aiInput: CyberLawChatbotInput = {
      query,
      userName,
      chatHistory,
      userDetails: userDetails || undefined,
      isProfileIncomplete,
    };

    // Call Genkit flow
    const result = await cyberLawChatbot(aiInput);

    // Save the AI's response
    const aiResponse = {
      role: 'model',
      text: result.answer,
      timestamp: serverTimestamp(),
    };
    await addDoc(collection(db, `users/${userId}/chatSessions/${chatSessionId}/messages`), aiResponse);

    return {
      output: result,
      newChatSessionId: chatSessionId, // Return the ID so the client knows it
    };
  } catch (e) {
    console.error("Critical Error in getAIChatResponse:", e);
    let errorMessage = "An unexpected system error occurred while processing your request.";
    if (e instanceof Error) {
      errorMessage = e.message;
    }
    // Return a structured error to be handled by the client
    return {
      output: {
        answer: `Sorry, there was a critical error: ${errorMessage}`
      },
      newChatSessionId: chatSessionId || undefined,
    };
  }
}
