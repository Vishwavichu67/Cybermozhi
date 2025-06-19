
"use client";

import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  MessageCircle,
  FileText,
  BookOpen,
  LogIn,
  UserPlus,
  ArrowRight,
  Sparkles,
  LayoutDashboard,
  AlertCircle,
  Lightbulb,
  ScrollText,
  ClipboardCheck,
  FileLock, 
  KeyRound, 
  FileSignature,
  UserCircle2, 
  History
} from "lucide-react";

const sampleTopics = [
  { name: "Phishing Attacks", icon: UserPlus, description: "Learn to identify and avoid deceptive emails and messages.", link: "/glossary#1" },
  { name: "Ransomware Threats", icon: FileLock, description: "Understand how ransomware works and how to protect your data.", link: "/glossary#10" },
  { name: "IT Act: Section 66C", icon: KeyRound, description: "Identity theft and its legal consequences under Indian law.", link: "/law-summaries#3" },
  { name: "Digital Signatures", icon: FileSignature, description: "The role and legality of digital signatures in India.", link: "/glossary#33" },
];

const coreFeatures = [
  {
    icon: MessageCircle,
    title: "AI Chatbot Assistant",
    description: "Get instant, bilingual (Tamil & English) answers to your cyber law and security questions. Understand complex terms and mitigation techniques.",
    link: "/chatbot",
    linkText: "Ask AI Now",
  },
  {
    icon: FileText,
    title: "Indian Cyber Law Summaries",
    description: "Explore concise summaries of key sections from the Indian IT Act 2000 and relevant IPC sections. Know your rights and legal remedies.",
    link: "/law-summaries",
    linkText: "Explore Laws",
  },
  {
    icon: BookOpen,
    title: "Cybersecurity Glossary",
    description: "Demystify complex cybersecurity and legal jargon with our layman-friendly glossary. Enhance your digital literacy.",
    link: "/glossary",
    linkText: "Browse Glossary",
  },
];


