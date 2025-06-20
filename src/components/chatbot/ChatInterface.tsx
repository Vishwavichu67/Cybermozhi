
"use client";

import { useState, useRef, useEffect, FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Send, User, Sparkles, Loader2, History, MessageCircle } from 'lucide-react';
import { handleChatQuery } from '@/app/chatbot/actions';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, onSnapshot, Timestamp, type QuerySnapshot, type DocumentData } from 'firebase/firestore';

interface Message {
  id: string;
  text: string;
  role: 'user' | 'model';
  timestamp: Date;
}

const MAX_CHAT_HISTORY_TO_DISPLAY = 50;

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { user, isLoggedIn, loading: authLoading } = useAuth();

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({ top: scrollAreaRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages]);

  useEffect(() => {
    if (isLoggedIn && user) {
      setIsLoadingHistory(true);
      const chatMessagesRef = collection(db, `users/${user.uid}/chatMessages`);
      const q = query(chatMessagesRef, orderBy('timestamp', 'asc'));

      const unsubscribe = onSnapshot(q, (querySnapshot: QuerySnapshot<DocumentData>) => {
        const fetchedMessages: Message[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          const timestamp = data.timestamp as Timestamp | null;
          fetchedMessages.push({
            id: doc.id,
            text: data.text,
            role: data.role as 'user' | 'model',
            timestamp: timestamp ? timestamp.toDate() : new Date(),
          });
        });
        setMessages(fetchedMessages.slice(-MAX_CHAT_HISTORY_TO_DISPLAY));
        setIsLoadingHistory(false);
      }, (error) => {
        console.error("Error fetching real-time chat history:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Could not load chat history."
        });
        setIsLoadingHistory(false);
      });
      return () => unsubscribe();
    } else {
      setMessages([]); 
      setIsLoadingHistory(false);
    }
  }, [isLoggedIn, user, toast]);

  const handleSubmit = async (e?: FormEvent<HTMLFormElement>) => {
    if (e) e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessageText = input;
    setInput(''); 

    const optimisticUserMessage: Message = {
      id: 'optimistic-user-' + Date.now().toString() + Math.random().toString(36).substring(2, 15), // More unique ID
      text: userMessageText,
      role: 'user',
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, optimisticUserMessage]);
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append('query', userMessageText);
      const result = await handleChatQuery(formData);

      if (result.error) {
        // Error from handleChatQuery (e.g., AI call failed or other error in action)
        const errorMessage = result.error;
        toast({
          variant: 'destructive',
          title: 'Chatbot Error',
          description: errorMessage,
        });
        const errorBotMessage: Message = {
          id: 'optimistic-error-model-' + Date.now().toString(),
          text: `Sorry, I encountered an error: ${errorMessage}`,
          role: 'model',
          timestamp: new Date(),
        };
        setMessages((prevMessages) => [...prevMessages, errorBotMessage]);
      } else {
        // AI call was successful, result.answer has the response.
        // Display it optimistically for everyone.
        // Firestore onSnapshot will handle persistence and eventual consistency for logged-in users.
        const botMessage: Message = {
          id: 'optimistic-model-' + Date.now().toString(),
          text: result.answer || "Sorry, I couldn't process that.",
          role: 'model',
          timestamp: new Date(),
        };
        setMessages((prevMessages) => [...prevMessages, botMessage]);
      }
    } catch (error) { // This catches other unexpected client-side errors during handleSubmit
      console.error('Chatbot handleSubmit generic error:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred.';
      toast({
        variant: 'destructive',
        title: 'Chatbot System Error',
        description: errorMessage,
      });
      const systemErrorBotMessage: Message = {
        id: 'optimistic-system-error-model-' + Date.now().toString(),
        text: `Sorry, an unexpected system error occurred. Please try again.`,
        role: 'model',
        timestamp: new Date(),
      };
       setMessages((prev) => [...prev, systemErrorBotMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <Card className="w-full shadow-xl rounded-lg overflow-hidden border-border/60">
      <CardContent className="p-0">
        <div className="flex flex-col h-[70vh]">
          <div className="p-4 border-b border-border/40 bg-background/90 backdrop-blur-sm flex justify-between items-center sticky top-0 z-10">
            <h2 className="text-lg font-semibold text-primary flex items-center">
              <Sparkles className="w-5 h-5 mr-2 text-primary animate-pulse" />
              Chat with CyberMozhi
            </h2>
            {isLoggedIn && (
              <Button variant="outline" size="sm" disabled className="cursor-not-allowed opacity-70">
                <History className="mr-2 h-4 w-4" />
                Chat History
              </Button>
            )}
          </div>
          <ScrollArea className="flex-grow p-4 sm:p-6 space-y-4" ref={scrollAreaRef}>
            {isLoadingHistory && (
              <div className="flex flex-col justify-center items-center h-full py-10">
                <Loader2 className="h-10 w-10 animate-spin text-primary mb-3" />
                <p className="text-muted-foreground">Loading chat history...</p>
              </div>
            )}
            {!isLoadingHistory && messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex items-end gap-2.5 w-full",
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                )}
              >
                {message.role === 'model' && (
                  <Avatar className="h-8 w-8 shadow-md flex-shrink-0">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      <Sparkles className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={cn(
                    "max-w-[70%] p-3 rounded-xl shadow-md",
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground rounded-br-none'
                      : 'bg-card border border-border/50 text-card-foreground rounded-bl-none'
                  )}
                >
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.text}</p>
                  <p className={cn(
                      "text-xs mt-1.5",
                      message.role === 'user' ? "text-primary-foreground/80 text-right" : "text-muted-foreground text-left"
                    )}>
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                {message.role === 'user' && (
                  <Avatar className="h-8 w-8 shadow-md flex-shrink-0">
                    <AvatarFallback className="bg-accent text-accent-foreground">
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
            {isLoading && messages.length > 0 && messages[messages.length -1]?.role === 'user' && (
              <div className="flex items-end gap-2.5 justify-start w-full">
                <Avatar className="h-8 w-8 shadow-md flex-shrink-0">
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    <Sparkles className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                <div className="max-w-[70%] p-3 rounded-xl shadow-md bg-card border border-border/50 text-card-foreground rounded-bl-none">
                  <div className="flex items-center space-x-1">
                    <span className="h-2 w-2 bg-muted-foreground rounded-full animate-pulse delay-0"></span>
                    <span className="h-2 w-2 bg-muted-foreground rounded-full animate-pulse delay-150"></span>
                    <span className="h-2 w-2 bg-muted-foreground rounded-full animate-pulse delay-300"></span>
                  </div>
                </div>
              </div>
            )}
            {!isLoading && !isLoadingHistory && authLoading && isLoggedIn && messages.length === 0 && (
              <div className="flex flex-col justify-center items-center h-full py-10">
                <Loader2 className="h-10 w-10 animate-spin text-primary mb-3" />
                <p className="text-muted-foreground">Checking authentication...</p>
              </div>
            )}
             {!isLoadingHistory && !authLoading && !isLoggedIn && messages.length === 0 && (
              <div className="text-center py-10 text-muted-foreground">
                <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Start a conversation with CyberMozhi!</p>
                <p className="text-xs mt-1">(Guests have limited interaction and no history.)</p>
              </div>
            )}
          </ScrollArea>
          <form onSubmit={handleSubmit} className="p-3 sm:p-4 border-t border-border/40 bg-background/95 sticky bottom-0 z-10">
            <div className="flex items-center gap-2">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={authLoading ? "Authenticating..." : (isLoggedIn ? "Ask anything about cyber law..." : "Ask CyberMozhi (guests have limited interaction)...")}
                className="flex-grow resize-none focus-visible:ring-primary text-sm shadow-sm"
                rows={1}
                aria-label="Chat input"
                disabled={isLoading || (authLoading && !isLoggedIn) }
              />
              <Button type="submit" size="icon" className="h-10 w-10 shadow-sm" disabled={isLoading || (authLoading && !isLoggedIn) || !input.trim()} aria-label="Send message">
                {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
              </Button>
            </div>
          </form>
        </div>
      </CardContent>
    </Card>
  );
}
