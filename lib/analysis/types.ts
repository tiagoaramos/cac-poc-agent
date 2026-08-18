export type ClassificacaoInsumo = "valido" | "suspeito" | "invalido";

export type CorrecaoAcao = "reclassify" | "inactivate" | "remove";

export interface SugestaoCorrecao {
  acao: CorrecaoAcao;
  categoriaAtual?: string;
  categoriaSugerida?: string;
  descricao: string;
}

export interface InsumoIssue {
  codigo: string;
  descricao: string;
  categoria: string;
  classificacao: ClassificacaoInsumo;
  scoreConfianca: number;
  justificativa: string;
  padraoErro: string;
  sugestaoCorrecao: SugestaoCorrecao;
}

export interface AnalysisResult {
  summary: string;
  totalInsumos: number;
  totalIssues: number;
  issues: InsumoIssue[];
  provider: string;
  model: string;
}
