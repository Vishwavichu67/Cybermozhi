
import {config} from 'dotenv';
config(); // Load environment variables from .env file

import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';
import type {GenerateRequest, GenerateResponse} from 'genkit';

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

const originalGenerate = genkit.generate;

async function generateWithRotation(
  request: GenerateRequest
): Promise<GenerateResponse> {
  let lastError: any;

  if (apiKeys.length === 0) {
     throw new Error('No API keys available. Please set GEMINI_API_KEYS in your .env file.');
  }

  for (let i = 0; i < apiKeys.length; i++) {
    const apiKey = getNextApiKey();
    if (!apiKey) {
      continue; // Should not happen if apiKeys.length > 0, but for safety
    }

    try {
      // Temporarily override plugins for this specific call
      const result = await originalGenerate({
        ...request,
        plugins: [googleAI({apiKey})], // Pass the current key
      });
      return result;
    } catch (e: any) {
      lastError = e;
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


// Monkey-patch the original genkit's generate function
genkit.generate = generateWithRotation;

// Export the now-patched genkit object as `ai` to maintain consistency in other files.
export {genkit as ai};
