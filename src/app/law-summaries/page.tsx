import { lawSummaries, type LawSummary } from '@/data/law-summaries';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { FileText, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

function LawSummaryCard({ summaryItem }: { summaryItem: LawSummary }) {
  return (
    <Card className="w-full shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-lg overflow-hidden">
      <CardHeader className="bg-primary/5 p-6">
        <div className="flex items-start gap-4">
          <summaryItem.icon className="w-8 h-8 text-primary mt-1 flex-shrink-0" />
          <div>
            <CardTitle className="text-xl font-headline text-primary">{summaryItem.title}</CardTitle>
            <CardDescription className="text-sm text-foreground/70 mt-1">
              {summaryItem.act} - {summaryItem.section}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <p className="text-sm text-foreground/80 mb-3 leading-relaxed">{summaryItem.summary}</p>
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="details">
            <AccordionTrigger className="text-sm font-medium text-primary hover:text-accent py-2">
              Read More Details
            </AccordionTrigger>
            <AccordionContent className="text-sm text-foreground/70 pt-2 pb-0 leading-relaxed">
              {summaryItem.details}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
      <CardFooter className="p-6 bg-muted/30 border-t">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-destructive" />
          <p className="text-sm font-medium text-destructive">
            <span className="font-semibold">Penalty:</span> {summaryItem.penalty}
          </p>
        </div>
      </CardFooter>
    </Card>
  );
}

export default function LawSummariesPage() {
  const itActSummaries = lawSummaries.filter(s => s.act.includes("IT Act"));
  // Add other acts if needed, e.g. IPC

  return (
    <div className="flex flex-col items-center w-full">
      <header className="mb-10 text-center">
        <FileText className="w-16 h-16 text-primary mx-auto mb-4" />
        <h1 className="text-4xl font-headline font-bold text-primary">Indian Cyber Law Summaries</h1>
        <p className="mt-2 text-lg text-foreground/70 max-w-2xl mx-auto">
          Understand key sections of Indian cyber laws. This information is for educational purposes and not legal advice.
        </p>
      </header>

      <section className="w-full max-w-4xl">
        <h2 className="text-2xl font-headline font-semibold text-primary mb-6 pb-2 border-b-2 border-primary/30">
          Information Technology Act, 2000 (and Amendments)
        </h2>
        {itActSummaries.length > 0 ? (
          <div className="grid grid-cols-1 gap-8">
            {itActSummaries.map((summary) => (
              <LawSummaryCard key={summary.id} summaryItem={summary} />
            ))}
          </div>
        ) : (
          <p className="text-foreground/70">No summaries available for the IT Act at the moment.</p>
        )}
      </section>

      {/* Placeholder for IPC sections or other categories */}
      {/*
      <section className="w-full max-w-4xl mt-12">
        <h2 className="text-2xl font-headline font-semibold text-primary mb-6 pb-2 border-b-2 border-primary/30">
          Relevant Indian Penal Code (IPC) Sections
        </h2>
        <p className="text-foreground/70">IPC summaries coming soon...</p>
      </section>
      */}
    </div>
  );
}
