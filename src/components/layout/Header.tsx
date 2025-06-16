
"use client";

import Link from 'next/link';
import { ShieldCheck, MessageCircle, FileText, BookOpen, Menu, X, Landmark, UsersRound, AlertTriangle, BookMarked, Gavel } from 'lucide-react'; // Added Gavel
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetClose } from '@/components/ui/sheet';
import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/', label: 'Home', icon: ShieldCheck },
  { href: '/chatbot', label: 'AI Chatbot', icon: MessageCircle },
  { href: '/law-summaries', label: 'Law Summaries', icon: Gavel }, // Changed icon to Gavel
  { href: '/glossary', label: 'Cyber Glossary', icon: BookOpen },
];

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const NavLink = ({ href, label, icon: Icon, onClick }: { href: string, label: string, icon: React.ElementType, onClick?: () => void }) => (
    <Link href={href} legacyBehavior passHref>
      <a
        onClick={onClick}
        className={cn(
          "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
          pathname === href
            ? "bg-primary/10 text-primary hover:bg-primary/20"
            : "text-foreground/70 hover:text-foreground hover:bg-accent/50",
          "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
        )}
        aria-current={pathname === href ? "page" : undefined}
      >
        <Icon className="h-5 w-5" />
        <span>{label}</span>
      </a>
    </Link>
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" legacyBehavior passHref>
          <a className="flex items-center gap-2 text-xl font-headline font-semibold text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background rounded-md p-1">
            <ShieldCheck className="h-7 w-7" />
            <span>CyberLaw Simplified</span>
          </a>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-1">
          {navItems.map((item) => (
            <NavLink key={item.href} {...item} />
          ))}
        </nav>

        {/* Mobile Navigation */}
        <div className="md:hidden">
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Open menu">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full max-w-xs p-6 bg-background">
              <div className="flex flex-col space-y-4">
                <div className="flex justify-between items-center mb-4">
                   <Link href="/" legacyBehavior passHref>
                    <a className="flex items-center gap-2 text-lg font-headline font-semibold text-primary" onClick={() => setIsMobileMenuOpen(false)}>
                      <ShieldCheck className="h-6 w-6" />
                      <span>CyberLaw Simplified</span>
                    </a>
                  </Link>
                  <SheetClose asChild>
                     <Button variant="ghost" size="icon" aria-label="Close menu">
                        <X className="h-6 w-6" />
                      </Button>
                  </SheetClose>
                </div>
                {navItems.map((item) => (
                  <NavLink key={item.href} {...item} onClick={() => setIsMobileMenuOpen(false)} />
                ))}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}

    