import { NextRequest, NextResponse } from "next/server";
import { getUauConfig } from "@/lib/config";
import { listObras } from "@/lib/uau/repository";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const empresa =
      request.nextUrl.searchParams.get("empresa") || getUauConfig().empresa;
    const obras = await listObras(empresa);
    return NextResponse.json({ empresa, obras });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro interno";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
