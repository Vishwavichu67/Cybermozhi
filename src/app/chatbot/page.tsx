import { ChatInterface } from '@/components/chatbot/ChatInterface';
import { MessageCircle } from 'lucide-react';

export default function ChatbotPage() {
  return (
    <div className="flex flex-col items-center w-full animate-in fade-in-0 slide-in-from-bottom-4 duration-500 ease-out">
      <header className="mb-8 text-center">
        <MessageCircle className="w-20 h-20 text-primary mx-auto mb-4 animate-in fade-in-0 scale-75 duration-700 ease-out delay-100" />
        <h1 className="text-4xl font-headline font-bold text-primary">AI Cyber Legal Assistant</h1>
        <p className="mt-3 text-lg text-foreground/75 max-w-2xl mx-auto leading-relaxed">
          Engage with CyberMozhi for insights on Indian cyber laws, cybersecurity threats, or advice on mitigation techniques. Our AI is ready to assist in English or Tamil.
        </p>
      </header>
      <div className="w-full max-w-3xl">
        <ChatInterface />
      </div>
    </div>
  );
}
