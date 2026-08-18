import { NextRequest, NextResponse } from "next/server";
import { getUauConfig } from "@/lib/config";
import { applyInsumoFix } from "@/lib/uau/repository";
import { CorrecaoAcao } from "@/lib/analysis/types";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const codigo = String(body.codigo || "").trim();
    const obra = String(body.obra || "").trim();

    if (!codigo || !obra) {
      return NextResponse.json(
        { error: "codigo e obra são obrigatórios" },
        { status: 400 }
      );
    }

    const config = getUauConfig();
    const acaoRaw = String(body.acao || "reclassify") as CorrecaoAcao;
    const acao: CorrecaoAcao =
      acaoRaw === "inactivate" || acaoRaw === "remove" ? acaoRaw : "reclassify";

    const result = await applyInsumoFix({
      codigo,
      obra,
      acao,
      categoriaSugerida: body.categoriaSugerida,
      empresa: String(body.empresa || config.empresa),
      orcamento: Number(body.orcamento || config.orcamento),
    });

    return NextResponse.json(result, { status: result.success ? 200 : 502 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro interno";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
