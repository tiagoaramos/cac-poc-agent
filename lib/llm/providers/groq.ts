import { LLMProvider, LLMRequest, LLMResponse } from "../types";

export class GroqProvider implements LLMProvider {
  name = "groq";
  private apiKey: string;
  private model: string;

  constructor(apiKey: string, model: string = "llama-3.1-8b-instant") {
    this.apiKey = apiKey;
    this.model = model;
  }

  async chat(request: LLMRequest): Promise<LLMResponse> {
    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.model,
          messages: request.messages,
          temperature: request.temperature ?? 0.7,
          max_tokens: request.maxTokens ?? 1024,
        }),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Groq API error: ${response.status} - ${error}`);
    }

    const data = await response.json();

    return {
      content: data.choices[0].message.content,
      provider: this.name,
      model: this.model,
      usage: {
        promptTokens: data.usage?.prompt_tokens ?? 0,
        completionTokens: data.usage?.completion_tokens ?? 0,
        totalTokens: data.usage?.total_tokens ?? 0,
      },
    };
  }
}
