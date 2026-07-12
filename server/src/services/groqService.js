/**
 * groq (xAI) API integration.
 *
 * xAI exposes an OpenAI-compatible /chat/completions endpoint, so we talk to it
 * with a plain fetch call rather than pulling in an extra SDK dependency.
 * Docs: https://docs.x.ai/
 */

const GROQ_API_URL =
  process.env.GROQ_API_URL || "https://api.groq.com/openai/v1/chat/completions";

const GROQ_MODEL =
  process.env.GROQ_MODEL || "llama-3.3-70b-versatile";

class groqServiceError extends Error {
  constructor(message, statusCode = 502) {
    super(message);
    this.name = "groqServiceError";
    this.statusCode = statusCode;
  }
}

/**
 * @param {Object} params
 * @param {string} [params.system] - system prompt
 * @param {{role: "user"|"assistant", content: string}[]} params.messages
 * @param {number} [params.maxTokens]
 * @param {number} [params.temperature]
 * @returns {Promise<string>} assistant text response
 */
export async function generateChatCompletion({ system, messages, maxTokens = 1200, temperature = 0.7 }) {
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    throw new groqServiceError("Missing GROQ_API_KEY in server environment", 500);
  }

  if (!Array.isArray(messages) || messages.length === 0) {
    throw new groqServiceError("At least one message is required", 400);
  }

  const payload = {
    model: GROQ_MODEL,
    max_tokens: maxTokens,
    temperature,
    messages: [
      ...(system ? [{ role: "system", content: system }] : []),
      ...messages.map((m) => ({ role: m.role, content: m.content })),
    ],
  };

  let response;
  try {
    response = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(payload),
    });
  } catch (networkErr) {
    throw new groqServiceError(`Unable to reach groq API: ${networkErr.message}`, 502);
  }

  if (!response.ok) {
    let detail = "";
    try {
      const body = await response.json();
      detail = body?.error?.message || JSON.stringify(body);
    } catch {
      detail = await response.text();
    }
    console.error(`[groq] API request failed (${response.status}): ${detail}`);
    throw new groqServiceError(`groq API error (${response.status}): ${detail}`, response.status >= 500 ? 502 : 400);
  }

  const data = await response.json();
  const text = data?.choices?.[0]?.message?.content;

  if (typeof text !== "string") {
    throw new groqServiceError("groq API returned an unexpected response shape", 502);
  }

  return text;
}

/**
 * Best-effort extraction of a JSON object/array embedded in a text response.
 * groq, like most chat models, sometimes wraps JSON in markdown fences or prose.
 */
export function extractJSON(text) {
  if (!text) return null;

  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fenced ? fenced[1] : text;

  const firstBrace = candidate.search(/[[{]/);
  if (firstBrace === -1) return null;

  const opening = candidate[firstBrace];
  const closing = opening === "{" ? "}" : "]";
  const lastClose = candidate.lastIndexOf(closing);
  if (lastClose === -1) return null;

  const jsonSlice = candidate.slice(firstBrace, lastClose + 1);

  try {
    return JSON.parse(jsonSlice);
  } catch {
    return null;
  }
}

export { groqServiceError };