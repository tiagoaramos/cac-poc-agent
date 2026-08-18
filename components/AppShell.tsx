"use client";

import { usePathname } from "next/navigation";
import { ReactNode } from "react";
import Header from "./Header";
import { LLMConfigProvider } from "./LLMConfigProvider";

export default function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  if (pathname === "/login") {
    return <>{children}</>;
  }

  return (
    <LLMConfigProvider>
      <Header />
      <main className="max-w-6xl mx-auto px-4 py-8">{children}</main>
    </LLMConfigProvider>
  );
}
