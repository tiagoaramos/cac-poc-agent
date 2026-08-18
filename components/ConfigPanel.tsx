"use client";

interface LLMConfig {
  provider: string;
  apiKey: string;
  model: string;
}

interface ConfigPanelProps {
  config: LLMConfig;
  onConfigChange: (config: LLMConfig) => void;
}

const PROVIDERS = [
  { value: "mock", label: "Mock (sem API)", needsKey: false },
  { value: "openai", label: "OpenAI", needsKey: true },
  { value: "groq", label: "Groq (free tier)", needsKey: true },
  { value: "google", label: "Google AI (Gemini)", needsKey: true },
];

export default function ConfigPanel({
  config,
  onConfigChange,
}: ConfigPanelProps) {
  const selectedProvider = PROVIDERS.find((p) => p.value === config.provider);

  return (
    <div className="mb-6 p-4 bg-slate-50 border border-slate-200 rounded-lg">
      <h3 className="text-sm font-semibold text-slate-700 mb-3">
        Configuração da LLM
      </h3>

      <div className="grid gap-3 sm:grid-cols-3">
        <div>
          <label
            htmlFor="provider"
            className="block text-xs text-slate-500 mb-1"
          >
            Provider
          </label>
          <select
            id="provider"
            value={config.provider}
            onChange={(e) =>
              onConfigChange({ ...config, provider: e.target.value })
            }
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md"
          >
            {PROVIDERS.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
        </div>

        {selectedProvider?.needsKey && (
          <>
            <div>
              <label
                htmlFor="apiKey"
                className="block text-xs text-slate-500 mb-1"
              >
                API Key
              </label>
              <input
                id="apiKey"
                type="password"
                value={config.apiKey}
                onChange={(e) =>
                  onConfigChange({ ...config, apiKey: e.target.value })
                }
                placeholder="sk-..."
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md"
              />
            </div>

            <div>
              <label
                htmlFor="model"
                className="block text-xs text-slate-500 mb-1"
              >
                Model (opcional)
              </label>
              <input
                id="model"
                type="text"
                value={config.model}
                onChange={(e) =>
                  onConfigChange({ ...config, model: e.target.value })
                }
                placeholder="gpt-4o-mini"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md"
              />
            </div>
          </>
        )}
      </div>

      <p className="text-xs text-slate-400 mt-2">
        A API key fica apenas no browser e é enviada somente para o backend
        desta POC. Nada é persistido.
      </p>
    </div>
  );
}
