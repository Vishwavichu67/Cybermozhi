
"use client";

import { useState, useRef, useEffect, FormEvent, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Send, User, Sparkles, Loader2, Bot, MessageCircle, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { getAIChatResponse } from '@/app/chatbot/actions';
import type { ChatMessage as AIChatMessage } from '@/ai/flows/cyber-law-chatbot';
import { db } from '@/lib/firebase';
import { doc, getDoc, collection, query, orderBy, onSnapshot, type Timestamp } from 'firebase/firestore';
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

interface FirestoreMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: Timestamp;
}

interface UserDetails {
  displayName?: string;
  age?: number | null;
  gender?: string;
  preferredLanguage?: string;
  maritalStatus?: string;
  state?: string;
  city?: string;
}

interface ChatInterfaceProps {
  chatSessionId: string | null;
  setChatSessionId: (sessionId: string) => void;
}

export function ChatInterface({ chatSessionId, setChatSessionId }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { user, loading: authLoading, isLoggedIn } = useAuth();
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
            setUserDetails({ displayName: user.displayName || user.email?.split('@')[0] }); 
            setIsProfileIncomplete(true);
          }
        } catch (err) {
          console.error("Failed to fetch user details:", err);
          toast({
            variant: 'destructive',
            title: 'Profile Error',
            description: 'Could not load your profile details for personalization.'
          });
          setUserDetails({ displayName: user.displayName || user.email?.split('@')[0] });
          setIsProfileIncomplete(true);
        }
      } else {
        setUserDetails(null);
        setIsProfileIncomplete(false);
      }
    }
    if(isLoggedIn) fetchUserDetails();
  }, [user, isLoggedIn, toast]);

  const scrollToBottom = useCallback(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({ top: scrollAreaRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, []);
  
  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);
  
  const formatTimestamp = (ts: Timestamp | null) => {
    if (!ts) return '';
    return new Date(ts.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  useEffect(() => {
    if (!chatSessionId || !user) {
      setMessages([]);
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    setError(null);
    const messagesRef = collection(db, `users/${user.uid}/chatSessions/${chatSessionId}/messages`);
    const q = query(messagesRef, orderBy('timestamp'));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const fetchedMessages: Message[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data() as FirestoreMessage;
        fetchedMessages.push({
          id: doc.id,
          role: data.role,
          text: data.text,
          timestamp: formatTimestamp(data.timestamp)
        });
      });
      setMessages(fetchedMessages);
      setIsLoading(false);
    }, (err) => {
        console.error("Error fetching messages:", err);
        setError("Failed to load chat history. Please try another session or start a new one.");
        setIsLoading(false);
    });

    return () => unsubscribe();
  }, [chatSessionId, user]);


  const handleSubmit = async (e?: FormEvent<HTMLFormElement>) => {
    if (e) e.preventDefault();
    if (!input.trim() || isSendingMessage || authLoading) return;

    if (!isLoggedIn || !user) {
        toast({
            variant: 'destructive',
            title: 'Authentication Required',
            description: 'Please log in to start a conversation.',
        });
        return;
    }

    const userMessageText = input;
    setInput('');
    setIsSendingMessage(true);
    setError(null);
    
    // Add user message optimistically
    const optimisticUserMessage: Message = {
      id: Date.now().toString(),
      text: userMessageText,
      role: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages(prev => [...prev, optimisticUserMessage]);
    
    // Last 10 messages (20 turns) for context
    const chatHistoryForAI: AIChatMessage[] = messages.slice(-20).map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
    }));
    
    try {
      const result = await getAIChatResponse({
          query: userMessageText,
          userName: userDetails?.displayName || user.displayName || user.email?.split('@')[0],
          chatHistory: chatHistoryForAI,
          userDetails: userDetails,
          isProfileIncomplete: isProfileIncomplete,
          chatSessionId: chatSessionId,
          userId: user.uid
      });

      if (result.output.answer.includes("Sorry, there was a critical error")) {
          setError(result.output.answer);
      }
      
      // If this was a new chat, the server returns the new ID
      if (result.newChatSessionId && !chatSessionId) {
        setChatSessionId(result.newChatSessionId);
      }
    } catch (error) { 
      console.error('Chatbot handleSubmit error:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred.';
      setError(errorMessage);
      toast({ variant: 'destructive', title: 'Chat System Error', description: errorMessage });
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
  
  const ChatContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center text-center text-muted-foreground h-full">
            <Loader2 className="w-12 h-12 mx-auto mb-4 animate-spin" />
            <p>Loading Chat History...</p>
        </div>
      );
    }
    if (error) {
      return (
        <div className="flex flex-col items-center justify-center text-center text-destructive h-full p-4">
            <AlertCircle className="w-12 h-12 mx-auto mb-4" />
            <h2 className="text-xl font-semibold">Error Loading Chat</h2>
            <p className="max-w-md">{error}</p>
        </div>
      )
    }
    if (messages.length === 0) {
      return (
         <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center text-center text-muted-foreground h-full pt-16"
        >
            <MessageCircle className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <h2 className="text-xl font-semibold text-foreground">Start a Conversation</h2>
            <p className="max-w-xs">Ask me anything about Indian cyber law or cybersecurity. Your chat will be saved.</p>
        </motion.div>
      )
    }
    
    return (
      <AnimatePresence>
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
                    "flex flex-col max-w-[80%] md:max-w-[75%]",
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
        {isSendingMessage && !isLoading && (
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
    )
  }

  return (
    <div className="flex flex-col h-full w-full bg-background md:border-l border-border/40">
      <header className="flex-shrink-0 flex items-center p-3 border-b border-border/40 bg-background/95 backdrop-blur-sm z-10 rounded-t-xl">
        <Avatar className="h-9 w-9 mr-3">
            <AvatarFallback className="bg-primary text-primary-foreground">
                <Bot className="h-5 w-5"/>
            </AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
            <h1 className="text-md font-bold text-primary">CyberMozhi</h1>
            <p className={cn("text-xs", isLoggedIn ? "text-green-600" : "text-destructive font-medium")}>
              {authLoading ? 'Connecting...' : (isLoggedIn ? 'Online' : 'Offline - Please login')}
            </p>
        </div>
      </header>

      <main ref={scrollAreaRef} className="flex-1 overflow-y-auto p-4 md:px-6 space-y-4">
        <ChatContent />
      </main>

      <footer className="flex-shrink-0 p-3 sm:p-4 border-t border-border/40 bg-background/95 z-10">
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
            <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={authLoading ? "Authenticating..." : (!isLoggedIn ? "Please log in to chat." : "Ask anything...")}
                className="flex-grow resize-none focus-visible:ring-primary text-sm shadow-sm rounded-full py-2 px-4 max-h-24"
                rows={1}
                aria-label="Chat input"
                disabled={isSendingMessage || authLoading || !isLoggedIn || isLoading}
            />
            <Button type="submit" size="icon" className="h-10 w-10 shadow-sm rounded-full flex-shrink-0" disabled={isSendingMessage || authLoading || !isLoggedIn || !input.trim() || isLoading} aria-label="Send message">
                {isSendingMessage ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
            </Button>
        </form>
         <p className="text-xs text-muted-foreground text-center mt-2 px-2">
          CyberMozhi can make mistakes. Consider checking important information.
        </p>
      </footer>
    </div>
  );
}
