import { NextRequest, NextResponse } from "next/server";
import { analyzeInsumos } from "@/lib/analysis/analyze-insumos";
import { getUauConfig } from "@/lib/config";
import {
  createDefaultProvider,
  createLLMProvider,
  ProviderName,
} from "@/lib/llm/factory";
import { getObra, listInsumos } from "@/lib/uau/repository";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

interface RouteContext {
  params: { codigo: string };
}

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const codigo = context.params.codigo;
    const body = await request.json().catch(() => ({}));
    const config = getUauConfig();
    const empresa = body.empresa || config.empresa;
    const orcamento = Number(body.orcamento || config.orcamento);

    const obra = await getObra(empresa, codigo);
    if (!obra) {
      return NextResponse.json(
        { error: `Obra ${codigo} não encontrada na empresa ${empresa}` },
        { status: 404 }
      );
    }

    const insumos = await listInsumos(empresa, codigo, orcamento);
    const provider = body.providerOverride?.provider
      ? createLLMProvider({
          provider: body.providerOverride.provider as ProviderName,
          apiKey: body.providerOverride.apiKey,
          model: body.providerOverride.model,
        })
      : createDefaultProvider();

    const analysis = await analyzeInsumos(provider, obra, insumos);
    return NextResponse.json({ empresa, orcamento, obra, insumos, analysis });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro interno";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
