import { ChatInterface } from '@/components/chatbot/ChatInterface';
import { MessageCircle } from 'lucide-react';

export default function ChatbotPage() {
  return (
    <div className="flex flex-col items-center w-full">
      <header className="mb-8 text-center">
        <MessageCircle className="w-16 h-16 text-primary mx-auto mb-4" />
        <h1 className="text-4xl font-headline font-bold text-primary">AI Cyber Legal Assistant</h1>
        <p className="mt-2 text-lg text-foreground/70 max-w-2xl mx-auto">
          Ask questions about Indian cyber laws, cybersecurity threats, or get advice on mitigation techniques. Our AI is here to help in English or Tamil.
        </p>
      </header>
      <div className="w-full max-w-3xl">
        <ChatInterface />
      </div>
    </div>
  );
}
