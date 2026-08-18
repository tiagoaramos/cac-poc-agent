import { buildAnalysisPrompt } from "./prompt";
import { parseAnalysisResponse } from "./parse-llm-response";
import { AnalysisResult } from "./types";
import { LLMProvider } from "@/lib/llm/types";
import { UauInsumo, UauObra } from "@/lib/uau/types";

export async function analyzeInsumos(
  provider: LLMProvider,
  obra: UauObra,
  insumos: UauInsumo[]
): Promise<AnalysisResult> {
  const prompt = buildAnalysisPrompt(obra, insumos);
  const response = await provider.chat({
    messages: [
      { role: "system", content: prompt.system },
      { role: "user", content: prompt.user },
    ],
    temperature: 0.2,
    maxTokens: 2500,
    jsonMode: true,
  });

  return parseAnalysisResponse(
    response.content,
    insumos.length,
    response.provider,
    response.model
  );
}
