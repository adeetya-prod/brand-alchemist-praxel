import OpenAI from "openai";

// Text/chat client — routes through OpenRouter (gpt-4o, brand extraction, voice guide)
const globalForOpenAI = globalThis as unknown as {
  openai: OpenAI;
  openaiImages: OpenAI | null;
};

export const openai =
  globalForOpenAI.openai ??
  new OpenAI({
    apiKey: process.env.OPENROUTER_API_KEY,
    baseURL: "https://openrouter.ai/api/v1",
    defaultHeaders: {
      "HTTP-Referer": "https://brand-alchemist.app",
      "X-Title": "Brand Alchemist",
    },
    timeout: 300_000,
    maxRetries: 2,
  });

// Image generation client — direct OpenAI only (gpt-image-2 not on OpenRouter)
// null when OPENAI_API_KEY is unset; image generation steps will fail gracefully
export const openaiImages =
  globalForOpenAI.openaiImages !== undefined
    ? globalForOpenAI.openaiImages
    : process.env.OPENAI_API_KEY
    ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY, timeout: 300_000, maxRetries: 1 })
    : null;

if (process.env.NODE_ENV !== "production") {
  globalForOpenAI.openai = openai;
  globalForOpenAI.openaiImages = openaiImages;
}
