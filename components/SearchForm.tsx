"use client";

import { useState } from "react";

interface SearchFormProps {
  onSubmit: (query: string, question: string) => void;
  loading: boolean;
}

export default function SearchForm({ onSubmit, loading }: SearchFormProps) {
  const [query, setQuery] = useState("");
  const [question, setQuestion] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim() || !question.trim()) return;
    onSubmit(query.trim(), question.trim());
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label
          htmlFor="query"
          className="block text-sm font-medium text-slate-700 mb-1"
        >
          Busca na API externa
        </label>
        <input
          id="query"
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ex: pikachu, charizard, bulbasaur..."
          className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
          disabled={loading}
        />
        <p className="text-xs text-slate-400 mt-1">
          Usando PokeAPI como exemplo. Troque pela API que desejar.
        </p>
      </div>

      <div>
        <label
          htmlFor="question"
          className="block text-sm font-medium text-slate-700 mb-1"
        >
          Pergunta para a LLM
        </label>
        <textarea
          id="question"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ex: Me dê uma análise completa deste pokemon, pontos fortes e fracos..."
          rows={3}
          className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition resize-none"
          disabled={loading}
        />
      </div>

      <button
        type="submit"
        disabled={loading || !query.trim() || !question.trim()}
        className="w-full py-2.5 px-4 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition"
      >
        {loading ? "Processando..." : "Buscar e Perguntar"}
      </button>
    </form>
  );
}
