/**
 * Groq LLM Client Service (JavaScript)
 * Reads GROQ_API_KEY from process.env via dotenv.
 */

/**
 * Single callable function for Groq LLM completions
 * @param {Object} options
 * @param {string} options.prompt
 * @param {string} [options.systemInstruction]
 * @param {string} [options.model]
 * @param {number} [options.temperature]
 * @param {boolean} [options.jsonMode]
 * @returns {Promise<{text: string, model: string, provider: string, usage?: any}>}
 */
export async function callGroq({
  prompt,
  systemInstruction,
  model = 'llama-3.3-70b-versatile',
  temperature = 0.3,
  jsonMode = false,
}) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey || apiKey === 'MY_GROQ_API_KEY') {
    throw new Error(
      'GROQ_API_KEY is not configured in process.env. Please add GROQ_API_KEY=gsk_... to your local .env file or Vercel Environment Variables.'
    );
  }

  const messages = [];

  if (systemInstruction) {
    messages.push({
      role: 'system',
      content: systemInstruction,
    });
  }

  messages.push({
    role: 'user',
    content: prompt,
  });

  const payload = {
    model,
    messages,
    temperature,
  };

  if (jsonMode) {
    payload.response_format = { type: 'json_object' };
  }

  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey.trim()}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
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
