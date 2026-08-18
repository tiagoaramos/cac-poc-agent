"use client";

import { useState } from "react";
import SearchForm from "@/components/SearchForm";
import ResponseCard from "@/components/ResponseCard";
import ConfigPanel from "@/components/ConfigPanel";

interface LLMConfig {
  provider: string;
  apiKey: string;
  model: string;
}

interface AssistantResponse {
  content: string;
  provider: string;
  model: string;
}

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<AssistantResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showConfig, setShowConfig] = useState(false);
  const [config, setConfig] = useState<LLMConfig>({
    provider: "mock",
    apiKey: "",
    model: "",
  });

  async function handleSearch(query: string, question: string) {
    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      // 1. Busca dados na API externa
      const searchRes = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });

      if (!searchRes.ok) {
        const err = await searchRes.json();
        throw new Error(err.error || "Erro ao buscar dados");
      }

      const searchData = await searchRes.json();

      // 2. Envia para LLM com contexto
      const askRes = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question,
          context: searchData.summary
            ? `Fonte: ${searchData.source}\nDados: ${JSON.stringify(searchData.data, null, 2)}\nResumo: ${searchData.summary}`
            : undefined,
          providerOverride:
            config.provider !== "mock"
              ? {
                  provider: config.provider,
                  apiKey: config.apiKey,
                  model: config.model || undefined,
                }
              : undefined,
        }),
      });

      if (!askRes.ok) {
        const err = await askRes.json();
        throw new Error(err.error || "Erro ao processar com LLM");
      }

      const llmResponse = await askRes.json();
      setResponse(llmResponse);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro inesperado");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="max-w-3xl mx-auto px-4 py-12">
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">
            POC LLM Assistant
          </h1>
          <p className="text-slate-500 mt-1">
            Busca dados externos → processa com LLM → exibe resposta
          </p>
        </div>
        <button
          onClick={() => setShowConfig(!showConfig)}
          className="text-sm px-3 py-1.5 rounded-md border border-slate-300 hover:bg-slate-100 transition"
        >
          ⚙️ Config
        </button>
      </header>

      {showConfig && (
        <ConfigPanel config={config} onConfigChange={setConfig} />
      )}

      <SearchForm onSubmit={handleSearch} loading={loading} />

      {error && (
        <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {response && <ResponseCard response={response} />}
    </main>
  );
}
