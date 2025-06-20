
"use client";

import { useState, useRef, useEffect, FormEvent, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Send, User, Sparkles, Loader2, MessageCircle } from 'lucide-react';
import { handleChatQuery, getMessagesForChatSession, type MessageForClient, type ChatSession } from '@/app/chatbot/actions';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import type { Timestamp } from 'firebase/firestore';

interface ChatInterfaceProps {
  chatSessionId: string | null;
  onSessionCreated?: (session: ChatSession) => void;
  onMessagesLoaded?: () => void;
}

export function ChatInterface({ 
  chatSessionId: initialChatSessionIdProp, 
  onSessionCreated,
  onMessagesLoaded 
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<MessageForClient[]>([]);
  const [input, setInput] = useState('');
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth(); // Use user directly
  
  const [currentInternalSessionId, setCurrentInternalSessionId] = useState<string | null>(initialChatSessionIdProp);

  useEffect(() => {
    if (initialChatSessionIdProp !== currentInternalSessionId) {
      setCurrentInternalSessionId(initialChatSessionIdProp);
      setMessages([]); 
    }
  }, [initialChatSessionIdProp, currentInternalSessionId]);
  
  const scrollToBottom = useCallback(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({ top: scrollAreaRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, []);

  useEffect(() => {
    if (!isLoadingHistory) {
      scrollToBottom();
    }
  }, [messages, isLoadingHistory, scrollToBottom]);

  useEffect(() => {
    async function loadMessages() {
      if (authLoading) return;

      if (user && currentInternalSessionId) { // Check user directly
        setIsLoadingHistory(true);
        setMessages([]); 
        try {
            const result = await getMessagesForChatSession(currentInternalSessionId);
            if (result.error) {
              toast({ variant: "destructive", title: "Error loading chat", description: result.error });
              setMessages([]);
            } else if (result.messages) {
              setMessages(result.messages);
            }
        } catch(e) {
            toast({ variant: "destructive", title: "Error", description: "Failed to load messages."});
            setMessages([]);
        } finally {
            setIsLoadingHistory(false);
            if (onMessagesLoaded) onMessagesLoaded();
            requestAnimationFrame(() => scrollToBottom());
        }
      } else {
        setMessages([]); 
        setIsLoadingHistory(false);
        if (onMessagesLoaded) onMessagesLoaded();
      }
    }
    loadMessages();
  }, [user, currentInternalSessionId, toast, onMessagesLoaded, authLoading, scrollToBottom]);

  const handleSubmit = async (e?: FormEvent<HTMLFormElement>) => {
    if (e) e.preventDefault();
    if (!input.trim() || isSendingMessage || authLoading || !user) return; // Check !user directly

    const userMessageText = input;
    setInput(''); 

    const optimisticUserMessage: MessageForClient = {
      id: 'optimistic-user-' + Date.now() + Math.random().toString(16).slice(2),
      text: userMessageText,
      role: 'user',
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, optimisticUserMessage]);
    setIsSendingMessage(true);
    requestAnimationFrame(() => scrollToBottom());


    try {
      const formData = new FormData();
      formData.append('query', userMessageText);
      formData.append('chatSessionId', currentInternalSessionId || "null");

      const result = await handleChatQuery(formData);
      
      setMessages(prev => prev.filter(m => m.id !== optimisticUserMessage.id));


      if (result.error) {
        toast({ variant: 'destructive', title: 'Chatbot Error', description: result.error });
        const errorBotMessage: MessageForClient = { 
            id: 'error-model-' + Date.now(), 
            text: `Sorry, an error occurred: ${result.error}`, 
            role: 'model', 
            timestamp: new Date() 
        };
        setMessages((prevMessages) => [...prevMessages, optimisticUserMessage, errorBotMessage]);

      } else {
        const finalUserMessage: MessageForClient = { ...optimisticUserMessage, id: 'user-' + Date.now() };
        const botMessage: MessageForClient = {
          id: 'model-' + Date.now() + Math.random().toString(16).slice(2), 
          text: result.answer || "Sorry, I couldn't process that.",
          role: 'model',
          timestamp: new Date(),
        };
        setMessages((prevMessages) => [...prevMessages, finalUserMessage, botMessage]);


        if (result.chatSessionId && !currentInternalSessionId && result.newChatSession) {
          setCurrentInternalSessionId(result.chatSessionId); 
          if (onSessionCreated) {
            onSessionCreated(result.newChatSession);
          }
        } else if (result.chatSessionId && currentInternalSessionId && result.chatSessionId !== currentInternalSessionId) {
            setCurrentInternalSessionId(result.chatSessionId);
        }
      }
    } catch (error) { 
      console.error('Chatbot handleSubmit generic error:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred.';
      toast({ variant: 'destructive', title: 'Chatbot System Error', description: errorMessage });
      const systemErrorBotMessage: MessageForClient = { 
        id: 'system-error-model-' + Date.now(), 
        text: `An unexpected system error occurred. Please try again.`, 
        role: 'model', 
        timestamp: new Date() 
      };
       setMessages((prev) => [...prev.filter(m => m.id !== optimisticUserMessage.id), optimisticUserMessage, systemErrorBotMessage]);
    } finally {
      setIsSendingMessage(false);
      requestAnimationFrame(() => scrollToBottom());
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };
  
  const getTimestampString = (timestamp: Date | Timestamp | undefined) => {
    if (!timestamp) return '';
    const date = timestamp instanceof Date ? timestamp : (timestamp as Timestamp).toDate();
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <Card className="w-full shadow-xl rounded-lg overflow-hidden border-border/60 h-full">
      <CardContent className="p-0 h-full">
        <div className="flex flex-col h-full">
          <div className="p-4 border-b border-border/40 bg-background/90 backdrop-blur-sm flex justify-between items-center sticky top-0 z-10">
            <h2 className="text-lg font-semibold text-primary flex items-center">
              <Sparkles className="w-5 h-5 mr-2 text-primary animate-pulse" />
              Chat with CyberMozhi
            </h2>
          </div>
          <ScrollArea className="flex-grow p-4 sm:p-6 space-y-4" ref={scrollAreaRef}>
            {isLoadingHistory && (
              <div className="flex flex-col justify-center items-center h-full py-10">
                <Loader2 className="h-10 w-10 animate-spin text-primary mb-3" />
                <p className="text-muted-foreground">Loading messages...</p>
              </div>
            )}
            {!isLoadingHistory && messages.length === 0 && (
              <div className="text-center py-10 text-muted-foreground h-full flex flex-col justify-center items-center">
                <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>{currentInternalSessionId ? "No messages in this chat yet. Send a message to start!" : "Start a new conversation!"}</p>
                {!user && <p className="text-xs mt-1">(Login to save chat history)</p>}
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
                    {getTimestampString(message.timestamp)}
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
            {isSendingMessage && !messages.find(m => m.role === 'model' && m.id.startsWith('optimistic-user-')) && (
              <div className="flex items-end gap-2.5 justify-start w-full mt-2">
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
          </ScrollArea>
          <form onSubmit={handleSubmit} className="p-3 sm:p-4 border-t border-border/40 bg-background/95 sticky bottom-0 z-10">
            <div className="flex items-center gap-2">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={authLoading ? "Authenticating..." : (!user ? "Please log in to chat..." : "Ask CyberMozhi...")} // Check !user
                className="flex-grow resize-none focus-visible:ring-primary text-sm shadow-sm"
                rows={1}
                aria-label="Chat input"
                disabled={isSendingMessage || authLoading || !user} // Check !user
              />
              <Button type="submit" size="icon" className="h-10 w-10 shadow-sm" disabled={isSendingMessage || authLoading || !user || !input.trim()} aria-label="Send message">  {/* Check !user */}
                {isSendingMessage ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
              </Button>
            </div>
          </form>
        </div>
      </CardContent>
    </Card>
  );
}
