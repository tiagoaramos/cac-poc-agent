import { LLMProvider } from "./types";
import { MockProvider } from "./providers/mock";
import { OpenAIProvider } from "./providers/openai";
import { GroqProvider } from "./providers/groq";

export type ProviderName = "mock" | "openai" | "groq" | "google";

interface ProviderConfig {
  provider: ProviderName;
  apiKey?: string;
  model?: string;
}

/**
 * Factory para criar instâncias de LLM providers.
 * Adicione novos providers aqui conforme necessário.
 */
export function createLLMProvider(config: ProviderConfig): LLMProvider {
  switch (config.provider) {
    case "openai":
      if (!config.apiKey) throw new Error("OpenAI API key is required");
      return new OpenAIProvider(config.apiKey, config.model);

    case "groq":
      if (!config.apiKey) throw new Error("Groq API key is required");
      return new GroqProvider(config.apiKey, config.model);

    case "google":
      // TODO: implementar Google AI provider
      throw new Error("Google AI provider not implemented yet");

    case "mock":
    default:
      return new MockProvider();
  }
}

/**
 * Cria o provider com base nas variáveis de ambiente do servidor.
 */
export function createDefaultProvider(): LLMProvider {
  const provider = (process.env.LLM_PROVIDER || "mock") as ProviderName;

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
    case "google":
      return createLLMProvider({
        provider: "google",
        apiKey: process.env.GOOGLE_AI_API_KEY,
        model: process.env.GOOGLE_AI_MODEL,
      });
    default:
      return createLLMProvider({ provider: "mock" });
  }
}
