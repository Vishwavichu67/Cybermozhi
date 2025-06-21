
"use client";

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ChatInterface } from '@/components/chatbot/ChatInterface';
import { ChatHistorySidebar } from '@/components/chatbot/ChatHistorySidebar';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, MessageCircleQuestion, PanelLeftOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

export default function ChatbotPage() {
  const { user, isLoggedIn, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [currentChatSessionId, setCurrentChatSessionId] = useState<string | null>(null);
  const [isPageInitializing, setIsPageInitializing] = useState(true);
  const [isChatContentLoading, setIsChatContentLoading] = useState(false);
  const [isSidebarOpenMobile, setIsSidebarOpenMobile] = useState(false);

  useEffect(() => {
    if (authLoading) return;

    const chatIdFromUrl = searchParams.get('id');
    setCurrentChatSessionId(chatIdFromUrl); // Can be null if no 'id' param
    setIsPageInitializing(false);
  }, [searchParams, authLoading]);
  
  const handleSelectChatSession = useCallback((sessionId: string | null) => {
    if (sessionId !== currentChatSessionId) {
      setIsChatContentLoading(true);
      setCurrentChatSessionId(sessionId);
      if (sessionId) {
        router.push(`/chatbot?id=${sessionId}`, { scroll: false });
      } else {
        router.push('/chatbot', { scroll: false });
      }
    }
    setIsSidebarOpenMobile(false);
  }, [router, currentChatSessionId]);

  const handleNewChat = useCallback(() => {
    handleSelectChatSession(null);
  }, [handleSelectChatSession]);
  
  const handleChatSessionCreated = useCallback((sessionId: string) => {
    if (sessionId && currentChatSessionId !== sessionId) {
      setCurrentChatSessionId(sessionId);
      router.push(`/chatbot?id=${sessionId}`, { scroll: false });
    }
  }, [router, currentChatSessionId]);

  const onMessagesLoaded = useCallback(() => {
    setIsChatContentLoading(false);
  }, []);


  if (authLoading || isPageInitializing) {
    return (
      <div className="flex items-center justify-center flex-grow h-full">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  const sidebar = (
    <ChatHistorySidebar
      currentChatSessionId={currentChatSessionId}
      onSelectChatSession={handleSelectChatSession}
      onNewChat={handleNewChat}
    />
  );

  return (
    <div className="flex flex-col md:flex-row h-full flex-grow overflow-hidden">
      {isLoggedIn && (
        <>
          {/* Mobile Sidebar Trigger & Sheet */}
          <div className="md:hidden p-3 border-b bg-background sticky top-0 z-20">
            <Sheet open={isSidebarOpenMobile} onOpenChange={setIsSidebarOpenMobile}>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="w-full">
                  <PanelLeftOpen className="h-5 w-5 mr-2" /> View Chat History
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-[280px] md:w-72">
                {sidebar}
              </SheetContent>
            </Sheet>
          </div>
          {/* Desktop Sidebar */}
          <aside className="hidden md:block md:w-72 md:flex-shrink-0 h-full">
            {sidebar}
          </aside>
        </>
      )}
      
      <main className="flex-grow flex flex-col items-center p-0 md:p-4 overflow-y-auto h-full">
        {!isLoggedIn && !authLoading ? (
          <div className="flex flex-col items-center justify-center flex-grow text-center p-4 h-full">
            <MessageCircleQuestion className="w-20 h-20 text-primary mb-6" />
            <h1 className="text-2xl font-headline font-bold text-primary mb-3">Login to Chat</h1>
            <p className="text-md text-foreground/75 max-w-md mx-auto">
              Please log in to use the AI Cyber Legal Assistant and access your chat history.
            </p>
          </div>
        ) : (
          <div className="w-full h-full max-w-4xl">
            {(isChatContentLoading && currentChatSessionId) ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
              </div>
            ) : (
              <ChatInterface 
                key={currentChatSessionId || 'new'} 
                chatSessionId={currentChatSessionId}
                onSessionCreated={handleChatSessionCreated}
                onMessagesLoaded={onMessagesLoaded}
              />
            )}
          </div>
        )}
      </main>
    </div>
  );
}
