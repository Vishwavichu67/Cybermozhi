
"use server";

import { cyberLawChatbot, type CyberLawChatbotInput, type CyberLawChatbotOutput, type ChatMessage } from '@/ai/flows/cyber-law-chatbot';
import { z } from 'zod';
import { auth, db } from '@/lib/firebase';
import { collection, addDoc, query, orderBy, limit, getDocs, serverTimestamp, Timestamp, where } from 'firebase/firestore';

const ChatQuerySchema = z.object({
  query: z.string().min(1, "Query cannot be empty."),
});

const MAX_CHAT_HISTORY_TO_FETCH = 20; // Fetch last 20 messages (10 pairs)

export async function handleChatQuery(formData: FormData): Promise<CyberLawChatbotOutput & { error?: string }> {
  const rawQuery = formData.get('query');
  const currentUser = auth.currentUser;

  const validatedFields = ChatQuerySchema.safeParse({
    query: rawQuery,
  });

  if (!validatedFields.success) {
    return { answer: '', error: validatedFields.error.flatten().fieldErrors.query?.join(", ") || "Invalid input." };
  }

  const userQueryText = validatedFields.data.query;
  let chatHistoryForAI: ChatMessage[] = [];
  let userName: string | undefined = undefined;

  if (currentUser) {
    userName = currentUser.displayName || currentUser.email?.split('@')[0] || undefined;
    
    // Fetch chat history
    try {
      const chatMessagesRef = collection(db, `users/${currentUser.uid}/chatMessages`);
      const q = query(chatMessagesRef, orderBy('timestamp', 'desc'), limit(MAX_CHAT_HISTORY_TO_FETCH));
      const querySnapshot = await getDocs(q);
      const fetchedMessages: { role: 'user' | 'model'; text: string; timestamp: Timestamp }[] = [];
      querySnapshot.forEach((doc) => {
        fetchedMessages.push(doc.data() as { role: 'user' | 'model'; text: string; timestamp: Timestamp });
      });
      
      // Transform to Genkit format (parts field) and reverse to maintain chronological order for the AI
      chatHistoryForAI = fetchedMessages.reverse().map(msg => ({
        role: msg.role,
        parts: [{ text: msg.text }]
      }));

    } catch (historyError) {
      console.error("Error fetching chat history:", historyError);
      // Non-fatal error, proceed without history
    }
  }

  const input: CyberLawChatbotInput = {
    query: userQueryText,
    userName: userName,
    chatHistory: chatHistoryForAI.length > 0 ? chatHistoryForAI : undefined,
  };

  try {
    const result = await cyberLawChatbot(input);

    // Save user message and bot response to Firestore if user is logged in
    if (currentUser) {
      try {
        const chatMessagesRef = collection(db, `users/${currentUser.uid}/chatMessages`);
        // Save user message
        await addDoc(chatMessagesRef, {
          role: 'user',
          text: userQueryText,
          timestamp: serverTimestamp(),
        });
        // Save bot response
        await addDoc(chatMessagesRef, {
          role: 'model',
          text: result.answer,
          timestamp: serverTimestamp(),
        });
      } catch (saveError) {
        console.error("Error saving chat message to Firestore:", saveError);
        // Non-fatal error, user still gets the response
      }
    }
    return result;
  } catch (error) {
    console.error("Error in cyberLawChatbot flow:", error);
    const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred while processing your request.";
    return { answer: '', error: errorMessage };
  }
}
