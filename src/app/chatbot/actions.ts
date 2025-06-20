
"use server";

import { cyberLawChatbot, type CyberLawChatbotInput, type ChatMessage as AIChatMessage } from '@/ai/flows/cyber-law-chatbot';
import { z } from 'zod';
import { auth, db } from '@/lib/firebase';
import { collection, query, orderBy, limit, getDocs, serverTimestamp, Timestamp, doc, setDoc, writeBatch, updateDoc } from 'firebase/firestore';

const ChatQueryInputSchema = z.object({
  query: z.string().min(1, "Query cannot be empty."),
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
  if (!auth || !db) {
    console.error("Firebase auth or db not initialized.");
    return { answer: '', error: "Chatbot service temporarily unavailable." };
  }

  const currentUser = auth.currentUser;
  if (!currentUser) {
    return { answer: '', error: "User not authenticated. Please login." };
  }

  const rawQuery = formData.get('query') as string;
  const rawChatSessionId = formData.get('chatSessionId') as string | null;
  
  let currentChatSessionId: string | null = (rawChatSessionId === "null" || !rawChatSessionId || rawChatSessionId === "undefined") ? null : rawChatSessionId;

  const validatedFields = ChatQueryInputSchema.safeParse({ query: rawQuery });

  if (!validatedFields.success) {
    return { answer: '', error: validatedFields.error.flatten().fieldErrors.query?.join(", ") || "Invalid input." };
  }
  const userQueryText = validatedFields.data.query;

  let chatHistoryForAI: AIChatMessage[] = [];
  const userName: string | undefined = currentUser.displayName || currentUser.email?.split('@')[0] || undefined;
  let newChatSessionForClient: ChatSession | undefined = undefined;

  try {
    if (!currentChatSessionId) {
      const newSessionRef = doc(collection(db, `users/${currentUser.uid}/chatSessions`));
      currentChatSessionId = newSessionRef.id;
      const nowServerTimestamp = serverTimestamp();
      const initialTitle = userQueryText.substring(0, 70) + (userQueryText.length > 70 ? "..." : "");
      
      const sessionDataToSave = {
        title: initialTitle,
        createdAt: nowServerTimestamp,
        lastMessageAt: nowServerTimestamp,
        userId: currentUser.uid,
      };
      await setDoc(newSessionRef, sessionDataToSave);
      
      newChatSessionForClient = {
        id: currentChatSessionId,
        title: initialTitle,
        createdAt: new Date(), 
        lastMessageAt: new Date(), 
        userId: currentUser.uid,
      };
    }

    if (currentChatSessionId) {
      const messagesRef = collection(db, `users/${currentUser.uid}/chatSessions/${currentChatSessionId}/messages`);
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
      userName: userName,
      chatHistory: chatHistoryForAI.length > 0 ? chatHistoryForAI : undefined,
    };

    const result = await cyberLawChatbot(aiInput);

    if (currentChatSessionId) {
      const userMessageRef = doc(collection(db, `users/${currentUser.uid}/chatSessions/${currentChatSessionId}/messages`));
      const modelMessageRef = doc(collection(db, `users/${currentUser.uid}/chatSessions/${currentChatSessionId}/messages`));
      const sessionDocRef = doc(db, `users/${currentUser.uid}/chatSessions/${currentChatSessionId}`);
      
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

export async function getChatSessionsForUser(): Promise<{ sessions?: ChatSession[]; error?: string }> {
  const currentUser = auth.currentUser;
  if (!currentUser || !db) {
    return { error: "User not authenticated or DB not available." };
  }
  try {
    const sessionsRef = collection(db, `users/${currentUser.uid}/chatSessions`);
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

export async function getMessagesForChatSession(chatSessionId: string): Promise<{ messages?: MessageForClient[]; error?: string }> {
  const currentUser = auth.currentUser;
  if (!currentUser || !db) {
    return { error: "User not authenticated or DB not available." };
  }
  if (!chatSessionId) {
    return { error: "Chat session ID is required." };
  }
  try {
    const messagesRef = collection(db, `users/${currentUser.uid}/chatSessions/${chatSessionId}/messages`);
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
