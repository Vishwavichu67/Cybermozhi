
"use client";

import { useState, useRef, useEffect, FormEvent, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Send, User, Sparkles, Loader2, MessageCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { getAIChatResponse } from '@/app/chatbot/actions';
import type { ChatMessage as AIChatMessage } from '@/ai/flows/cyber-law-chatbot';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

// Local message type
interface Message {
  id: string;
  text: string;
  role: 'user' | 'model';
}

interface UserDetails {
  displayName: string;
  age?: number | null;
  gender?: string;
  preferredLanguage?: string;
  maritalStatus?: string;
  state?: string;
  city?: string;
}

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
  
  useEffect(() => {
    async function fetchUserDetails() {
      if (user) {
        const userDocRef = doc(db, 'users', user.uid);
        try {
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists()) {
            setUserDetails(userDoc.data() as UserDetails);
          }
        } catch (err) {
          console.error("Failed to fetch user details:", err);
          toast({
            variant: 'destructive',
            title: 'Profile Error',
            description: 'Could not load your profile details for personalization.'
          });
        }
      } else {
        setUserDetails(null);
      }
    }
    fetchUserDetails();
  }, [user, toast]);

  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      if (scrollAreaRef.current) {
        scrollAreaRef.current.scrollTo({ top: scrollAreaRef.current.scrollHeight, behavior: 'smooth' });
      }
    }, 100);
  }, []);

  useEffect(() => {
      scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleSubmit = async (e?: FormEvent<HTMLFormElement>) => {
    if (e) e.preventDefault();
    if (!input.trim() || isSendingMessage || !user) return;

    const userMessageText = input;
    const userMessage: Message = { id: Date.now().toString(), text: userMessageText, role: 'user' };

    setInput('');
    setMessages(prev => [...prev, userMessage]);
    setIsSendingMessage(true);

    try {
      const chatHistoryForAI: AIChatMessage[] = messages.slice(-10).map(m => ({
          role: m.role,
          parts: [{ text: m.text }]
      }));
      chatHistoryForAI.push({ role: 'user', parts: [{ text: userMessageText }] });

      const userName = user.displayName || user.email?.split('@')[0];

      const result = await getAIChatResponse({
          query: userMessageText,
          userName: userName,
          chatHistory: chatHistoryForAI,
          userDetails: userDetails,
      });

      const aiMessageText = result.error ? `Sorry, an error occurred: ${result.error}` : result.answer;
      if (result.error) {
        toast({ variant: 'destructive', title: 'Chatbot Error', description: result.error });
      }
      
      const aiMessage: Message = { id: (Date.now() + 1).toString(), text: aiMessageText, role: 'model' };
      setMessages(prev => [...prev, aiMessage]);

    } catch (error) { 
      console.error('Chatbot handleSubmit error:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred.';
      toast({ variant: 'destructive', title: 'Chat System Error', description: errorMessage });
       const errorResponseMessage: Message = { id: (Date.now() + 1).toString(), text: errorMessage, role: 'model' };
      setMessages(prev => [...prev, errorResponseMessage]);
    } finally {
      setIsSendingMessage(false);
    }
  };


  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <Card className="w-full shadow-xl rounded-lg overflow-hidden border-border/60 h-full">
      <CardContent className="p-0 h-full">
        <div className="flex flex-col h-full">
          <div className="p-4 border-b border-border/40 bg-background/90 backdrop-blur-sm flex justify-between items-center sticky top-0 z-10">
            <h2 className="text-lg font-semibold text-primary flex items-center">
              <Sparkles className="w-5 h-5 mr-2 text-primary animate-pulse" />
              AI Cyber Legal Assistant
            </h2>
          </div>
          <ScrollArea className="flex-grow p-4 sm:p-6" ref={scrollAreaRef}>
            <div className="space-y-4">
              {messages.length === 0 && (
                <div className="text-center py-10 text-muted-foreground h-full flex flex-col justify-center items-center">
                  <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Start a conversation by sending a message!</p>
                </div>
              )}
              {messages.map((message) => (
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
              {isSendingMessage && (
                <div className="flex items-end gap-2.5 justify-start w-full mt-2">
                  <Avatar className="h-8 w-8 shadow-md flex-shrink-0">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      <Sparkles className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="max-w-[70%] p-3 rounded-xl shadow-md bg-card border border-border/50 text-card-foreground rounded-bl-none">
                    <div className="flex items-center space-x-1">
                      <span className="h-2 w-2 bg-muted-foreground rounded-full animate-pulse" style={{animationDelay: '0s'}}></span>
                      <span className="h-2 w-2 bg-muted-foreground rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></span>
                      <span className="h-2 w-2 bg-muted-foreground rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
          <form onSubmit={handleSubmit} className="p-3 sm:p-4 border-t border-border/40 bg-background/95 sticky bottom-0 z-10">
            <div className="flex items-center gap-2">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={authLoading ? "Authenticating..." : (!user ? "Please log in to chat..." : "Ask CyberMozhi...")}
                className="flex-grow resize-none focus-visible:ring-primary text-sm shadow-sm"
                rows={1}
                aria-label="Chat input"
                disabled={isSendingMessage || authLoading || !user}
              />
              <Button type="submit" size="icon" className="h-10 w-10 shadow-sm" disabled={isSendingMessage || authLoading || !user || !input.trim()} aria-label="Send message">
                {isSendingMessage ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
              </Button>
            </div>
          </form>
        </div>
      </CardContent>
    </Card>
  );
}
