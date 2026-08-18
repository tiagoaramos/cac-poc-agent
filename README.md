# POC LLM Assistant

Proof of concept: busca dados de API externa → processa com LLM → exibe resposta.

## Stack

- **Next.js 14** (App Router) — frontend + API routes serverless
- **Tailwind CSS** — estilização
- **Adapter Pattern** — LLM provider configurável (OpenAI, Groq, Google, Mock)
- **PokeAPI** — API externa de exemplo (troque por qualquer outra)

## Setup Local

```bash
npm install
npm run dev
```

Acesse http://localhost:3000

## Configuração LLM

Por padrão usa o provider **mock** (sem API key).

Para usar um provider real, configure no `.env.local`:

```env
LLM_PROVIDER=groq
GROQ_API_KEY=your-key-here
```

Ou configure direto na UI via painel ⚙️ Config.

## Deploy (Vercel)

1. Push no GitHub
2. Importe o projeto na [Vercel](https://vercel.com)
3. Configure as env vars (LLM_PROVIDER, API keys)
4. Deploy automático

## Adicionar novo LLM Provider

1. Crie uma classe em `lib/llm/providers/` implementando a interface `LLMProvider`
2. Registre no `lib/llm/factory.ts`
3. Adicione a opção no `components/ConfigPanel.tsx`

## Trocar a API externa

Edite `lib/external-api.ts` — altere a função `fetchExternalData` para chamar a API desejada.
