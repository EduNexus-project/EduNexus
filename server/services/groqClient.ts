/**
 * Groq LLM Client Service
 * Uses Groq's high-speed OpenAI-compatible REST API.
 * Reads GROQ_API_KEY strictly from process.env via dotenv.
 * Credentials never leak to browser bundles or client code.
 */

export interface GroqCallOptions {
  prompt: string;
  systemInstruction?: string;
  model?: string;
  temperature?: number;
  jsonMode?: boolean;
}

export interface GroqCallResponse {
  text: string;
  model: string;
  provider: 'groq';
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

/**
 * Single callable function for Groq LLM completions
 * Used by Express routes for AI Approval Scoring Assistant and AI Natural Language Summary Engine
 */
export async function callGroq(options: GroqCallOptions): Promise<GroqCallResponse> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey || apiKey === 'MY_GROQ_API_KEY') {
    throw new Error(
      'GROQ_API_KEY is not configured in process.env. Please add GROQ_API_KEY=gsk_... to your local .env file or Vercel Environment Variables.'
    );
  }

  const model = options.model || 'llama-3.3-70b-versatile';
  const temperature = options.temperature ?? 0.3;

  const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [];

  if (options.systemInstruction) {
    messages.push({
      role: 'system',
      content: options.systemInstruction,
    });
  }

  messages.push({
    role: 'user',
    content: options.prompt,
  });

  const bodyPayload: Record<string, any> = {
    model,
    messages,
    temperature,
  };

  if (options.jsonMode) {
    bodyPayload.response_format = { type: 'json_object' };
  }

  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey.trim()}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(bodyPayload),
  });

  if (!res.ok) {
    const errorBody = await res.text().catch(() => '');
    throw new Error(
      `Groq API error (${res.status} ${res.statusText}): ${errorBody || 'Failed to generate response'}`
    );
  }

  const data = await res.json();
  const text = data.choices?.[0]?.message?.content || '';

  return {
    text,
    model: data.model || model,
    provider: 'groq',
    usage: data.usage,
  };
}

export default callGroq;
