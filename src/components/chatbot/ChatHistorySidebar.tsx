
"use client";

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { PlusCircle, MessageSquareText, Loader2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, onSnapshot, type Timestamp } from 'firebase/firestore';

interface ChatSession {
  id: string;
  title: string;
  createdAt: Timestamp;
  lastMessageAt: Timestamp;
  userId: string;
}

interface ChatHistorySidebarProps {
  currentChatSessionId: string | null;
  onSelectChatSession: (sessionId: string | null) => void;
  onNewChat: () => void;
  isUserLoggedIn: boolean;
  userId: string | null | undefined;
}

export function ChatHistorySidebar({
  currentChatSessionId,
  onSelectChatSession,
  onNewChat,
  isUserLoggedIn,
  userId
}: ChatHistorySidebarProps) {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isUserLoggedIn || !userId) {
      setSessions([]);
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    setError(null);

    const sessionsRef = collection(db, `users/${userId}/chatSessions`);
    const q = query(sessionsRef, orderBy('lastMessageAt', 'desc'));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const fetchedSessions: ChatSession[] = [];
      querySnapshot.forEach((docSnap) => {
        fetchedSessions.push({
          id: docSnap.id,
          ...docSnap.data()
        } as ChatSession);
      });
      setSessions(fetchedSessions);
      setIsLoading(false);
    }, (err) => {
      console.error("Error fetching chat sessions:", err);
      setError("Failed to fetch chat history.");
      setIsLoading(false);
    });

    // Cleanup subscription on component unmount
    return () => unsubscribe();
  }, [isUserLoggedIn, userId]);


  const content = (
    <>
      <Button onClick={onNewChat} variant="outline" className="w-full mb-4 transition-shadow hover:shadow-md">
        <PlusCircle className="mr-2 h-5 w-5" />
        New Chat
      </Button>
      <h3 className="text-xs font-semibold text-muted-foreground mb-2 px-1 uppercase tracking-wider">History</h3>
      <ScrollArea className="flex-grow">
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-4 space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 w-full bg-muted/50 rounded animate-pulse"></div>
            ))}
          </div>
        )}
        {error && (
          <div className="text-destructive text-sm p-2 flex items-center rounded bg-destructive/10 border border-destructive/20">
            <AlertCircle className="h-4 w-4 mr-2 shrink-0" /> <span className="flex-grow">{error}</span>
          </div>
        )}
        {!isLoading && !error && sessions.length === 0 && isUserLoggedIn && (
          <p className="text-xs text-muted-foreground text-center py-4">No chat history yet.</p>
        )}
        <div className="space-y-1">
          {sessions.map((session) => {
             // Handle potential serverTimestamp object before rendering
            const lastMessageDate = session.lastMessageAt?.toDate ? session.lastMessageAt.toDate() : new Date();
            return (
              <div key={session.id} className="group relative">
                <Button
                  variant="ghost"
                  onClick={() => onSelectChatSession(session.id)}
                  className={cn(
                    "w-full justify-start text-left h-auto py-2.5 px-2.5 text-sm truncate",
                    currentChatSessionId === session.id ? 'bg-primary/10 text-primary' : 'hover:bg-muted/50'
                  )}
                  title={session.title}
                >
                  <MessageSquareText className="mr-2.5 h-4 w-4 flex-shrink-0" />
                  <div className="flex-grow truncate">
                    <p className="font-medium truncate text-sm">{session.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(lastMessageDate, { addSuffix: true })}
                    </p>
                  </div>
                </Button>
              </div>
            )
          })}
        </div>
      </ScrollArea>
    </>
  );

  if (!isUserLoggedIn && !isLoading) {
    return (
      <div className="h-full w-full flex flex-col border-r border-border/40 bg-background/80 p-3">
        <p className="text-sm text-muted-foreground text-center py-4">Please log in to see chat history.</p>
      </div>
    );
  }
  
  return (
    <div className="h-full w-full flex-shrink-0 flex-col border-r border-border/40 bg-background/80 p-3 flex">
      {content}
    </div>
  );
}
