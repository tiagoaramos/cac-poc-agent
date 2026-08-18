"use client";

import { useEffect, useState } from "react";
import ObraCard from "@/components/ObraCard";
import { UauObra } from "@/lib/uau/types";

export default function Home() {
  const [obras, setObras] = useState<UauObra[]>([]);
  const [empresa, setEmpresa] = useState("9999");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const response = await fetch("/api/obras");
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || "Não foi possível listar as obras");
        }
        setEmpresa(data.empresa);
        setObras(data.obras || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro inesperado");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  return (
    <section>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Obras da empresa {empresa}</h1>
        <p className="text-slate-500 mt-1">
          Selecione um projeto para analisar os insumos do orçamento e identificar
          padrões de erro.
        </p>
      </div>

      {loading && (
        <p className="text-slate-500">Carregando obras na API UAU...</p>
      )}

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {!loading && !error && obras.length === 0 && (
        <p className="text-slate-500">Nenhuma obra encontrada para esta empresa.</p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {obras.map((obra) => (
          <ObraCard key={obra.codigo} obra={obra} />
        ))}
      </div>
    </section>
  );
}
