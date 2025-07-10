
'use client';

import type { Metadata } from 'next';
import './globals.css';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/components/layout/ThemeProvider';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

// Note: Metadata is usually static in the root layout.
// For dynamic titles, you'd use the `generateMetadata` function in page.tsx files.
// export const metadata: Metadata = {
//   title: 'CyberMozhi',
//   description: 'Your one-stop cybersecurity knowledge center and virtual legal advisor for Indian netizens.',
// };

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const isChatPage = pathname === '/chat';

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>CyberMozhi</title>
        <meta name="description" content="Your one-stop cybersecurity knowledge center and virtual legal advisor for Indian netizens." />
        <link rel="icon" href="/favicon.png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased flex flex-col min-h-screen">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <Header />
            <main className={cn(
              "flex-grow",
              // Apply container styles only if it's NOT the chat page
              !isChatPage && "container mx-auto px-4 py-8"
            )}>
              {children}
            </main>
            <Footer />
            <Toaster />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
