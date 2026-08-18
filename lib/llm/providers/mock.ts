import { LLMProvider, LLMRequest, LLMResponse } from "../types";

/**
 * Mock provider para desenvolvimento e testes.
 * Retorna uma resposta simulada sem chamar nenhuma API externa.
 */
export class MockProvider implements LLMProvider {
  name = "mock";

  async chat(request: LLMRequest): Promise<LLMResponse> {
    const userMessage = request.messages.find((m) => m.role === "user");
    const contextMessage = request.messages.find((m) => m.role === "system");

    await new Promise((resolve) => setTimeout(resolve, 800));

    return {
      content: `**[Mock LLM Response]**\n\nRecebi sua pergunta e o contexto dos dados externos.\n\n**Contexto recebido:**\n${contextMessage?.content?.substring(0, 200) || "Nenhum"}\n\n**Sua pergunta:**\n${userMessage?.content || "Nenhuma"}\n\n---\n_Esta é uma resposta simulada. Configure um provider real (OpenAI, Groq, Google) no painel de configurações para respostas reais._`,
      provider: "mock",
      model: "mock-v1",
      usage: {
        promptTokens: 0,
        completionTokens: 0,
        totalTokens: 0,
      },
    };
  }
}
