import { RawUauInsumo, RawUauObra, UauInsumo, UauObra } from "./types";

const TIPO_OBRA: Record<number, string> = {
  1: "Horizontal",
  2: "Vertical",
};

function asString(value: unknown): string {
  if (value === null || value === undefined) return "";
  return String(value).trim();
}

function asNumber(value: unknown): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function asDate(value: unknown): string | null {
  const text = asString(value);
  if (!text) return null;
  return text;
}

function pick(raw: Record<string, unknown>, ...keys: string[]): unknown {
  for (const key of keys) {
    if (raw[key] !== undefined && raw[key] !== null) return raw[key];
  }
  return undefined;
}

export function mapObra(raw: RawUauObra): UauObra {
  const record = raw as Record<string, unknown>;
  const tipo = asNumber(pick(record, "TipoObra_obr", "tipoObra_obr"));
  return {
    codigo: asString(pick(record, "Cod_obr", "cod_obr")),
    empresa: asNumber(pick(record, "Empresa_obr", "empresa_obr")),
    nome: asString(pick(record, "Descr_obr", "descr_obr")),
    tipo,
    tipoLabel: TIPO_OBRA[tipo] || "Não informado",
    dataInicio: asDate(pick(record, "DtIni_obr", "dtini_obr")),
    dataFim: asDate(pick(record, "Dtfim_obr", "dtfim_obr")),
    dataAlteracao: asDate(pick(record, "DataAlt_obr", "dataAlt_obr")),
    status: asNumber(pick(record, "Status_obr", "status_obr")),
  };
}

export function mapInsumo(raw: RawUauInsumo): UauInsumo {
  const especificacao = asString(raw.Especi_ins);
  return {
    codigo: asString(raw.Cod_ins),
    descricao: asString(raw.Descr_ins),
    categoria: asString(raw.Categ_ins).toLowerCase(),
    categoriaDescricao: asString(raw.Desc_cger),
    unidade: asString(raw.CodUn_InsO || raw.CodUn_UnIns),
    especificacao: especificacao === "null" ? "" : especificacao,
    orcamento: asNumber(raw.NumOrca_cio),
  };
}
