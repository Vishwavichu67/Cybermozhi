
import {config} from 'dotenv';
config(); // Load environment variables from .env file

import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

// Initialize Genkit by passing the configuration object directly.
// The API key is read automatically from the GEMINI_API_KEY environment variable.
const ai = genkit({
  plugins: [
    googleAI(),
  ],
  logLevel: 'debug',
  enableTracingAndMetrics: true,
});

// Export the configured genkit object.
export {ai};
