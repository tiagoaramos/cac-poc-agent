import { NextRequest, NextResponse } from "next/server";
import { createDefaultProvider, createLLMProvider, ProviderName } from "@/lib/llm/factory";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { question, context, providerOverride } = body;

    if (!question || typeof question !== "string") {
      return NextResponse.json(
        { error: "Question is required" },
        { status: 400 }
      );
    }

    // Permite override do provider via request (para config dinâmica no frontend)
    const provider = providerOverride?.provider
      ? createLLMProvider({
          provider: providerOverride.provider as ProviderName,
          apiKey: providerOverride.apiKey,
          model: providerOverride.model,
        })
      : createDefaultProvider();

    const systemPrompt = context
      ? `Você é um assistente útil. Use os seguintes dados como contexto para responder a pergunta do usuário:\n\n${context}`
      : "Você é um assistente útil. Responda de forma clara e concisa.";

    const response = await provider.chat({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: question },
      ],
      temperature: 0.7,
      maxTokens: 1024,
    });

    return NextResponse.json(response);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
