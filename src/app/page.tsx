import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { MessageCircle, FileText, BookOpen, ArrowRight, ShieldCheck, Search, Gavel } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

const features = [
  {
    icon: MessageCircle,
    title: "AI Chatbot Assistant",
    description: "Get instant, bilingual (Tamil & English) answers to your cyber law and security questions. Understand complex terms and mitigation techniques.",
    link: "/chatbot",
    linkText: "Ask AI Now",
    dataAiHint: "chatbot conversation",
  },
  {
    icon: FileText,
    title: "Indian Cyber Law Summaries",
    description: "Explore concise summaries of key sections from the Indian IT Act 2000 and relevant IPC sections. Know your rights and legal remedies.",
    link: "/law-summaries",
    linkText: "Explore Laws",
    dataAiHint: "legal document",
  },
  {
    icon: BookOpen,
    title: "Cybersecurity Glossary",
    description: "Demystify complex cybersecurity and legal jargon with our layman-friendly glossary. Enhance your digital literacy.",
    link: "/glossary",
    linkText: "Browse Glossary",
    dataAiHint: "open book",
  },
];

export default function HomePage() {
  return (
    <div className="flex flex-col items-center">
      {/* Hero Section */}
      <section className="w-full py-12 md:py-20 lg:py-28 bg-gradient-to-br from-primary/10 via-background to-accent/10 rounded-xl shadow-lg">
        <div className="container px-4 md:px-6 text-center">
          <div className="max-w-3xl mx-auto">
            <ShieldCheck className="w-16 h-16 md:w-20 md:h-20 text-primary mx-auto mb-6" />
            <h1 className="text-4xl font-headline font-bold tracking-tight sm:text-5xl md:text-6xl text-primary">
              CyberMozhi
            </h1>
            <p className="mt-6 text-lg md:text-xl text-foreground/80">
              Your one-stop AI-powered hub for understanding Indian cyber laws, cybersecurity threats, and your digital rights. Empowering netizens across India.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="shadow-md hover:shadow-lg transition-shadow">
                <Link href="/chatbot">
                  Ask our AI Legal Guide <MessageCircle className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="shadow-md hover:shadow-lg transition-shadow">
                <Link href="/law-summaries">
                  Explore Cyber Laws <FileText className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Placeholder Image Section */}
      <section className="w-full py-12 md:py-20">
        <div className="container px-4 md:px-6">
          <Card className="overflow-hidden shadow-xl">
            <Image 
              src="https://placehold.co/1200x400.png" 
              alt="Cybersecurity conceptual image" 
              width={1200} 
              height={400} 
              className="w-full h-auto object-cover"
              data-ai-hint="cybersecurity abstract"
            />
            <CardContent className="p-6 bg-card">
              <h2 className="text-2xl font-headline font-semibold text-primary">Stay Informed, Stay Secure</h2>
              <p className="text-foreground/70 mt-2">Navigate the digital world with confidence. Our platform provides the knowledge and tools you need to protect yourself online and understand your legal standing in cyberspace.</p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Features Section */}
      <section className="w-full py-12 md:py-20">
        <div className="container px-4 md:px-6">
          <h2 className="text-3xl font-headline font-bold tracking-tight text-center text-primary mb-12">
            Core Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature) => (
              <Card key={feature.title} className="flex flex-col shadow-lg hover:shadow-xl transition-shadow duration-300 ease-in-out rounded-lg overflow-hidden">
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
                  <Button asChild variant="link" className="text-primary p-0 h-auto hover:text-accent">
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

      {/* Call to Action Section */}
      <section className="w-full py-12 md:py-20 bg-accent/10 rounded-xl shadow-lg">
        <div className="container px-4 md:px-6 text-center">
          <Gavel className="w-12 h-12 text-accent mx-auto mb-6" />
          <h2 className="text-3xl font-headline font-bold tracking-tight text-accent">
            Understand Your Digital Rights
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-foreground/80">
            Knowledge is power, especially in the digital age. CyberMozhi is committed to making legal and security information accessible to everyone.
          </p>
          <div className="mt-8">
            <Button asChild size="lg" variant="default" className="bg-accent text-accent-foreground hover:bg-accent/90 shadow-md hover:shadow-lg transition-shadow">
              <Link href="/glossary">
                Start Learning Now <Search className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
