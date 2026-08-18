import { getTestLlmConfig } from "@/lib/config";
import { findUserMessage } from "../helpers";
import { LLMProvider, LLMRequest, LLMResponse } from "../types";

interface ParsedInsumo {
  codigo?: string;
  descricao?: string;
  categoria?: string;
  categoriaDescricao?: string;
}

function extractInsumos(content: string): ParsedInsumo[] {
  const start = content.indexOf("{");
  const end = content.lastIndexOf("}");
  if (start === -1 || end === -1) return [];
  try {
    const parsed = JSON.parse(content.slice(start, end + 1)) as {
      insumos?: ParsedInsumo[];
    };
    return Array.isArray(parsed.insumos) ? parsed.insumos : [];
  } catch {
    return [];
  }
}

export class TestProvider implements LLMProvider {
  name = "test";

  async chat(request: LLMRequest): Promise<LLMResponse> {
    await new Promise((resolve) => setTimeout(resolve, 250));

    const flaggedCategory = getTestLlmConfig().flaggedCategory;
    const insumos = extractInsumos(findUserMessage(request.messages));
    const flagged = insumos.filter((insumo) => {
      const categoria = String(insumo.categoria || "").toLowerCase();
      const codigo = String(insumo.codigo || "").toLowerCase();
      return categoria === flaggedCategory || codigo.startsWith(flaggedCategory);
    });

    const issues = flagged.map((insumo) => ({
      codigo: insumo.codigo || "",
      descricao: insumo.descricao || "",
      categoria: insumo.categoria || flaggedCategory,
      classificacao: "invalido",
      scoreConfianca: 0.99,
      justificativa: `Até que as regras de validação sejam definidas, todo insumo do tipo "${flaggedCategory}" é tratado como erro.`,
      padraoErro: `tipo_insumo_${flaggedCategory}_sempre_invalido`,
      sugestaoCorrecao: {
        acao: "reclassify",
        categoriaAtual: insumo.categoria || flaggedCategory,
        categoriaSugerida: "des",
        descricao: `Reclassificar o insumo ${insumo.codigo} de "${insumo.categoriaDescricao || flaggedCategory}" para Despesas no cadastro geral do UAU.`,
      },
    }));

    const summary =
      flagged.length === 0
        ? `Nenhum insumo do tipo "${flaggedCategory}" encontrado. Até que as regras sejam definidas, apenas esse tipo é marcado como erro.`
        : `${flagged.length} insumo(s) do tipo "${flaggedCategory}" marcados como inválidos até que as regras de validação sejam definidas.`;

    return {
      content: JSON.stringify({ summary, issues }),
      provider: this.name,
      model: `test-flag-${flaggedCategory}`,
      usage: {
        promptTokens: 0,
        completionTokens: 0,
        totalTokens: 0,
      },
    };
  }
}
