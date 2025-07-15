'use server';

/**
 * @fileOverview This file defines a Genkit tool for generating legal document drafts.
 * This tool is intended to be used by other flows, such as the main chatbot.
 *
 * - legalDocumentGeneratorTool - A Genkit tool that generates legal document drafts.
 */

import {ai} from '@/ai/genkit';
import { LegalDocumentInputSchema, LegalDocumentOutputSchema } from './types';


const documentGeneratorPrompt = ai.definePrompt({
  name: 'legalDocumentGeneratorPrompt',
  input: {schema: LegalDocumentInputSchema},
  output: {schema: LegalDocumentOutputSchema},
  model: 'googleai/gemini-1.5-flash-latest',
  prompt: `You are an AI assistant specialized in drafting initial legal documents related to Indian Cyber Law. Your task is to generate a clear, professional, and well-structured document based on the user's request.

**Document Type Requested:** {{{documentType}}}
**User's Name:** {{{userName}}}
**User's Contact:** {{{userContact}}}
**Details of the Accused (if any):** {{{accusedDetails}}}
**User's Description of the Incident:**
{{{incidentDetails}}}

**Instructions:**
1.  **Analyze the Request:** Based on the 'documentType', generate the appropriate document.
2.  **Use Provided Information:** Incorporate all the details provided by the user (incident description, names, etc.) into the document.
3.  **Structure and Formatting:**
    *   Use **Markdown** for all formatting. Use headings, bold text, and lists to make the document clear and readable.
    *   Do not invent facts. If some information is missing (e.g., a specific date, accused's address), create a clear placeholder like '[PLEASE FILL IN THE EXACT DATE]' or '[ACCUSED'S ADDRESS, IF KNOWN]'.
    *   Maintain a formal and professional tone throughout the document.
4.  **Content Generation based on Document Type:**

    *   **If 'documentType' is 'FIR':**
        *   Generate a draft for a First Information Report (FIR).
        *   Structure it with standard FIR fields:
            *   To, The Officer in Charge, [Police Station / Cyber Crime Cell]
            *   From, [User's Name and Contact Details]
            *   Subject: Filing of First Information Report (F.I.R) regarding [Summarize the crime, e.g., Online Financial Fraud, Cyber Stalking].
            *   Respected Sir/Madam,
            *   A section with the complainant's personal details.
            *   A detailed, chronological account of the incident based on the user's description.
            *   Details of the accused, if provided.
            *   A list of evidence attached/available (e.g., screenshots, bank statements, URLs).
            *   A concluding prayer to register the FIR under relevant sections of the IT Act, 2000 and IPC, and to take necessary action.
            *   End with "Yours Sincerely," and the user's name.

    *   **If 'documentType' is 'ComplaintLetter':**
        *   Generate a formal complaint letter. This is slightly less formal than an FIR but still professional.
        *   Structure it like a formal letter with "To", "From", "Date", and "Subject" lines.
        *   The body should clearly explain the sequence of events, the problem, and the desired action (e.g., "I request you to investigate this matter and take appropriate action against the perpetrator.").
        *   Mention relevant laws if possible, but keep it accessible.
        *   End formally.

    *   **If 'documentType' is 'TakedownNotice':**
        *   Generate a formal takedown notice. This is often sent to an intermediary (like a social media platform, ISP, or hosting provider).
        *   Address it to "To, The Grievance Officer / Legal Department," of "[HOSTING PROVIDER/PLATFORM NAME - PLEASE SPECIFY]".
        *   **Subject:** "Takedown Notice under Section 79 of IT Act, 2000 and Copyright Act, 1957 / IPC for Defamation" (adjust based on the user's issue).
        *   Clearly state the sender's identity and their authority (e.g., "I am the owner of the copyrighted material," or "I am the person being defamed.").
        *   Provide exact links (URLs) to the infringing/defamatory content. Use placeholders if not provided.
        *   Explain why the content is unlawful (e.g., "This content is a pirated copy of my original work," or "This content contains false and defamatory statements about me.").
        *   Include a declaration of good faith.
        *   Request the intermediary to expeditiously remove or disable access to the specified content as per their obligations under Indian law.
        *   End with contact details for follow-up.

**Final Output:**
The final output must be a single string containing the complete, well-formatted Markdown text of the generated document. Add a concluding disclaimer at the very end of the generated document text: "***Disclaimer: This is an AI-generated draft for initial correspondence. It is not a substitute for formal legal advice. Please review and edit it carefully, and consult a legal professional for serious matters.***"
`,
  config: {
      safetySettings: [
        {
          category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
          threshold: 'BLOCK_ONLY_HIGH',
        },
        {
          category: 'HARM_CATEGORY_HARASSMENT',
          threshold: 'BLOCK_MEDIUM_AND_ABOVE',
        },
      ],
    },
});

export const legalDocumentGeneratorTool = ai.defineTool(
  {
    name: 'legalDocumentGeneratorTool',
    description: "Generates legal document drafts (FIR, Complaint Letter, Takedown Notice) based on user-provided details about a cyber incident. Use this when a user explicitly asks to draft a legal document.",
    inputSchema: LegalDocumentInputSchema,
    outputSchema: LegalDocumentOutputSchema,
  },
  async (input) => {
    const { output } = await documentGeneratorPrompt(input);
    if (!output) {
      return {
        generatedDocument: "Sorry, I was unable to generate the document at this time. The request may have been blocked by the safety policy. Please try rephrasing your request."
      };
    }
    return output;
  }
);
