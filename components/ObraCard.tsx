import Link from "next/link";
import { UauObra } from "@/lib/uau/types";

function formatDate(value: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("pt-BR");
}

export default function ObraCard({ obra }: { obra: UauObra }) {
  return (
    <Link
      href={`/obras/${obra.codigo}`}
      className="block bg-white border border-slate-200 rounded-xl p-5 hover:border-amber-400 hover:shadow-md transition"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-400">
            Obra {obra.codigo}
          </p>
          <h2 className="text-lg font-semibold text-slate-900 mt-1">
            {obra.nome}
          </h2>
        </div>
        <span className="text-xs px-2 py-1 rounded-full bg-slate-100 text-slate-600">
          {obra.tipoLabel}
        </span>
      </div>
      <dl className="mt-4 grid grid-cols-2 gap-3 text-sm text-slate-600">
        <div>
          <dt className="text-slate-400">Início</dt>
          <dd>{formatDate(obra.dataInicio)}</dd>
        </div>
        <div>
          <dt className="text-slate-400">Fim</dt>
          <dd>{formatDate(obra.dataFim)}</dd>
        </div>
      </dl>
      <p className="mt-4 text-sm font-medium text-amber-700">
        Analisar insumos →
      </p>
    </Link>
  );
}
