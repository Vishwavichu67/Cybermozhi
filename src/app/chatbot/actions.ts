
"use server";

import { cyberLawChatbot, type CyberLawChatbotInput, type CyberLawChatbotOutput, type ChatMessage as AIChatMessage } from '@/ai/flows/cyber-law-chatbot';
import { z } from 'zod';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, limit, getDocs, serverTimestamp, Timestamp, doc, setDoc, writeBatch, updateDoc } from 'firebase/firestore';

const ChatQueryInputSchema = z.object({
  query: z.string().min(1, "Query cannot be empty."),
  userId: z.string().min(1, "User ID cannot be empty."),
  userName: z.string().optional(),
});

const MAX_CHAT_HISTORY_TO_FETCH = 20; 

export interface ChatSession {
  id: string;
  title: string;
  createdAt: Timestamp | Date; 
  lastMessageAt: Timestamp | Date;
  userId: string;
}

export interface MessageForClient {
  id: string;
  text: string;
  role: 'user' | 'model';
  timestamp: Timestamp | Date; 
}


export async function handleChatQuery(
  formData: FormData
): Promise<CyberLawChatbotOutput & { error?: string; chatSessionId?: string; newChatSession?: ChatSession }> {
  if (!db) {
    console.error("Firebase db not initialized.");
    return { answer: '', error: "Chatbot service temporarily unavailable." };
  }
  
  const rawQuery = formData.get('query') as string;
  const rawChatSessionId = formData.get('chatSessionId') as string | null;
  const userId = formData.get('userId') as string | null;
  const userName = formData.get('userName') as string | undefined;

  let currentChatSessionId: string | null = (rawChatSessionId === "null" || !rawChatSessionId || rawChatSessionId === "undefined") ? null : rawChatSessionId;

  const validatedFields = ChatQueryInputSchema.safeParse({ 
      query: rawQuery, 
      userId: userId, 
      userName: userName 
  });

  if (!validatedFields.success) {
      if (!userId) {
          return { answer: '', error: "User not authenticated. Please login." };
      }
      const errorMsg = validatedFields.error.flatten().fieldErrors.query?.join(", ") || validatedFields.error.flatten().fieldErrors.userId?.join(", ") || "Invalid input.";
      return { answer: '', error: errorMsg };
  }
  const { query: userQueryText, userId: currentUserId, userName: currentUserName } = validatedFields.data;

  let chatHistoryForAI: AIChatMessage[] = [];
  let newChatSessionForClient: ChatSession | undefined = undefined;

  try {
    if (!currentChatSessionId) {
      const newSessionRef = doc(collection(db, `users/${currentUserId}/chatSessions`));
      currentChatSessionId = newSessionRef.id;
      const nowServerTimestamp = serverTimestamp();
      const initialTitle = userQueryText.substring(0, 70) + (userQueryText.length > 70 ? "..." : "");
      
      const sessionDataToSave = {
        title: initialTitle,
        createdAt: nowServerTimestamp,
        lastMessageAt: nowServerTimestamp,
        userId: currentUserId,
      };
      await setDoc(newSessionRef, sessionDataToSave);
      
      newChatSessionForClient = {
        id: currentChatSessionId,
        title: initialTitle,
        createdAt: new Date(), 
        lastMessageAt: new Date(), 
        userId: currentUserId,
      };
    }

    if (currentChatSessionId) {
      const messagesRef = collection(db, `users/${currentUserId}/chatSessions/${currentChatSessionId}/messages`);
      const q = query(messagesRef, orderBy('timestamp', 'desc'), limit(MAX_CHAT_HISTORY_TO_FETCH));
      const querySnapshot = await getDocs(q);
      const fetchedMessages: AIChatMessage[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        fetchedMessages.push({
            role: data.role as 'user' | 'model',
            parts: [{ text: data.text }],
            isUser: data.role === 'user',
            isModel: data.role === 'model',
        });
      });
      chatHistoryForAI = fetchedMessages.reverse();
    }

    const aiInput: CyberLawChatbotInput = {
      query: userQueryText,
      userName: currentUserName,
      chatHistory: chatHistoryForAI.length > 0 ? chatHistoryForAI : undefined,
    };

    const result = await cyberLawChatbot(aiInput);

    if (currentChatSessionId) {
      const userMessageRef = doc(collection(db, `users/${currentUserId}/chatSessions/${currentChatSessionId}/messages`));
      const modelMessageRef = doc(collection(db, `users/${currentUserId}/chatSessions/${currentChatSessionId}/messages`));
      const sessionDocRef = doc(db, `users/${currentUserId}/chatSessions/${currentChatSessionId}`);
      
      const batch = writeBatch(db);
      const nowServerTimestampForMessages = serverTimestamp();

      batch.set(userMessageRef, {
        role: 'user',
        text: userQueryText,
        timestamp: nowServerTimestampForMessages,
      });
      batch.set(modelMessageRef, {
        role: 'model',
        text: result.answer,
        timestamp: nowServerTimestampForMessages,
      });
      batch.update(sessionDocRef, { lastMessageAt: nowServerTimestampForMessages });
      await batch.commit();
      
      if (newChatSessionForClient) {
        newChatSessionForClient.lastMessageAt = new Date(); 
      }
    }
    
    return { 
        ...result, 
        chatSessionId: currentChatSessionId, 
        newChatSession: newChatSessionForClient 
    };

  } catch (e) {
    let errorMessage = "An unexpected error occurred with the AI assistant.";
    if (e instanceof Error) errorMessage = e.message;
    else if (typeof e === 'string') errorMessage = e;
    else { try { errorMessage = JSON.stringify(e); } catch { /* ignore */ } }
    console.error("Error in handleChatQuery:", e);
    return { answer: '', error: errorMessage, chatSessionId: currentChatSessionId || undefined };
  }
}

