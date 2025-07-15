
"use client";

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChatHistorySidebar } from '@/components/chatbot/ChatHistorySidebar';
import { ChatInterface } from '@/components/chatbot/ChatInterface';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

export default function ChatPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  
  // The session ID can be null for a new chat
  const [chatSessionId, setChatSessionId] = useState<string | null>(null);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  const handleSelectChatSession = useCallback((sessionId: string | null) => {
    setChatSessionId(sessionId);
  }, []);

  const handleNewChat = useCallback(() => {
    setChatSessionId(null);
  }, []);

  if (loading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-5rem)] w-full bg-background rounded-xl shadow-lg border border-border/40">
      <div className="hidden md:flex md:w-72 lg:w-80 flex-shrink-0">
        <ChatHistorySidebar
          currentChatSessionId={chatSessionId}
          onSelectChatSession={handleSelectChatSession}
          onNewChat={handleNewChat}
        />
      </div>
      <div className="flex-1">
        <ChatInterface
          key={chatSessionId} // Re-mount component when session changes
          chatSessionId={chatSessionId}
          setChatSessionId={setChatSessionId}
        />
      </div>
    </div>
  );
}
