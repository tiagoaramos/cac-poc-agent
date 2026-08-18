import { getUauConfig, hasUauCredentials } from "@/lib/config";
import { UauClient } from "./client";
import { FIXTURE_INSUMOS, FIXTURE_OBRAS } from "./fixtures";
import { mapInsumo, mapObra } from "./mappers";
import { filterSchemaRows } from "./schema-row";
import {
  RawUauInsumo,
  RawUauObra,
  UauFixPayload,
  UauFixResult,
  UauInsumo,
  UauObra,
} from "./types";
import { UauApiError } from "./uau-api-error";

function requireCredentials() {
  if (!hasUauCredentials()) {
    throw new Error(
      "Configure UAU_USUARIO, UAU_SENHA e UAU_INTEGRATION_TOKEN no .env.local"
    );
  }
}

export async function listObras(empresa: string): Promise<UauObra[]> {
  const config = getUauConfig();
  if (config.mock) {
    return FIXTURE_OBRAS.filter((obra) => String(obra.empresa) === empresa);
  }

  requireCredentials();
  const client = new UauClient();
  const raw = await client.post("Obras/ObterObrasAtivas");
  const rows = filterSchemaRows<RawUauObra>(raw);
  return rows
    .map(mapObra)
    .filter((obra) => String(obra.empresa) === empresa && Boolean(obra.codigo));
}

export async function getObra(
  empresa: string,
  codigo: string
): Promise<UauObra | null> {
  const config = getUauConfig();
  if (config.mock) {
    return FIXTURE_OBRAS.find((obra) => obra.codigo === codigo) || null;
  }

  requireCredentials();
  const client = new UauClient();
  const raw = await client.post("Obras/ConsultarObraPorChave", {
    Empresa: empresa,
    Obra: codigo,
  });
  const rows = filterSchemaRows<RawUauObra>(
    Array.isArray(raw) ? raw : raw ? [raw] : []
  );
  const item = rows[0];
  if (!item) {
    const obras = await listObras(empresa);
    return obras.find((obra) => obra.codigo === codigo) || null;
  }
  const mapped = mapObra(item);
  return {
    ...mapped,
    codigo: mapped.codigo || codigo,
    empresa: mapped.empresa || Number(empresa),
  };
}

export async function listInsumos(
  empresa: string,
  obra: string,
  orcamento: number
): Promise<UauInsumo[]> {
  const config = getUauConfig();
  if (config.mock) {
    return FIXTURE_INSUMOS[obra] || [];
  }

  requireCredentials();
  const client = new UauClient();
  const raw = await client.post("Orcamento/ConsultarInsumosPorChave", {
    Empresa: Number(empresa),
    Obra: obra,
    Orcamento: orcamento,
  });
  const rows = filterSchemaRows<RawUauInsumo>(raw);
  return rows.map(mapInsumo).filter((insumo) => Boolean(insumo.codigo));
}

export async function applyInsumoFix(
  payload: UauFixPayload
): Promise<UauFixResult> {
  const config = getUauConfig();
  const client = new UauClient();

  if (payload.acao === "remove") {
    const body = {
      empresa: Number(payload.empresa),
      obra: payload.obra,
      orcamento: payload.orcamento,
      insumo: payload.codigo,
      usuario: config.mock ? "mock" : client.getUsuario(),
    };
    return sendFix("Orcamento/ExcluirInsumoOrcamento", body);
  }

  if (payload.acao === "inactivate") {
    const body = {
      listaInsumosAtualizar: [
        {
          codigo: payload.codigo,
          status: 1,
        },
      ],
    };
    return sendFix("InsumosGeral/AtualizarInsumosGeral", body);
  }

  const body = {
    listaInsumosAtualizar: [
      {
        codigo: payload.codigo,
        CategoriaDoInsumo: payload.categoriaSugerida || "des",
      },
    ],
  };
  return sendFix("InsumosGeral/AtualizarInsumosGeral", body);
}

async function sendFix(
  endpoint: string,
  payload: Record<string, unknown>
): Promise<UauFixResult> {
  const config = getUauConfig();
  if (config.mock) {
    return {
      success: true,
      endpoint,
      payload,
      mocked: true,
      response: { message: "Correção simulada (UAU_MOCK=true)" },
    };
  }

  requireCredentials();
  const client = new UauClient();
  try {
    const response = await client.post(endpoint, payload);
    return {
      success: true,
      endpoint,
      payload,
      response,
    };
  } catch (error) {
    const message =
      error instanceof UauApiError
        ? error.message
        : error instanceof Error
          ? error.message
          : "Erro desconhecido ao aplicar correção no UAU";
    return {
      success: false,
      endpoint,
      payload,
      error: message,
    };
  }
}
