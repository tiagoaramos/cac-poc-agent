"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ConfigPanel from "./ConfigPanel";
import { useLLMConfig } from "./LLMConfigProvider";

export default function Header() {
  const { config, setConfig } = useLLMConfig();
  const router = useRouter();
  const [showConfig, setShowConfig] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } finally {
      setLoggingOut(false);
    }
  }

  return (
    <header className="bg-slate-900 text-white">
      <div className="max-w-6xl mx-auto px-4 py-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <Link href="/" className="text-xl font-semibold tracking-tight">
              CAC Engenharia
            </Link>
            <p className="text-sm text-slate-300 mt-1">
              Portal de validação de insumos — empresa 9999 (EMPRESA TESTE)
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowConfig(!showConfig)}
              className="text-sm px-3 py-1.5 rounded-md border border-white/20 hover:bg-white/10 transition"
            >
              LLM: {config.provider}
            </button>
            <button
              type="button"
              onClick={handleLogout}
              disabled={loggingOut}
              className="text-sm px-3 py-1.5 rounded-md border border-white/20 hover:bg-white/10 transition"
            >
              {loggingOut ? "Saindo..." : "Sair"}
            </button>
          </div>
        </div>
        {showConfig && (
          <div className="mt-4">
            <ConfigPanel config={config} onConfigChange={setConfig} />
          </div>
        )}
      </div>
    </header>
  );
}
