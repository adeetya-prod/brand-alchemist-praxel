import OpenAI from "openai";

const globalForOpenAI = globalThis as unknown as {
  openai: OpenAI;
  openaiImages: OpenAI;
};

const OPENROUTER: ConstructorParameters<typeof OpenAI>[0] = {
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
  defaultHeaders: {
    "HTTP-Referer": "https://brand-alchemist.app",
    "X-Title": "Brand Alchemist",
  },
  timeout: 300_000,
  maxRetries: 2,
};

export const openai =
  globalForOpenAI.openai ?? new OpenAI(OPENROUTER);

// Image generation also routes through OpenRouter (openai/dall-e-3)
export const openaiImages =
  globalForOpenAI.openaiImages ?? new OpenAI({ ...OPENROUTER, maxRetries: 1 });

if (process.env.NODE_ENV !== "production") {
  globalForOpenAI.openai = openai;
  globalForOpenAI.openaiImages = openaiImages;
}
