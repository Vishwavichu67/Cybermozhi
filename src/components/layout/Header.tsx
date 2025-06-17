
"use client";

import Link from 'next/link';
import { MessageCircle, Gavel, BookOpen, Menu, X, LogIn, LogOut, Rocket, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetClose } from '@/components/ui/sheet';
import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { signOut as firebaseSignOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import Image from 'next/image';


const navItems = [
  { href: '/', label: 'Home', icon: Rocket },
  { href: '/chatbot', label: 'AI Chatbot', icon: MessageCircle },
  { href: '/law-summaries', label: 'Law Summaries', icon: Gavel },
  { href: '/glossary', label: 'Cyber Glossary', icon: BookOpen },
  { href: '/guide', label: 'Site Guide', icon: Rocket },
];

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, isLoggedIn, loading: authLoading } = useAuth();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      await firebaseSignOut(auth);
      toast({
        title: 'Logged Out',
        description: 'You have been successfully logged out.',
      });
      if (isMobileMenuOpen) setIsMobileMenuOpen(false);
      router.push('/'); // Redirect to home after logout
    } catch (error) {
      console.error('Logout error:', error);
      toast({
        variant: 'destructive',
        title: 'Logout Failed',
        description: 'Could not log you out. Please try again.',
      });
    }
  };

  const NavLink = ({ href, label, icon: Icon, onClick }: { href: string, label: string, icon: React.ElementType, onClick?: () => void }) => (
    <Link href={href} legacyBehavior passHref>
      <a
        onClick={() => {
          if (onClick) onClick();
          if (isMobileMenuOpen) setIsMobileMenuOpen(false);
        }}
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

  const getInitials = (email?: string | null) => {
    if (!email) return 'U';
    const namePart = email.split('@')[0];
    if (namePart) {
        // Attempt to get initials from name part if it contains a separator like '.' or '_'
        const parts = namePart.replace(/[^a-zA-Z0-9]/g, ' ').split(' ').filter(Boolean);
        if (parts.length > 1) {
            return (parts[0]?.[0] || '') + (parts[parts.length - 1]?.[0] || '');
        }
        if (parts.length === 1 && parts[0]?.length > 1) {
             return (parts[0]?.[0] || '') + (parts[0]?.[1] || '');
        }
        return namePart[0]?.toUpperCase() || 'U';
    }
    return 'U';
  };


  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" legacyBehavior passHref>
          <a className="flex items-center gap-2 text-xl font-headline font-semibold text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background rounded-md p-1">
            <Image 
              src="/logo.png"
              alt="CyberMozhi Logo" 
              width={150} 
              height={40} 
              priority 
            />
          </a>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-1">
          {navItems.map((item) => (
            <NavLink key={item.href} {...item} />
          ))}
        </nav>

        {/* Auth Buttons - Desktop */}
        <div className="hidden md:flex items-center space-x-2">
          {authLoading ? (
            <Button variant="ghost" size="sm" disabled>
              <Loader2 className="h-5 w-5 animate-spin" />
            </Button>
          ) : isLoggedIn && user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full p-0">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                      {getInitials(user.email)}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none truncate">
                      {user.displayName || user.email?.split('@')[0]}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground truncate">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button asChild variant="default" size="sm">
              <Link href="/login">
                <LogIn className="mr-2 h-4 w-4" /> Login
              </Link>
            </Button>
          )}
        </div>


        {/* Mobile Navigation Trigger & Auth */}
        <div className="md:hidden flex items-center">
           {authLoading ? (
             <Button variant="ghost" size="icon" className="mr-1" disabled>
                <Loader2 className="h-5 w-5 animate-spin" />
             </Button>
           ) : !isLoggedIn && (
            <Button asChild variant="ghost" size="sm" className="mr-1 px-2">
              <Link href="/login">Login</Link>
            </Button>
          )}
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Open menu">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full max-w-xs p-0 bg-background flex flex-col">
              <div className="flex items-center justify-between p-4 border-b">
                 <Link href="/" legacyBehavior passHref>
                  <a className="flex items-center gap-2 text-lg font-headline font-semibold text-primary" onClick={() => setIsMobileMenuOpen(false)}>
                     <Image 
                        src="/logo.png" 
                        alt="CyberMozhi Logo" 
                        width={120} 
                        height={30} 
                      />
                  </a>
                </Link>
                <SheetClose asChild>
                   <Button variant="ghost" size="icon" aria-label="Close menu">
                      <X className="h-6 w-6" />
                    </Button>
                </SheetClose>
              </div>
              
              <nav className="flex-grow p-4 space-y-2">
                {navItems.map((item) => (
                  <NavLink key={item.href} {...item} />
                ))}
              </nav>

              {!authLoading && isLoggedIn && user && (
                <div className="p-4 border-t">
                  <div className="flex items-center gap-3 mb-3">
                     <Avatar className="h-10 w-10">
                       <AvatarFallback className="bg-primary text-primary-foreground">
                         {getInitials(user.email)}
                       </AvatarFallback>
                    </Avatar>
                    <div className="truncate">
                      <p className="text-sm font-medium leading-none truncate">
                        {user.displayName || user.email?.split('@')[0]}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground truncate">
                        {user.email}
                      </p>
                    </div>
                  </div>
                  <Button onClick={handleLogout} variant="outline" className="w-full">
                    <LogOut className="mr-2 h-4 w-4" /> Logout
                  </Button>
                </div>
              )}
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
