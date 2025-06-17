
"use client";

import { useState, useRef, useEffect, FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Send, User, Sparkles, Loader2, History } from 'lucide-react';
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

const MAX_CHAT_HISTORY_TO_DISPLAY = 50; // Display last 50 messages initially

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true); // For initial history load
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { user, isLoggedIn, loading: authLoading } = useAuth();

  // Scroll to bottom effect
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({ top: scrollAreaRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages]);

  // Fetch initial chat history or listen for real-time updates
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
    
    if (!isLoggedIn) {
         const tempUserMessage: Message = {
            id: Date.now().toString(),
            text: userMessageText,
            role: 'user',
            timestamp: new Date(),
        };
        setMessages(prev => [...prev, tempUserMessage]);
    }

    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append('query', userMessageText);
      
      const result = await handleChatQuery(formData);
      
      if (result.error) {
        throw new Error(result.error);
      }

      if (!isLoggedIn) {
        const botMessage: Message = {
            id: (Date.now() + 1).toString(),
            text: result.answer || "Sorry, I couldn't process that.",
            role: 'model',
            timestamp: new Date(),
        };
        setMessages((prev) => [...prev, botMessage]);
      }
      // For logged-in users, onSnapshot will update the messages state with user and bot messages.

    } catch (error) {
      console.error('Chatbot error:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred.';
      toast({
        variant: 'destructive',
        title: 'Chatbot Error',
        description: errorMessage,
      });
       if (!isLoggedIn) {
        const errorBotMessage: Message = {
            id: (Date.now() + 1).toString(),
            text: `Sorry, I encountered an error: ${errorMessage}`,
            role: 'model',
            timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errorBotMessage]);
       }
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
    <Card className="w-full shadow-xl rounded-lg overflow-hidden">
      <CardContent className="p-0">
        <div className="flex flex-col h-[70vh]">
          <div className="p-4 border-b border-border bg-background/70 backdrop-blur-sm flex justify-between items-center">
            <h2 className="text-lg font-semibold text-primary">Ask CyberMozhi (English or Tamil)...</h2>
            {isLoggedIn && (
              <Button variant="outline" size="sm" disabled> 
                <History className="mr-2 h-4 w-4" />
                Chat History
              </Button>
            )}
          </div>
          <ScrollArea className="flex-grow p-6 space-y-6" ref={scrollAreaRef}>
            {isLoadingHistory && <div className="flex justify-center items-center h-full"><Loader2 className="h-8 w-8 animate-spin text-primary" /><p className="ml-2 text-muted-foreground">Loading chat history...</p></div>}
            {!isLoadingHistory && messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex items-end gap-3",
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                )}
              >
                {message.role === 'model' && (
                  <Avatar className="h-8 w-8 shadow-sm">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      <Sparkles className="h-5 w-5" />
                    </AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={cn(
                    "max-w-[70%] p-3 rounded-xl shadow-md",
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground rounded-br-none'
                      : 'bg-card border border-border text-card-foreground rounded-bl-none'
                  )}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                  <p className={cn(
                      "text-xs mt-1",
                      message.role === 'user' ? "text-primary-foreground/70 text-right" : "text-muted-foreground text-left"
                    )}>
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                {message.role === 'user' && (
                  <Avatar className="h-8 w-8 shadow-sm">
                    <AvatarFallback className="bg-accent text-accent-foreground">
                      <User className="h-5 w-5" />
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
            {isLoading && messages.length > 0 && messages[messages.length -1]?.role === 'user' && (
              <div className="flex items-end gap-3 justify-start">
                <Avatar className="h-8 w-8 shadow-sm">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      <Sparkles className="h-5 w-5" />
                    </AvatarFallback>
                  </Avatar>
                <div className="max-w-[70%] p-3 rounded-xl shadow-md bg-card border border-border text-card-foreground rounded-bl-none">
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                </div>
              </div>
            )}
             {!isLoading && !isLoadingHistory && authLoading && isLoggedIn && messages.length === 0 && (
                <div className="flex justify-center items-center h-full">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="ml-2 text-muted-foreground">Checking authentication...</p>
                </div>
            )}
          </ScrollArea>
          <form onSubmit={handleSubmit} className="p-4 border-t border-border bg-background/80 backdrop-blur">
            <div className="flex items-center gap-2">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={authLoading ? "Authenticating..." : (isLoggedIn ? "Ask CyberMozhi..." : "Ask CyberMozhi (guests have limited interaction)...")}
                className="flex-grow resize-none focus-visible:ring-primary text-sm"
                rows={1}
                aria-label="Chat input"
                disabled={isLoading || authLoading && !isLoggedIn }
              />
              <Button type="submit" size="icon" disabled={isLoading || (authLoading && !isLoggedIn) || !input.trim()} aria-label="Send message">
                {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
              </Button>
            </div>
          </form>
        </div>
      </CardContent>
    </Card>
  );
}
