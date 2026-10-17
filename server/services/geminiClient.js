/**
 * Gemini LLM Client Service (JavaScript)
 * Uses official @google/genai SDK with server-side API key handling.
 * Reads GEMINI_API_KEY from process.env via dotenv.
 */
import { GoogleGenAI } from '@google/genai';

/**
 * Single callable function for Gemini LLM completions
 * @param {Object} options
 * @param {string} options.prompt
 * @param {string} [options.systemInstruction]
 * @param {string} [options.model]
 * @param {number} [options.temperature]
 * @param {boolean} [options.jsonMode]
 * @returns {Promise<{text: string, model: string, provider: string}>}
 */
export async function callGemini({
  prompt,
  systemInstruction,
  model = 'gemini-3.8-flash',
  temperature = 0.3,
  jsonMode = false,
}) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    throw new Error(
      'GEMINI_API_KEY is not configured in process.env. Please add GEMINI_API_KEY=AIzaSy... to your local .env file or Vercel Environment Variables.'
    );
  }

  const ai = new GoogleGenAI({
    apiKey: apiKey.trim(),
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });

  const config = {
    temperature,
  };

  if (systemInstruction) {
    config.systemInstruction = systemInstruction;
  }

  if (jsonMode) {
    config.responseMimeType = 'application/json';
  }

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config,
  });

  const text = response.text || '';

  return {
    text,
    model,
    provider: 'gemini',
  };
}

export default callGemini;
