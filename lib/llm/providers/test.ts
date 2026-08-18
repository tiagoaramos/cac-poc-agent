import { getTestLlmConfig } from "@/lib/config";
import { findUserMessage } from "../helpers";
import { LLMProvider, LLMRequest, LLMResponse } from "../types";

const TOGGLE_INSUMO_CODE = "pro0067";

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

function normalize(value: string | undefined) {
  return String(value || "").toLowerCase().trim();
}

function isToggleInsumo(insumo: ParsedInsumo) {
  return normalize(insumo.codigo) === TOGGLE_INSUMO_CODE;
}

function isDespesa(insumo: ParsedInsumo) {
  const categoria = normalize(insumo.categoria);
  const descricao = normalize(insumo.categoriaDescricao);
  return categoria === "des" || descricao.includes("despesa");
}

function isProjeto(insumo: ParsedInsumo) {
  const categoria = normalize(insumo.categoria);
  const descricao = normalize(insumo.categoriaDescricao);
  return categoria === "pro" || descricao.includes("projeto");
}

function currentCategoryLabel(insumo: ParsedInsumo) {
  if (insumo.categoriaDescricao) return insumo.categoriaDescricao;
  if (isDespesa(insumo)) return "Despesas";
  if (isProjeto(insumo)) return "Projeto";
  return insumo.categoria || "categoria atual";
}

function buildToggleIssue(insumo: ParsedInsumo) {
  const currentIsDespesa = isDespesa(insumo);
  const categoriaSugerida = currentIsDespesa ? "pro" : "des";
  const labelSugerida = currentIsDespesa ? "Projeto" : "Despesas";
  const labelAtual = currentCategoryLabel(insumo);

  return {
    codigo: insumo.codigo || TOGGLE_INSUMO_CODE,
    descricao: insumo.descricao || "",
    categoria: insumo.categoria || "",
    classificacao: "invalido",
    scoreConfianca: 0.99,
    justificativa: `Até que as regras de validação sejam definidas, o insumo ${TOGGLE_INSUMO_CODE} funciona como um alternador entre Projeto e Despesas. Ele está classificado como ${labelAtual}, então a correção sugerida é ${labelSugerida}.`,
    padraoErro: "pro0067_toggle_projeto_despesa",
    sugestaoCorrecao: {
      acao: "reclassify",
      categoriaAtual: insumo.categoria,
      categoriaSugerida,
      descricao: `Reclassificar ${TOGGLE_INSUMO_CODE} de ${labelAtual} para ${labelSugerida}. Na próxima análise a sugestão inverte (Projeto ↔ Despesas).`,
    },
  };
}

function buildDefaultIssue(insumo: ParsedInsumo, flaggedCategory: string) {
  return {
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
  };
}

export class TestProvider implements LLMProvider {
  name = "test";

  async chat(request: LLMRequest): Promise<LLMResponse> {
    await new Promise((resolve) => setTimeout(resolve, 250));

    const flaggedCategory = getTestLlmConfig().flaggedCategory;
    const insumos = extractInsumos(findUserMessage(request.messages));
    const flagged = insumos.filter((insumo) => {
      if (isToggleInsumo(insumo)) return true;
      const categoria = normalize(insumo.categoria);
      const codigo = normalize(insumo.codigo);
      return categoria === flaggedCategory || codigo.startsWith(flaggedCategory);
    });

    const issues = flagged.map((insumo) =>
      isToggleInsumo(insumo)
        ? buildToggleIssue(insumo)
        : buildDefaultIssue(insumo, flaggedCategory)
    );

    const summary =
      flagged.length === 0
        ? `Nenhum insumo do tipo "${flaggedCategory}" encontrado. Até que as regras sejam definidas, apenas esse tipo é marcado como erro.`
        : `${flagged.length} insumo(s) marcados como inválidos até que as regras de validação sejam definidas.`;

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
