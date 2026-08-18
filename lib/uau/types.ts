export interface UauObra {
  codigo: string;
  empresa: number;
  nome: string;
  tipo: number;
  tipoLabel: string;
  dataInicio: string | null;
  dataFim: string | null;
  dataAlteracao: string | null;
  status: number;
}

export interface UauInsumo {
  codigo: string;
  descricao: string;
  categoria: string;
  categoriaDescricao: string;
  unidade: string;
  especificacao: string;
  orcamento: number;
}

export interface UauObraDetalhe {
  obra: UauObra;
  insumos: UauInsumo[];
}

export interface UauFixPayload {
  codigo: string;
  acao: "reclassify" | "inactivate" | "remove";
  categoriaSugerida?: string;
  obra: string;
  empresa: string;
  orcamento: number;
}

export interface UauFixResult {
  success: boolean;
  endpoint: string;
  payload: Record<string, unknown>;
  response?: unknown;
  error?: string;
  mocked?: boolean;
}

export interface RawUauObra {
  Cod_obr?: string;
  cod_obr?: string;
  Empresa_obr?: number | string;
  empresa_obr?: number | string;
  Descr_obr?: string;
  descr_obr?: string;
  TipoObra_obr?: number;
  DtIni_obr?: string;
  Dtfim_obr?: string;
  DataAlt_obr?: string;
  Status_obr?: number;
  [key: string]: unknown;
}

export interface RawUauInsumo {
  Cod_ins?: string;
  Descr_ins?: string;
  Categ_ins?: string;
  Desc_cger?: string;
  CodUn_InsO?: string;
  CodUn_UnIns?: string;
  Especi_ins?: string;
  NumOrca_cio?: number;
  [key: string]: unknown;
}
