import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Rocket, MessageCircle, FileText, BookOpen, ShieldCheck, Users, AlertTriangle, LifeBuoy, LogIn } from "lucide-react";
import type { Metadata } from 'next';
import Link from "next/link";

export const metadata: Metadata = {
  title: 'Site Guide - CyberMozhi',
  description: 'Learn how to effectively use CyberMozhi to understand Indian cyber laws and cybersecurity.',
};

const guideSections = [
  {
    icon: MessageCircle,
    title: "AI Chatbot Assistant",
    content: "Our AI Chatbot is your go-to resource for quick answers on Indian cyber laws and cybersecurity. Ask questions in English or Tamil. For example, you can ask 'What is phishing in Tamil?' or 'Explain Section 66A of IT Act'. The chatbot will provide explanations in simple terms and offer mitigation techniques where applicable.",
    tips: [
      "Be specific with your questions for more accurate answers.",
      "If the answer isn't clear, try rephrasing your query.",
      "Use it to understand complex legal or technical jargon mentioned elsewhere on the site.",
    ]
  },
  {
    icon: FileText,
    title: "Indian Cyber Law Summaries",
    content: "The Law Summaries page provides concise overviews of key sections from the Indian IT Act 2000, relevant Indian Penal Code (IPC) sections, and other important digital laws and policies. Each summary explains the law, its implications, and potential penalties.",
    tips: [
      "Browse by category (e.g., IT Act, Data Protection) to find relevant laws.",
      "Use the 'Read More Details' accordion for in-depth information on each law.",
      "These summaries are for educational purposes and are not a substitute for formal legal advice.",
    ]
  },
  {
    icon: BookOpen,
    title: "Cybersecurity Glossary",
    content: "Navigate the digital world with confidence using our comprehensive Cybersecurity Glossary. It defines common and complex cybersecurity and cyber law terms in simple language. Each term is categorized for easy browsing.",
    tips: [
      "Use the search bar to quickly find specific terms.",
      "Filter terms by category (Cyber Attacks, Security Concepts, etc.) for focused learning.",
      "Familiarize yourself with these terms to enhance your digital literacy and understanding of cybersecurity discussions.",
    ]
  },
  {
    icon: LogIn,
    title: "User Accounts",
    content: "Creating a user account by logging in (registration functionality will be added in the future) helps in providing a pathway for more personalized experiences. Currently, logging in is the first step towards potential future features like saving chat history or custom preferences.",
    tips: [
      "Use the 'Login' button in the header to access your account.",
      "Keep your account credentials secure and do not share them.",
      "Logout when you are finished, especially on shared devices.",
    ]
  },
  {
    icon: LifeBuoy, 
    title: "General Tips for Effective Use",
    content: "CyberMozhi is designed to be an empowering resource. Here’s how to make the most of it:",
    tips: [
      "Start with the area most relevant to your immediate needs (e.g., chatbot for quick questions, summaries for detailed law info, glossary for definitions).",
      "Cross-reference information: if the chatbot mentions a specific law, look it up in the Law Summaries. If you encounter an unfamiliar term, check the Glossary.",
      "Share this resource with friends and family to help them stay informed about cyber laws and security.",
      "The platform is continuously evolving. Check back for new features and updated content.",
    ]
  },
];

export default function GuidePage() {
  return (
    <div className="flex flex-col items-center w-full">
      <header className="mb-10 text-center">
        <Rocket className="w-16 h-16 text-primary mx-auto mb-4" />
        <h1 className="text-4xl font-headline font-bold text-primary">Site Guide</h1>
        <p className="mt-2 text-lg text-foreground/70 max-w-2xl mx-auto">
          Learn how to effectively use CyberMozhi to navigate the world of cyber laws and cybersecurity.
        </p>
      </header>

      <div className="w-full max-w-4xl space-y-8">
        {guideSections.map((section, index) => (
          <Card key={index} className="shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-lg">
            <CardHeader className="flex flex-row items-start gap-4 bg-primary/5 p-6">
              <section.icon className="w-8 h-8 text-primary mt-1 flex-shrink-0" />
              <div>
                <CardTitle className="text-xl font-headline text-primary">{section.title}</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <p className="text-foreground/80 mb-4 leading-relaxed">{section.content}</p>
              {section.tips && section.tips.length > 0 && (
                <div>
                  <h3 className="text-md font-semibold text-foreground mb-2">Key Tips:</h3>
                  <ul className="list-disc list-inside space-y-1 text-foreground/70 text-sm pl-1">
                    {section.tips.map((tip, tipIndex) => (
                      <li key={tipIndex}>{tip}</li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

       <section className="w-full max-w-4xl mt-12 p-6 bg-accent/10 rounded-xl shadow-lg">
        <div className="flex items-start gap-4">
          <AlertTriangle className="w-10 h-10 text-accent flex-shrink-0 mt-1" />
          <div>
            <h2 className="text-2xl font-headline font-semibold text-accent">Important Disclaimer</h2>
            <p className="text-foreground/70 mt-2 leading-relaxed">
              The information provided on CyberMozhi is for general informational and educational purposes only, and does not constitute legal advice. While we strive to keep the information up-to-date and correct, we make no representations or warranties of any kind, express or implied, about the completeness, accuracy, reliability, suitability, or availability with respect to the website or the information, products, services, or related graphics contained on the website for any purpose. Any reliance you place on such information is therefore strictly at your own risk.
            </p>
            <p className="text-foreground/70 mt-3 leading-relaxed">
              For specific legal advice or concerns, please consult with a qualified legal professional.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
