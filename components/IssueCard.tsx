"use client";

import { InsumoIssue } from "@/lib/analysis/types";

interface IssueCardProps {
  issue: InsumoIssue;
  status?: "idle" | "applying" | "corrected" | "error";
  errorMessage?: string;
  onFix: (issue: InsumoIssue) => void;
}

const BADGE: Record<string, string> = {
  invalido: "bg-red-100 text-red-700",
  suspeito: "bg-amber-100 text-amber-800",
};

export default function IssueCard({
  issue,
  status = "idle",
  errorMessage,
  onFix,
}: IssueCardProps) {
  const disabled = status === "applying" || status === "corrected";

  return (
    <article className="bg-white border border-slate-200 rounded-xl p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-mono text-xs text-slate-500">{issue.codigo}</p>
          <h3 className="text-base font-semibold text-slate-900 mt-1">
            {issue.descricao}
          </h3>
        </div>
        <span
          className={`text-xs px-2 py-1 rounded-full ${BADGE[issue.classificacao]}`}
        >
          {issue.classificacao} · {(issue.scoreConfianca * 100).toFixed(0)}%
        </span>
      </div>

      <p className="mt-3 text-sm text-slate-700">{issue.justificativa}</p>
      <p className="mt-2 text-xs text-slate-500">
        Padrão: {issue.padraoErro.split("_").join(" ")}
      </p>

      <div className="mt-4 rounded-lg bg-slate-50 border border-slate-100 p-3 text-sm text-slate-700">
        <p className="font-medium text-slate-800">Correção sugerida</p>
        <p className="mt-1">{issue.sugestaoCorrecao.descricao}</p>
      </div>

      {status === "corrected" && (
        <p className="mt-3 text-sm text-emerald-700">
          {errorMessage || "Correção enviada para a API UAU."}
        </p>
      )}
      {status === "error" && (
        <p className="mt-3 text-sm text-red-700">
          {errorMessage || "Falha ao aplicar correção no UAU."}
        </p>
      )}

      <button
        type="button"
        disabled={disabled}
        onClick={() => onFix(issue)}
        className="mt-4 px-4 py-2 text-sm font-medium rounded-lg bg-slate-900 text-white hover:bg-slate-800 disabled:bg-slate-300 disabled:cursor-not-allowed"
      >
        {status === "applying"
          ? "Enviando ao UAU..."
          : status === "corrected"
            ? "Corrigido"
            : "Corrigir no UAU"}
      </button>
    </article>
  );
}
