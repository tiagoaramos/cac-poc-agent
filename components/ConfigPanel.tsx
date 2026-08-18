"use client";

import { LLMConfig } from "./LLMConfigProvider";

interface ConfigPanelProps {
  config: LLMConfig;
  onConfigChange: (config: LLMConfig) => void;
}

const PROVIDERS = [
  {
    value: "test",
    label: "Teste (regras provisórias)",
    needsKey: false,
  },
  { value: "openai", label: "OpenAI", needsKey: true },
  { value: "groq", label: "Groq", needsKey: true },
  { value: "mock", label: "Mock genérico", needsKey: false },
];

export default function ConfigPanel({
  config,
  onConfigChange,
}: ConfigPanelProps) {
  const selected = PROVIDERS.find((provider) => provider.value === config.provider);

  return (
    <div className="mb-6 p-4 bg-white/10 border border-white/15 rounded-lg">
      <h3 className="text-sm font-semibold text-white mb-3">Provider de LLM</h3>
      <div className="grid gap-3 sm:grid-cols-3">
        <div>
          <label htmlFor="provider" className="block text-xs text-slate-300 mb-1">
            Provider
          </label>
          <select
            id="provider"
            value={config.provider}
            onChange={(event) =>
              onConfigChange({ ...config, provider: event.target.value })
            }
            className="w-full px-3 py-2 text-sm rounded-md bg-slate-900 text-white border border-white/20"
          >
            {PROVIDERS.map((provider) => (
              <option key={provider.value} value={provider.value}>
                {provider.label}
              </option>
            ))}
          </select>
        </div>

        {selected?.needsKey && (
          <>
            <div>
              <label htmlFor="apiKey" className="block text-xs text-slate-300 mb-1">
                API Key
              </label>
              <input
                id="apiKey"
                type="password"
                value={config.apiKey}
                onChange={(event) =>
                  onConfigChange({ ...config, apiKey: event.target.value })
                }
                placeholder="sk-..."
                className="w-full px-3 py-2 text-sm rounded-md bg-slate-900 text-white border border-white/20"
              />
            </div>
            <div>
              <label htmlFor="model" className="block text-xs text-slate-300 mb-1">
                Modelo (opcional)
              </label>
              <input
                id="model"
                type="text"
                value={config.model}
                onChange={(event) =>
                  onConfigChange({ ...config, model: event.target.value })
                }
                placeholder="gpt-4o-mini"
                className="w-full px-3 py-2 text-sm rounded-md bg-slate-900 text-white border border-white/20"
              />
            </div>
          </>
        )}
      </div>
      <p className="text-xs text-slate-400 mt-3">
        Até que as regras sejam definidas, o provider de teste marca todo
        insumo da categoria <strong>pro</strong> (Projeto) como inválido.
      </p>
    </div>
  );
}
