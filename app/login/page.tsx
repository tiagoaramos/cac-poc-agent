import { Suspense } from "react";
import LoginForm from "@/components/LoginForm";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <p className="text-amber-400 text-sm font-medium tracking-wide uppercase">
          CAC Engenharia
        </p>
        <h1 className="text-3xl font-bold text-white mt-2">
          Validação de insumos
        </h1>
        <p className="text-slate-400 mt-2 mb-8">
          Entre com o usuário administrador do portal.
        </p>
        <div className="bg-slate-800/80 border border-white/10 rounded-2xl p-6">
          <Suspense>
            <LoginForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
