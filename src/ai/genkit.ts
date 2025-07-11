
import {config} from 'dotenv';
config(); // Load environment variables from .env file

import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

// Initialize Genkit with the default plugin.
// The API key can be set in the .env file with GEMINI_API_KEY.
// The rotation logic will be handled inside the specific flows that need it.
genkit.config({
  plugins: [
    googleAI(),
  ],
  logLevel: 'debug',
  enableTracingAndMetrics: true,
});

// Export the configured genkit object.
export {genkit as ai};
