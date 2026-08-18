"use client";

import { FormEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [usuario, setUsuario] = useState("");
  const [senha, setSenha] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ usuario, senha }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Falha no login");
      }
      const nextPath = searchParams.get("next") || "/";
      router.push(nextPath.startsWith("/") ? nextPath : "/");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro inesperado");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="usuario" className="block text-sm text-slate-300 mb-1">
          Usuário
        </label>
        <input
          id="usuario"
          type="text"
          autoComplete="username"
          value={usuario}
          onChange={(event) => setUsuario(event.target.value)}
          className="w-full px-3 py-2.5 rounded-lg bg-slate-800 text-white border border-white/15 outline-none focus:border-amber-400"
          required
        />
      </div>
      <div>
        <label htmlFor="senha" className="block text-sm text-slate-300 mb-1">
          Senha
        </label>
        <input
          id="senha"
          type="password"
          autoComplete="current-password"
          value={senha}
          onChange={(event) => setSenha(event.target.value)}
          className="w-full px-3 py-2.5 rounded-lg bg-slate-800 text-white border border-white/15 outline-none focus:border-amber-400"
          required
        />
      </div>

      {error && (
        <p className="text-sm text-red-300 bg-red-950/40 border border-red-900 rounded-lg p-3">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full py-2.5 rounded-lg bg-amber-500 text-slate-900 font-semibold hover:bg-amber-400 disabled:bg-slate-600 disabled:text-slate-300"
      >
        {loading ? "Entrando..." : "Entrar"}
      </button>
    </form>
  );
}
