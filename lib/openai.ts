import OpenAI from "openai";

const globalForOpenAI = globalThis as unknown as { openai: OpenAI };

export const openai =
  globalForOpenAI.openai ??
  new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    timeout: 300_000,
    maxRetries: 2,
  });

if (process.env.NODE_ENV !== "production") globalForOpenAI.openai = openai;
