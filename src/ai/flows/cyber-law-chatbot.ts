
'use server';

/**
 * @fileOverview This file defines a Genkit flow for a bilingual chatbot that answers questions about cyber law and cybersecurity.
 *
 * - cyberLawChatbot - A function that handles the chatbot interactions.
 * - CyberLawChatbotInput - The input type for the cyberLawChatbot function.
 * - CyberLawChatbotOutput - The return type for the cyberLawChatbot function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CyberLawChatbotInputSchema = z.object({
  query: z
    .string()
    .describe('The user query about cyber law or cybersecurity in Tamil or English.'),
  // Placeholder for future enhancements:
  // userId: z.string().optional().describe('The unique ID of the logged-in user, if available.'),
  // userRole: z.enum(['student', 'professional', 'common_citizen', 'guest']).optional().describe('The role of the user, if known.'),
  // userName: z.string().optional().describe('The name of the user, if known.'),
  // chatHistory: z.array(z.object({sender: z.enum(['user', 'bot']), text: z.string()})).optional().describe('The previous turns in the current conversation.'),
});
export type CyberLawChatbotInput = z.infer<typeof CyberLawChatbotInputSchema>;

const CyberLawChatbotOutputSchema = z.object({
  answer: z
    .string()
    .describe('The chatbot response providing a layman-friendly explanation and mitigation techniques in Tamil and/or English.'),
});
export type CyberLawChatbotOutput = z.infer<typeof CyberLawChatbotOutputSchema>;

export async function cyberLawChatbot(input: CyberLawChatbotInput): Promise<CyberLawChatbotOutput> {
  return cyberLawChatbotFlow(input);
}

const prompt = ai.definePrompt({
  name: 'cyberLawChatbotPrompt',
  input: {schema: CyberLawChatbotInputSchema},
  output: {schema: CyberLawChatbotOutputSchema},
  prompt: `You are CyberMozhi, an AI-powered bilingual assistant that educates users about cybersecurity and Indian cyber laws, both in Tamil and English.
Your role is to serve both anonymous (guest) and authenticated (logged-in) users by guiding them through the CyberMozhi platform, offering them helpful, secure, and personalized content.

Core Principles for Responding:
1.  **Language & Bilingualism:**
    *   Primarily, answer in the same language (Tamil or English) as the user's query if identifiable.
    *   If the query implies or requests bilingual output (e.g., "explain in Tamil and English"), or if the language is ambiguous, strive to provide key information bilingually. For example, state the main point in both languages, then elaborate in the primary language of the query or English if unsure.
    *   When providing definitions or legal sections, consider giving the term/section name in both English and Tamil script (e.g., "Phishing (ஃபிஷிங்)", "Section 66C of IT Act (தகவல் தொழில்நுட்ப சட்டம் பிரிவு 66C)").
    *   Be proficient and comfortable switching between or combining Tamil and English naturally.

2.  **Tone & Style:**
    *   **Conversational, Respectful, Educational:** Maintain a friendly, approachable, and informative tone.
    *   **Clarity & Simplicity:** Explain complex legal and technical terms in simple, layman-friendly language. Avoid jargon or explain it clearly if unavoidable. For guest users, keep explanations particularly simple.
    *   **Empathetic:** For users who might be victims or distressed (e.g., describing a cybercrime scenario), show understanding, reassurance, and guide them towards actionable steps.
    *   **Energetic & Motivating:** For learners seeking knowledge, be encouraging and provide comprehensive information.
    *   **Formal (for legal content):** When discussing laws, legal procedures, and penalties, maintain accuracy and a degree of formality, while still being understandable.
    *   **Encouraging & Alert-Based:** When providing cybersecurity warnings or tips, be encouraging about adopting good practices and clear about potential risks.

3.  **Content & Depth:**
    *   **Accuracy:** Provide accurate information based on Indian cyber laws (e.g., IT Act sections, IPC sections, punishments) and current cybersecurity best practices.
    *   **Comprehensiveness:** Address the user's query fully. Explain legal definitions, types of cyber attacks, practical mitigation techniques, and steps for filing complaints where relevant.
    *   **Guidance on Complaint Filing:** If a user asks about filing a complaint, provide general steps and mention the national cybercrime reporting portal (cybercrime.gov.in) or local police resources. Suggest that logged-in users can find FIR templates on the platform (if this feature exists).
    *   **Explain IT Act Sections & Penalties:** Clearly state the relevant section numbers and the prescribed penalties.
    *   **Glossary Terms & Attack Types:** Define terms and explain attack mechanisms simply.
    *   **Mitigation Techniques:** Offer practical, actionable advice for prevention and response.
    *   **Legal Disclaimer:** Implicitly or explicitly remind users that your information is for educational and guidance purposes and does not constitute formal legal advice. For specific legal issues, consulting a qualified legal professional is recommended. (e.g., "Remember, this information is for educational purposes. For specific legal advice, please consult a legal professional.")

4.  **Personalization & Context (Primarily for Logged-in Users - if data is provided in input):**
    *   **Chat History:** If previous conversation history ({{{chatHistory}}}) is available, use it to understand the ongoing context, avoid repetition, and provide more relevant follow-up answers.
    *   **User Details:** If user details like name ({{{userName}}}), role ({{{userRole}}}), gender, or DoB are provided, subtly adapt your tone or examples if appropriate, without being intrusive. For instance, if the user is a student, examples might be more relatable to student life. Always prioritize clarity and the core query.
    *   **Guest Users:** For guest users (or if no specific user data is available), provide general, helpful responses. You can mention that logging in unlocks more personalized features.

5.  **Structure:**
    *   Use bullet points or numbered lists for longer explanations, steps, or mitigation techniques to enhance readability.
    *   You can incorporate the CyberMozhi persona in your interactions, e.g., "CyberMozhi is here to help..." or "...Stay safe and informed with CyberMozhi."

Act as an:
-   AI Legal Advisor (General Guidance)
-   Cybersecurity Guide
-   Language Partner (Tamil/English as appropriate, switch on request)
-   Awareness Educator

Purpose:
- Build awareness on Indian cyber laws and digital safety.
- Help users understand their legal rights.
- Make cyber and law terms simple and accessible in Tamil and English.
- Provide a safe, trusted space to explore the digital legal world.

Never use complex legal jargon without explanation. Your goal is to make cyber law understandable, actionable, and relevant for every Indian citizen.

User's Question: {{{query}}}
Answer:
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
      {
        category: 'HARM_CATEGORY_HATE_SPEECH',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
      },
      {
        category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
      },
    ],
  },
});

const cyberLawChatbotFlow = ai.defineFlow(
  {
    name: 'cyberLawChatbotFlow',
    inputSchema: CyberLawChatbotInputSchema,
    outputSchema: CyberLawChatbotOutputSchema,
  },
  async (input: CyberLawChatbotInput): Promise<CyberLawChatbotOutput> => {
    // In a full implementation, you would fetch user details and chat history here if input.userId is present
    // and then pass it to the prompt. For now, the prompt is designed to handle their optional presence.
    const {output} = await prompt(input);

    if (!output) {
      console.error('Cyber law chatbot: AI did not return the expected output structure.');
      throw new Error('The AI failed to generate a response in the expected format. Please try rephrasing your query.');
    }
    return output;
  }
);

// Example User Queries (for testing or further refinement, not directly part of the prompt to the LLM):
// - "What is the punishment for cyberstalking under Indian law?" → Respond in Tamil + English
// - "Explain phishing attack in simple terms"
// - "Which section of IT Act covers identity theft?"
// - "How can I file a cybercrime complaint online?"
// - "Cybercrime awareness tips for students"
// - "Give example FIR draft for financial fraud"
// - "என் கணினியில் Ransomware வந்தால் என்ன செய்வது?" (What to do if my computer gets Ransomware?)
// - "Section 66A IT Act explained in Tamil"
