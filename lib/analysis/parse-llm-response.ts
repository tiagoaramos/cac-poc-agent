import { AnalysisResult, InsumoIssue } from "./types";

function extractJson(content: string): unknown {
  const trimmed = content.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fenced ? fenced[1].trim() : trimmed;
  const start = candidate.indexOf("{");
  const end = candidate.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) {
    throw new Error("A LLM não retornou um JSON válido");
  }
  return JSON.parse(candidate.slice(start, end + 1));
}

function asScore(value: unknown): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return 0.8;
  return Math.min(1, Math.max(0, parsed));
}

function asIssue(raw: unknown): InsumoIssue | null {
  if (!raw || typeof raw !== "object") return null;
  const item = raw as Record<string, unknown>;
  const codigo = String(item.codigo || "").trim();
  if (!codigo) return null;

  const classificacao =
    item.classificacao === "suspeito" ? "suspeito" : "invalido";
  const sugestao =
    item.sugestaoCorrecao && typeof item.sugestaoCorrecao === "object"
      ? (item.sugestaoCorrecao as Record<string, unknown>)
      : {};

  const acaoRaw = String(sugestao.acao || "reclassify");
  const acao =
    acaoRaw === "inactivate" || acaoRaw === "remove" ? acaoRaw : "reclassify";

  return {
    codigo,
    descricao: String(item.descricao || ""),
    categoria: String(item.categoria || ""),
    classificacao,
    scoreConfianca: asScore(item.scoreConfianca),
    justificativa: String(item.justificativa || "Inconsistência detectada"),
    padraoErro: String(item.padraoErro || "padrao_nao_identificado"),
    sugestaoCorrecao: {
      acao,
      categoriaAtual: sugestao.categoriaAtual
        ? String(sugestao.categoriaAtual)
        : undefined,
      categoriaSugerida: sugestao.categoriaSugerida
        ? String(sugestao.categoriaSugerida)
        : undefined,
      descricao: String(
        sugestao.descricao || "Corrigir cadastro do insumo no UAU"
      ),
    },
  };
}

export function parseAnalysisResponse(
  content: string,
  totalInsumos: number,
  provider: string,
  model: string
): AnalysisResult {
  const parsed = extractJson(content) as Record<string, unknown>;
  const issues = Array.isArray(parsed.issues)
    ? parsed.issues.map(asIssue).filter((item): item is InsumoIssue => Boolean(item))
    : [];

  issues.sort((a, b) => b.scoreConfianca - a.scoreConfianca);

  return {
    summary:
      String(parsed.summary || "").trim() ||
      `${issues.length} inconsistência(s) encontrada(s) em ${totalInsumos} insumos.`,
    totalInsumos,
    totalIssues: issues.length,
    issues,
    provider,
    model,
  };
}
