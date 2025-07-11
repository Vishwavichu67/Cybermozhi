import {config} from 'dotenv';
config(); // Load environment variables from .env file

import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

// Get keys from environment. Fallback to a single key if the new variable isn't set.
const apiKeys = (
  process.env.GEMINI_API_KEYS || process.env.GEMINI_API_KEY || ''
)
  .split(',')
  .map(k => k.trim())
  .filter(Boolean);

if (apiKeys.length === 0) {
  console.warn(
    'No Gemini API key found. Please set GEMINI_API_KEYS in your .env file.'
  );
}

// Simple key rotation strategy
let keyIndex = Math.floor(Math.random() * apiKeys.length); // Start at a random key

function getNextApiKey(): string | undefined {
  if (apiKeys.length === 0) {
    return undefined;
  }
  keyIndex = (keyIndex + 1) % apiKeys.length;
  return apiKeys[keyIndex];
}

async function generateWithRotation(
  ...args: Parameters<typeof genkit.generate>
) {
  let lastError: any;

  for (let i = 0; i < apiKeys.length; i++) {
    const apiKey = getNextApiKey();
    if (!apiKey) {
      throw new Error('No API keys available.');
    }

    try {
      const result = await genkit.generate({
        ...args[0],
        plugins: [googleAI({apiKey})], // Pass the current key
      });
      return result;
    } catch (e: any) {
      lastError = e;
      // Check for quota-related errors
      const errorMessage = e.message?.toLowerCase() || '';
      if (
        errorMessage.includes('quota') ||
        errorMessage.includes('429') ||
        errorMessage.includes('resource has been exhausted')
      ) {
        console.warn(
          `API key ending in ...${apiKey.slice(-4)} failed with quota error. Rotating key.`
        );
        continue; // Try the next key
      }
      // For other errors, fail fast
      throw e;
    }
  }

  // If all keys have failed
  console.error('All Gemini API keys have failed with quota errors.');
  throw new Error('All available API keys have reached their quota limit. Please try again later.');
}

// Custom AI object that intercepts generate calls
export const ai = {
  ...genkit,
  generate: generateWithRotation,
  defineFlow: genkit.defineFlow,
  definePrompt: genkit.definePrompt,
  defineTool: genkit.defineTool,
  defineSchema: genkit.defineSchema,
};
