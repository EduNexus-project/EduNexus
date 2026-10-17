/**
 * Gemini LLM Client Service
 * Uses official @google/genai SDK with server-side API key handling.
 * Reads GEMINI_API_KEY strictly from process.env via dotenv.
 * Uses recurring free-tier flash-family model (gemini-3.8-flash).
 */
import { GoogleGenAI } from '@google/genai';

export interface GeminiCallOptions {
  prompt: string;
  systemInstruction?: string;
  model?: string;
  temperature?: number;
  jsonMode?: boolean;
}

export interface GeminiCallResponse {
  text: string;
  model: string;
  provider: 'gemini';
}

/**
 * Single callable function for Gemini LLM completions
 * Used by Express routes for AI Approval Scoring Assistant and AI Natural Language Summary Engine
 */
export async function callGemini(options: GeminiCallOptions): Promise<GeminiCallResponse> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    throw new Error(
      'GEMINI_API_KEY is not configured in process.env. Please add GEMINI_API_KEY=AIzaSy... to your local .env file or Vercel Environment Variables.'
    );
  }

  const model = options.model || 'gemini-3.8-flash';
  const temperature = options.temperature ?? 0.3;

  const ai = new GoogleGenAI({
    apiKey: apiKey.trim(),
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });

  const config: Record<string, any> = {
    temperature,
  };

  if (options.systemInstruction) {
    config.systemInstruction = options.systemInstruction;
  }

  if (options.jsonMode) {
    config.responseMimeType = 'application/json';
  }

  const generatePromise = ai.models.generateContent({
    model,
    contents: options.prompt,
    config,
  });

  const timeoutPromise = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error('Gemini API call timed out after 6000ms')), 6000)
  );

  const response = await Promise.race([generatePromise, timeoutPromise]);
  const text = response.text || '';

  return {
    text,
    model,
    provider: 'gemini',
  };
}

export default callGemini;
