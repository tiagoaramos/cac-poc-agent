"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useLLMConfig } from "@/components/LLMConfigProvider";
import InsumoTable from "@/components/InsumoTable";
import IssueCard from "@/components/IssueCard";
import { AnalysisResult, InsumoIssue } from "@/lib/analysis/types";
import { UauInsumo, UauObra } from "@/lib/uau/types";

interface ObraPageProps {
  params: { codigo: string };
}

type FixStatus = "idle" | "applying" | "corrected" | "error";

export default function ObraPage({ params }: ObraPageProps) {
  const { config } = useLLMConfig();
  const [obra, setObra] = useState<UauObra | null>(null);
  const [insumos, setInsumos] = useState<UauInsumo[]>([]);
  const [empresa, setEmpresa] = useState("9999");
  const [orcamento, setOrcamento] = useState(1);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fixStatus, setFixStatus] = useState<Record<string, FixStatus>>({});
  const [fixErrors, setFixErrors] = useState<Record<string, string>>({});
  const autoStarted = useRef(false);

  const loadObra = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/obras/${params.codigo}`);
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Não foi possível carregar a obra");
      }
      setObra(data.obra);
      setInsumos(data.insumos || []);
      setEmpresa(data.empresa);
      setOrcamento(data.orcamento);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro inesperado");
    } finally {
      setLoading(false);
    }
  }, [params.codigo]);

  const runAnalysis = useCallback(async () => {
    setAnalyzing(true);
    setError(null);
    try {
      const needsKey = config.provider === "openai" || config.provider === "groq";
      const response = await fetch(`/api/obras/${params.codigo}/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          empresa,
          orcamento,
          providerOverride: {
            provider: config.provider,
            apiKey: needsKey ? config.apiKey : undefined,
            model: config.model || undefined,
          },
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Falha na análise dos insumos");
      }
      setObra(data.obra);
      setInsumos(data.insumos || []);
      setAnalysis(data.analysis);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro inesperado");
    } finally {
      setAnalyzing(false);
    }
  }, [config, empresa, orcamento, params.codigo]);

  useEffect(() => {
    loadObra();
  }, [loadObra]);

  useEffect(() => {
    if (autoStarted.current) return;
    if (!loading && obra && !analysis && !analyzing && !error) {
      autoStarted.current = true;
      runAnalysis();
    }
  }, [loading, obra, analysis, analyzing, error, runAnalysis]);

  async function handleFix(issue: InsumoIssue) {
    const confirmed = window.confirm(
      `Aplicar a correção do insumo ${issue.codigo} via API UAU?`
    );
    if (!confirmed) return;

    setFixStatus((current) => ({ ...current, [issue.codigo]: "applying" }));
    setFixErrors((current) => ({ ...current, [issue.codigo]: "" }));

    try {
      const response = await fetch("/api/insumos/fix", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          codigo: issue.codigo,
          obra: params.codigo,
          empresa,
          orcamento,
          acao: issue.sugestaoCorrecao.acao,
          categoriaSugerida: issue.sugestaoCorrecao.categoriaSugerida,
        }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || "A API UAU rejeitou a correção");
      }
      setFixStatus((current) => ({ ...current, [issue.codigo]: "corrected" }));
      if (data.mocked) {
        setFixErrors((current) => ({
          ...current,
          [issue.codigo]:
            "Correção simulada (UAU_MOCK=true). Configure as credenciais UAU e defina UAU_MOCK=false para gravar de verdade.",
        }));
      }
    } catch (err) {
      setFixStatus((current) => ({ ...current, [issue.codigo]: "error" }));
      setFixErrors((current) => ({
        ...current,
        [issue.codigo]:
          err instanceof Error ? err.message : "Erro ao corrigir no UAU",
      }));
    }
  }

  return (
    <section>
      <Link href="/" className="text-sm text-slate-500 hover:text-slate-800">
        ← Voltar para as obras
      </Link>

      {loading && <p className="mt-6 text-slate-500">Carregando obra...</p>}

      {error && (
        <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {obra && (
        <>
          <div className="mt-6 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400">
                Obra {obra.codigo} · Empresa {empresa}
              </p>
              <h1 className="text-2xl font-bold text-slate-900 mt-1">
                {obra.nome}
              </h1>
              <p className="text-slate-500 mt-1">
                {obra.tipoLabel} · orçamento {orcamento} · {insumos.length}{" "}
                insumos
              </p>
            </div>
            <button
              type="button"
              onClick={runAnalysis}
              disabled={analyzing}
              className="px-4 py-2 rounded-lg bg-amber-500 text-slate-900 font-medium hover:bg-amber-400 disabled:bg-slate-300"
            >
              {analyzing ? "Analisando..." : "Reanalisar insumos"}
            </button>
          </div>

          {analyzing && (
            <p className="mt-4 text-sm text-slate-500">
              Enviando insumos para o provider {config.provider}...
            </p>
          )}

          {analysis && (
            <div className="mt-8">
              <div className="flex items-center justify-between gap-3 mb-3">
                <h2 className="text-lg font-semibold text-slate-900">
                  Inconsistências
                </h2>
                <span className="text-xs px-2 py-1 rounded bg-slate-100 text-slate-500">
                  {analysis.provider} / {analysis.model}
                </span>
              </div>
              <p className="text-slate-600 mb-4">{analysis.summary}</p>

              {analysis.issues.length === 0 ? (
                <p className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-lg p-4">
                  Nenhum padrão de erro identificado neste orçamento.
                </p>
              ) : (
                <div className="grid gap-4">
                  {analysis.issues.map((issue) => (
                    <IssueCard
                      key={issue.codigo}
                      issue={issue}
                      status={fixStatus[issue.codigo] || "idle"}
                      errorMessage={fixErrors[issue.codigo]}
                      onFix={handleFix}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="mt-10">
            <h2 className="text-lg font-semibold text-slate-900 mb-3">
              Insumos do orçamento
            </h2>
            <InsumoTable insumos={insumos} />
          </div>
        </>
      )}
    </section>
  );
}
