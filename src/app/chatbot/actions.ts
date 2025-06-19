
"use server";

import { cyberLawChatbot, type CyberLawChatbotInput, type CyberLawChatbotOutput, type ChatMessage } from '@/ai/flows/cyber-law-chatbot';
import { z } from 'zod';
import { auth, db } from '@/lib/firebase';
import { collection, addDoc, query, orderBy, limit, getDocs, serverTimestamp, Timestamp } from 'firebase/firestore';

const ChatQuerySchema = z.object({
  query: z.string().min(1, "Query cannot be empty."),
});

const MAX_CHAT_HISTORY_TO_FETCH = 20; // Fetch last 20 messages (10 user + 10 model) for AI context

export async function handleChatQuery(formData: FormData): Promise<CyberLawChatbotOutput & { error?: string }> {
  if (!auth || !db) {
    console.error("Firebase auth or db not initialized in handleChatQuery. This might be due to Firebase service unavailability or incorrect configuration.");
    return { answer: '', error: "The chatbot service is temporarily unavailable due to a configuration issue. Please try again later." };
  }

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
    
    // Fetch chat history for AI context
    try {
      const chatMessagesRef = collection(db, `users/${currentUser.uid}/chatMessages`);
      const q = query(chatMessagesRef, orderBy('timestamp', 'desc'), limit(MAX_CHAT_HISTORY_TO_FETCH));
      const querySnapshot = await getDocs(q);
      const fetchedMessages: { role: 'user' | 'model'; text: string; timestamp: Timestamp }[] = [];
      querySnapshot.forEach((doc) => {
        fetchedMessages.push(doc.data() as { role: 'user' | 'model'; text: string; timestamp: Timestamp });
      });
      
      chatHistoryForAI = fetchedMessages.reverse().map(msg => ({
        role: msg.role,
        parts: [{ text: msg.text }],
        isUser: msg.role === 'user',
        isModel: msg.role === 'model',
      }));

    } catch (historyError) {
      console.error("Error fetching chat history for AI (potentially due to Firestore unavailability):", historyError);
      // Non-fatal error for AI context, proceed without history if fetching fails
    }
  }

  const input: CyberLawChatbotInput = {
    query: userQueryText,
    userName: userName,
    chatHistory: chatHistoryForAI.length > 0 ? chatHistoryForAI : undefined,
  };

  try {
    const result = await cyberLawChatbot(input);

    if (currentUser) {
      try {
        const chatMessagesRef = collection(db, `users/${currentUser.uid}/chatMessages`);
        await addDoc(chatMessagesRef, {
          role: 'user',
          text: userQueryText,
          timestamp: serverTimestamp(),
        });
        await addDoc(chatMessagesRef, {
          role: 'model',
          text: result.answer,
          timestamp: serverTimestamp(),
        });
      } catch (saveError) {
        console.error("Error saving chat message to Firestore (potentially due to Firestore unavailability or rules):", saveError);
        // Non-fatal error for saving history, user still gets the AI response
      }
    }
    return result;
  } catch (e) {
    let errorMessage = "An unexpected error occurred while processing your request with the AI assistant.";
    if (e instanceof Error) {
      errorMessage = e.message;
    } else if (typeof e === 'string') {
      errorMessage = e;
    } else {
      try {
        errorMessage = JSON.stringify(e);
      } catch (stringifyError) {
        // Fallback if stringify fails
      }
    }
    console.error("Error in cyberLawChatbot flow processing:", e);
    return { answer: '', error: errorMessage };
  }
}
