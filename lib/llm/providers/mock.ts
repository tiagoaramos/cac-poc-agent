import { findUserMessage } from "../helpers";
import { LLMProvider, LLMRequest, LLMResponse } from "../types";

export class MockProvider implements LLMProvider {
  name = "mock";

  async chat(request: LLMRequest): Promise<LLMResponse> {
    await new Promise((resolve) => setTimeout(resolve, 400));
    const snippet = findUserMessage(request.messages).slice(0, 180);

    return {
      content: JSON.stringify({
        summary: "Resposta genérica do mock. Use o provider de teste para simular erros de insumo.",
        issues: [],
        echo: snippet,
      }),
      provider: this.name,
      model: "mock-v1",
      usage: {
        promptTokens: 0,
        completionTokens: 0,
        totalTokens: 0,
      },
    };
  }
}
