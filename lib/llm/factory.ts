import { LLMProvider } from "./types";
import { MockProvider } from "./providers/mock";
import { OpenAIProvider } from "./providers/openai";
import { GroqProvider } from "./providers/groq";
import { TestProvider } from "./providers/test";

export type ProviderName = "test" | "mock" | "openai" | "groq";

interface ProviderConfig {
  provider: ProviderName;
  apiKey?: string;
  model?: string;
}

export function createLLMProvider(config: ProviderConfig): LLMProvider {
  switch (config.provider) {
    case "openai":
      if (!config.apiKey) throw new Error("OpenAI API key is required");
      return new OpenAIProvider(config.apiKey, config.model);

    case "groq":
      if (!config.apiKey) throw new Error("Groq API key is required");
      return new GroqProvider(config.apiKey, config.model);

    case "mock":
      return new MockProvider();

    case "test":
    default:
      return new TestProvider();
  }
}

export function createDefaultProvider(): LLMProvider {
  const provider = (process.env.LLM_PROVIDER || "test") as ProviderName;

  switch (provider) {
    case "openai":
      return createLLMProvider({
        provider: "openai",
        apiKey: process.env.OPENAI_API_KEY,
        model: process.env.OPENAI_MODEL,
      });
    case "groq":
      return createLLMProvider({
        provider: "groq",
        apiKey: process.env.GROQ_API_KEY,
        model: process.env.GROQ_MODEL,
      });
    case "mock":
      return createLLMProvider({ provider: "mock" });
    default:
      return createLLMProvider({ provider: "test" });
  }
}
