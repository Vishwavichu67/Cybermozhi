
"use client";

import { ChatInterface } from '@/components/chatbot/ChatInterface';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, MessageCircleQuestion } from 'lucide-react';

export default function ChatbotPage() {
  const { user, isLoggedIn, loading: authLoading } = useAuth();

  if (authLoading) {
    return (
      <div className="flex items-center justify-center flex-grow h-full">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full flex-grow overflow-hidden">
      <main className="flex-grow flex flex-col items-center p-0 md:p-4 overflow-y-auto h-full">
        {!isLoggedIn && !authLoading ? (
          <div className="flex flex-col items-center justify-center flex-grow text-center p-4 h-full">
            <MessageCircleQuestion className="w-20 h-20 text-primary mb-6" />
            <h1 className="text-2xl font-headline font-bold text-primary mb-3">Login to Chat</h1>
            <p className="text-md text-foreground/75 max-w-md mx-auto">
              Please log in to use the AI Cyber Legal Assistant.
            </p>
          </div>
        ) : (
          <div className="w-full h-full max-w-4xl">
            <ChatInterface />
          </div>
        )}
      </main>
    </div>
  );
}
