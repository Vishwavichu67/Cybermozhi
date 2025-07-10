
import type { Metadata } from 'next';
import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/components/layout/ThemeProvider';
import { Toaster } from '@/components/ui/toaster';

export const metadata: Metadata = {
  title: 'AI Chatbot - CyberMozhi',
  description: 'Chat with our AI Cyber Legal Assistant.',
};

export default function ChatbotLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="font-body antialiased flex flex-col h-[100dvh] overflow-hidden">
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <AuthProvider>
          <main className="flex-grow flex flex-col h-full w-full">
            {children}
          </main>
          <Toaster />
        </AuthProvider>
      </ThemeProvider>
    </div>
  );
}