export async function getChatSessionsForUser(userId: string): Promise<{ sessions?: ChatSession[]; error?: string }> {
  if (!userId || !db) {
    return { error: "User not authenticated or DB not available." };
  }
  try {
    const sessionsRef = collection(db, `users/${userId}/chatSessions`);
    const q = query(sessionsRef, orderBy('lastMessageAt', 'desc'));
    const querySnapshot = await getDocs(q);
    const sessions: ChatSession[] = [];
    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      sessions.push({
        id: docSnap.id,
        title: data.title,
        createdAt: (data.createdAt as Timestamp)?.toDate() || new Date(0),
        lastMessageAt: (data.lastMessageAt as Timestamp)?.toDate() || new Date(0),
        userId: data.userId,
      });
    });
    return { sessions };
  } catch (error) {
    console.error("Error fetching chat sessions:", error);
    return { error: "Failed to fetch chat sessions." };
  }
}

export async function getMessagesForChatSession(chatSessionId: string, userId: string): Promise<{ messages?: MessageForClient[]; error?: string }> {
  if (!userId || !db) {
    return { error: "User not authenticated or DB not available." };
  }
  if (!chatSessionId) {
    return { error: "Chat session ID is required." };
  }
  try {
    const messagesRef = collection(db, `users/${userId}/chatSessions/${chatSessionId}/messages`);
    const q = query(messagesRef, orderBy('timestamp', 'asc'));
    const querySnapshot = await getDocs(q);
    const messages: MessageForClient[] = [];
    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      messages.push({
        id: docSnap.id,
        text: data.text,
        role: data.role as 'user' | 'model',
        timestamp: (data.timestamp as Timestamp)?.toDate() || new Date(0),
      });
    });
    return { messages };
  } catch (error) {
    console.error(`Error fetching messages for session ${chatSessionId}:`, error);
    return { error: `Failed to fetch messages for session ${chatSessionId}.` };
  }
}
