"use client";

import {
  createContext,
  ReactNode,
  useContext,
  useMemo,
  useState,
} from "react";

export interface LLMConfig {
  provider: string;
  apiKey: string;
  model: string;
}

interface LLMConfigContextValue {
  config: LLMConfig;
  setConfig: (config: LLMConfig) => void;
}

const LLMConfigContext = createContext<LLMConfigContextValue | null>(null);

const DEFAULT_CONFIG: LLMConfig = {
  provider: "test",
  apiKey: "",
  model: "",
};

export function LLMConfigProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<LLMConfig>(DEFAULT_CONFIG);
  const value = useMemo(() => ({ config, setConfig }), [config]);

  return (
    <LLMConfigContext.Provider value={value}>
      {children}
    </LLMConfigContext.Provider>
  );
}

export function useLLMConfig() {
  const context = useContext(LLMConfigContext);
  if (!context) {
    throw new Error("useLLMConfig must be used within LLMConfigProvider");
  }
  return context;
}
