import { NextRequest, NextResponse } from "next/server";
import { getUauConfig } from "@/lib/config";
import { getObra, listInsumos } from "@/lib/uau/repository";

export const dynamic = "force-dynamic";

interface RouteContext {
  params: { codigo: string };
}

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const codigo = context.params.codigo;
    const empresa =
      request.nextUrl.searchParams.get("empresa") || getUauConfig().empresa;
    const orcamento = Number(
      request.nextUrl.searchParams.get("orcamento") || getUauConfig().orcamento
    );

    const obra = await getObra(empresa, codigo);
    if (!obra) {
      return NextResponse.json(
        { error: `Obra ${codigo} não encontrada na empresa ${empresa}` },
        { status: 404 }
      );
    }

    const insumos = await listInsumos(empresa, codigo, orcamento);
    return NextResponse.json({ empresa, orcamento, obra, insumos });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro interno";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