export default function HomePage() {
  const { user, isLoggedIn, loading: authLoading } = useAuth();

  if (authLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh]">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
        <p className="mt-4 text-lg text-muted-foreground">Loading Your CyberMozhi Experience...</p>
      </div>
    );
  }

  // Guest User View
  if (!isLoggedIn) {
    return (
      <div className="flex flex-col items-center space-y-16">
        {/* Hero Section for Guests */}
        <section className="w-full py-12 md:py-20 lg:py-28 bg-gradient-to-br from-primary/10 via-background to-accent/10 rounded-xl shadow-lg text-center">
          <div className="container px-4 md:px-6">
            <Sparkles className="w-16 h-16 md:w-20 md:h-20 text-primary mx-auto mb-6" />
            <h1 className="text-3xl font-headline font-bold tracking-tight sm:text-4xl md:text-5xl text-primary">
              Welcome to CyberMozhi! வணக்கம்!
            </h1>
            <p className="mt-6 text-lg md:text-xl text-foreground/80 max-w-3xl mx-auto">
              Your AI-powered bilingual (Tamil & English) assistant for understanding Indian cyber laws, online threats, cybersecurity best practices, and legal remedies.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="shadow-md hover:shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105">
                <Link href="/chatbot">
                  Try AI Chatbot (Limited Access) <MessageCircle className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="shadow-md hover:shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105">
                <Link href="/law-summaries">
                  Explore Cyber Laws <FileText className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* What You Can Learn Section */}
        <section className="w-full container px-4 md:px-6">
          <h2 className="text-3xl font-headline font-bold tracking-tight text-center text-primary mb-12">
            Discover Key Cyber Topics
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {sampleTopics.map((topic) => (
              <Card key={topic.name} className="shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out transform hover:scale-105 rounded-lg flex flex-col">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <topic.icon className="w-8 h-8 text-accent flex-shrink-0" />
                    <CardTitle className="text-lg font-headline text-accent">{topic.name}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="flex-grow">
                  <p className="text-sm text-foreground/70">{topic.description}</p>
                </CardContent>
                <div className="p-4 pt-0">
                  <Button asChild variant="link" className="text-primary p-0 h-auto hover:text-accent text-sm transition-colors duration-200">
                    <Link href={topic.link}>
                      Learn More <ArrowRight className="ml-1 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* Core Features Section for Guests */}
        <section className="w-full py-12 md:py-16 bg-background">
          <div className="container px-4 md:px-6">
            <h2 className="text-3xl font-headline font-bold tracking-tight text-center text-primary mb-12">
              Explore Our Resources
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {coreFeatures.map((feature) => (
                <Card key={feature.title} className="flex flex-col shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out transform hover:scale-105 rounded-lg overflow-hidden">
                  <CardHeader className="bg-primary/5 p-6">
                    <div className="flex items-center gap-4">
                      <feature.icon className="w-10 h-10 text-primary" />
                      <CardTitle className="text-xl font-headline text-primary">{feature.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6 flex-grow">
                    <CardDescription className="text-foreground/70 leading-relaxed">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                  <div className="p-6 pt-0 mt-auto">
                    <Button asChild variant="link" className="text-primary p-0 h-auto hover:text-accent transition-colors duration-200">
                      <Link href={feature.link}>
                        {feature.linkText} <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Unlock Full Potential Section */}
        <section className="w-full py-12 md:py-20 bg-accent/10 rounded-xl shadow-lg text-center">
          <div className="container px-4 md:px-6">
            <LogIn className="w-12 h-12 text-accent mx-auto mb-6" />
            <h2 className="text-3xl font-headline font-bold tracking-tight text-accent mb-4">
              Unlock CyberMozhi's Full Potential
            </h2>
            <p className="mt-4 max-w-2xl mx-auto text-lg text-foreground/80">
              Create a free account or login to access personalized advice, save your learning progress and chat history, download FIR templates, take quizzes, and enjoy unlimited AI chatbot interactions.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 shadow-md hover:shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105">
                <Link href="/signup">
                  Create Free Account <UserPlus className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="shadow-md hover:shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105 border-accent text-accent hover:bg-accent/20">
                <Link href="/login">
                  Login to Your Account <LogIn className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </div>
    );
  }

  // Logged-in User View
  return (
    <div className="flex flex-col items-center space-y-12">
      {/* Personalized Greeting */}
      <section className="w-full py-10 text-center bg-gradient-to-r from-primary/10 to-accent/10 rounded-xl shadow-md">
        <div className="container px-4 md:px-6">
          <h1 className="text-3xl sm:text-4xl font-headline font-bold text-primary">
            Vanakkam, {user?.displayName || user?.email?.split('@')[0]}!
          </h1>
          <p className="mt-3 text-lg text-foreground/80">
            Welcome back to your CyberMozhi dashboard. Let's continue your journey to digital safety and legal awareness.
          </p>
        </div>
      </section>

      {/* Conceptual Dashboard Section */}
      <section className="w-full container px-4 md:px-6">
        <div className="flex items-center gap-3 mb-8">
          <LayoutDashboard className="w-8 h-8 text-primary" />
          <h2 className="text-3xl font-headline font-bold text-primary">Your Dashboard</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card 1: Account Details (Conceptual) */}
          <Card className="shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out transform hover:scale-105">
            <CardHeader>
              <div className="flex items-center gap-3">
                <UserCircle2 className="w-7 h-7 text-primary" />
                <CardTitle className="text-xl font-headline text-primary">Account Details</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-foreground/70 mb-1">Manage your profile information like name, phone, gender, and date of birth.</p>
              <p className="text-sm text-foreground/70">This helps personalize your CyberMozhi experience and the AI Chatbot's responses.</p>
            </CardContent>
            <div className="p-4 pt-0">
              <Button asChild variant="outline" className="w-full transition-shadow hover:shadow-md">
                <Link href="#"> {/* Placeholder for /profile or /account page */}
                  View/Edit Profile <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </Card>

          {/* Card 2: Chat History (Conceptual) */}
          <Card className="shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out transform hover:scale-105">
            <CardHeader>
              <div className="flex items-center gap-3">
                <History className="w-7 h-7 text-primary" />
                <CardTitle className="text-xl font-headline text-primary">Chat History</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-foreground/70 mb-1">Revisit your previous conversations with CyberMozhi AI.</p>
              <p className="text-sm text-foreground/70">Your chat history helps the AI provide better, contextual answers over time.</p>
            </CardContent>
             <div className="p-4 pt-0">
              <Button asChild variant="outline" className="w-full transition-shadow hover:shadow-md">
                <Link href="/chatbot"> 
                  View Chat History <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </Card>
          
          {/* Card 3: Saved FIR Drafts (Conceptual) */}
          <Card className="shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out transform hover:scale-105">
            <CardHeader>
               <div className="flex items-center gap-3">
                <ScrollText className="w-7 h-7 text-primary" />
                <CardTitle className="text-xl font-headline text-primary">FIR Drafts</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-foreground/70 mb-1">You have <span className="font-semibold">0 FIR drafts</span> in progress.</p>
              <p className="text-sm text-foreground/70">Access and manage your saved complaint drafts (Feature Coming Soon).</p>
            </CardContent>
             <div className="p-4 pt-0">
              <Button asChild variant="outline" className="w-full transition-shadow hover:shadow-md" disabled>
                <Link href="#"> {/* Placeholder link for /fir-drafts */}
                  Manage My Drafts <FileText className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </Card>

          {/* Card 4: Quiz Progress (Conceptual) */}
          <Card className="shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out transform hover:scale-105">
            <CardHeader>
              <div className="flex items-center gap-3">
                <ClipboardCheck className="w-7 h-7 text-primary" />
                <CardTitle className="text-xl font-headline text-primary">Quiz Progress</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-foreground/70 mb-1">Latest Quiz: <span className="font-semibold">No quizzes taken yet.</span></p>
              <p className="text-sm text-foreground/70">Test your knowledge and earn badges! (Feature Coming Soon).</p>
            </CardContent>
             <div className="p-4 pt-0">
              <Button asChild variant="outline" className="w-full transition-shadow hover:shadow-md" disabled>
                <Link href="#"> {/* Placeholder link for /quizzes */}
                  View All Quizzes <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </Card>

           {/* Card 5: Suggested For You (Conceptual) */}
          <Card className="shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out transform hover:scale-105 md:col-span-2 lg:col-span-3">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Lightbulb className="w-7 h-7 text-primary" />
                <CardTitle className="text-xl font-headline text-primary">Suggested For You</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-foreground/70 mb-2">Based on your interests, you might want to explore:</p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary" className="transition-transform hover:scale-110 cursor-pointer">Understanding Data Privacy</Badge>
                <Badge variant="secondary" className="transition-transform hover:scale-110 cursor-pointer">Key IT Act Sections</Badge>
                <Badge variant="secondary" className="transition-transform hover:scale-110 cursor-pointer">Reporting Cybercrime</Badge>
              </div>
              <p className="text-sm text-foreground/70 mt-3">Deepen your understanding of crucial legal and security aspects.</p>
            </CardContent>
            <div className="p-4 pt-0">
              <Button asChild className="w-full transition-shadow hover:shadow-md">
                <Link href="/law-summaries"> 
                  Explore Topics <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </Card>
        </div>
      </section>

      {/* Quick Access to Core Features */}
      <section className="w-full container px-4 md:px-6 py-10">
         <h2 className="text-3xl font-headline font-bold tracking-tight text-center text-primary mb-12">
            Quick Access to Resources
          </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {coreFeatures.map((feature) => (
              <Card key={feature.title} className="flex flex-col shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out transform hover:scale-105 rounded-lg overflow-hidden">
                <CardHeader className="bg-primary/5 p-6">
                  <div className="flex items-center gap-4">
                    <feature.icon className="w-10 h-10 text-primary" />
                    <CardTitle className="text-xl font-headline text-primary">{feature.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="p-6 flex-grow">
                  <CardDescription className="text-foreground/70 leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
                <div className="p-6 pt-0 mt-auto">
                  <Button asChild className="w-full transition-shadow hover:shadow-md">
                    <Link href={feature.link}>
                      {feature.linkText} <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </Card>
            ))}
          </div>
      </section>


      {/* Full AI Chatbot Access Section */}
      <section className="w-full py-12 md:py-16 bg-accent/10 rounded-xl shadow-lg">
        <div className="container px-4 md:px-6 text-center">
          <MessageCircle className="w-12 h-12 text-accent mx-auto mb-6" />
          <h2 className="text-3xl font-headline font-bold tracking-tight text-accent">
            Your AI Legal & Cyber Guide Awaits
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-foreground/80">
            Leverage the full power of CyberMozhi's bilingual AI. Get detailed explanations on cyber laws, IT Act sections, penalties, attack mitigation, and guidance on filing complaints. The AI will also consider your chat history for a more personalized experience.
          </p>
          <div className="mt-8">
            <Button asChild size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 shadow-md hover:shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105">
              <Link href="/chatbot">
                Chat with CyberMozhi AI <Sparkles className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Slogan */}
      <footer className="py-10 text-center">
        <p className="text-xl font-semibold text-primary">CyberMozhi: Speak Law. Speak Secure. Speak Smart. 💬⚖️🌐</p>
      </footer>
    </div>
  );
}
