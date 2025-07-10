
"use client";

import { useState, useRef, useEffect, FormEvent, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Send, User, Sparkles, Loader2, ArrowLeft, Bot, MessageCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { getAIChatResponse } from '@/app/chatbot/actions';
import type { ChatMessage as AIChatMessage } from '@/ai/flows/cyber-law-chatbot';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';

// Local message type
interface Message {
  id: string;
  text: string;
  role: 'user' | 'model';
  timestamp: string;
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
  const [isProfileIncomplete, setIsProfileIncomplete] = useState(false);

  useEffect(() => {
    async function fetchUserDetails() {
      if (user) {
        const userDocRef = doc(db, 'users', user.uid);
        try {
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists()) {
            const data = userDoc.data();
            setUserDetails(data as UserDetails);
            if (!data.state && !data.maritalStatus && !data.age) {
               setIsProfileIncomplete(true);
            } else {
               setIsProfileIncomplete(false);
            }
          } else {
            setUserDetails(null); 
            setIsProfileIncomplete(true);
          }
        } catch (err) {
          console.error("Failed to fetch user details:", err);
          toast({
            variant: 'destructive',
            title: 'Profile Error',
            description: 'Could not load your profile details for personalization.'
          });
          setUserDetails(null);
          setIsProfileIncomplete(true);
        }
      } else {
        setUserDetails(null);
        setIsProfileIncomplete(false);
      }
    }
    fetchUserDetails();
  }, [user, toast]);

  const scrollToBottom = useCallback(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({ top: scrollAreaRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const getCurrentTimestamp = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const handleSubmit = async (e?: FormEvent<HTMLFormElement>) => {
    if (e) e.preventDefault();
    if (!input.trim() || isSendingMessage || !user) return;

    const userMessageText = input;
    const userMessage: Message = { 
      id: Date.now().toString(), 
      text: userMessageText, 
      role: 'user', 
      timestamp: getCurrentTimestamp() 
    };

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
          isProfileIncomplete: isProfileIncomplete,
      });

      const aiMessageText = result.error ? `Sorry, an error occurred: ${result.error}` : result.answer;
      if (result.error) {
        toast({ variant: 'destructive', title: 'Chatbot Error', description: result.error });
      }
      
      const aiMessage: Message = { 
        id: (Date.now() + 1).toString(), 
        text: aiMessageText, 
        role: 'model',
        timestamp: getCurrentTimestamp()
      };
      setMessages(prev => [...prev, aiMessage]);

    } catch (error) { 
      console.error('Chatbot handleSubmit error:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred.';
      toast({ variant: 'destructive', title: 'Chat System Error', description: errorMessage });
       const errorResponseMessage: Message = { 
         id: (Date.now() + 1).toString(), 
         text: errorMessage, 
         role: 'model', 
         timestamp: getCurrentTimestamp() 
      };
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
    <div className="flex flex-col h-full w-full bg-background">
      <header className="flex-shrink-0 flex items-center p-3 border-b border-border/40 bg-background/95 backdrop-blur-sm z-10">
         <Button variant="ghost" size="icon" className="mr-2" asChild>
            <Link href="/">
                <ArrowLeft className="h-5 w-5" />
            </Link>
        </Button>
        <Avatar className="h-9 w-9 mr-3">
            <AvatarFallback className="bg-primary text-primary-foreground">
                <Bot className="h-5 w-5"/>
            </AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
            <h1 className="text-md font-bold text-primary">AI Legal Assistant</h1>
            <p className="text-xs text-muted-foreground">Online</p>
        </div>
      </header>

      <main ref={scrollAreaRef} className="flex-1 overflow-y-auto">
        <div className="p-4 md:px-6 space-y-4">
            <AnimatePresence>
                {messages.length === 0 && !isSendingMessage && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex flex-col items-center justify-center text-center text-muted-foreground h-full pt-16"
                    >
                        <MessageCircle className="w-16 h-16 mx-auto mb-4 opacity-50" />
                        <h2 className="text-xl font-semibold text-foreground">Start a Conversation</h2>
                        <p className="max-w-xs">Ask me anything about Indian cyber law or cybersecurity. I'm here to help!</p>
                    </motion.div>
                )}
                {messages.map((message) => (
                    <motion.div
                        key={message.id}
                        layout
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                        className={cn(
                            "flex items-end gap-2.5 w-full",
                            message.role === 'user' ? 'justify-end' : 'justify-start'
                        )}
                    >
                        {message.role === 'model' && (
                            <Avatar className="h-8 w-8 shadow-sm flex-shrink-0 self-start">
                                <AvatarFallback className="bg-primary text-primary-foreground">
                                    <Sparkles className="h-4 w-4" />
                                </AvatarFallback>
                            </Avatar>
                        )}
                         <div
                            className={cn(
                            "flex flex-col max-w-[80%] md:max-w-[65%]",
                            message.role === 'user' ? 'items-end' : 'items-start'
                            )}
                        >
                            <div
                                className={cn(
                                    "p-3 rounded-2xl shadow-sm",
                                    message.role === 'user'
                                    ? 'bg-primary text-primary-foreground rounded-br-lg'
                                    : 'bg-card border border-border/50 text-card-foreground rounded-bl-lg'
                                )}
                            >
                                 {message.role === 'user' ? (
                                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.text}</p>
                                ) : (
                                    <ReactMarkdown
                                        className="prose prose-sm dark:prose-invert max-w-none break-words"
                                        remarkPlugins={[remarkGfm]}
                                        rehypePlugins={[rehypeRaw]}
                                        components={{
                                            p: ({node, ...props}) => <p className="mb-2 last:mb-0" {...props} />,
                                            a: ({node, ...props}) => <a className="text-primary hover:underline" target="_blank" rel="noopener noreferrer" {...props} />,
                                            strong: ({node, ...props}) => <strong className="text-primary font-bold" {...props} />
                                        }}
                                    >
                                        {message.text}
                                    </ReactMarkdown>
                                )}
                            </div>
                            <span className="text-xs text-muted-foreground mt-1.5 px-1">{message.timestamp}</span>
                        </div>

                        {message.role === 'user' && (
                            <Avatar className="h-8 w-8 shadow-sm flex-shrink-0 self-start">
                                <AvatarFallback className="bg-accent text-accent-foreground">
                                    <User className="h-4 w-4" />
                                </AvatarFallback>
                            </Avatar>
                        )}
                    </motion.div>
                ))}
                {isSendingMessage && (
                     <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-end gap-2.5 justify-start w-full"
                    >
                      <Avatar className="h-8 w-8 shadow-sm flex-shrink-0 self-start">
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          <Sparkles className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="max-w-[70%] p-3 rounded-2xl shadow-sm bg-card border border-border/50 text-card-foreground rounded-bl-lg">
                        <div className="flex items-center space-x-1.5">
                          <span className="h-1.5 w-1.5 bg-muted-foreground rounded-full animate-pulse" style={{animationDelay: '0s'}}></span>
                          <span className="h-1.5 w-1.5 bg-muted-foreground rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></span>
                          <span className="h-1.5 w-1.5 bg-muted-foreground rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></span>
                        </div>
                      </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
      </main>

      <footer className="flex-shrink-0 p-3 sm:p-4 border-t border-border/40 bg-background/95 z-10">
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
            <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={authLoading ? "Authenticating..." : (!user ? "Please log in to chat..." : "Ask anything...")}
                className="flex-grow resize-none focus-visible:ring-primary text-sm shadow-sm rounded-full py-2 px-4 max-h-24"
                rows={1}
                aria-label="Chat input"
                disabled={isSendingMessage || authLoading || !user}
            />
            <Button type="submit" size="icon" className="h-10 w-10 shadow-sm rounded-full flex-shrink-0" disabled={isSendingMessage || authLoading || !user || !input.trim()} aria-label="Send message">
                {isSendingMessage ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
            </Button>
        </form>
      </footer>
    </div>
  );
}
