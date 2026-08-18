# CAC POC Agent — Validação de insumos

Portal da empresa **9999 (EMPRESA TESTE)** para listar obras, analisar insumos do orçamento com LLM e aplicar correções na API UAU.

Fluxo:

1. Lista as obras da empresa 9999
2. Ao clicar na obra, busca os insumos em `Orcamento/ConsultarInsumosPorChave`
3. Envia os insumos para um prompt de análise (OpenAI ou provider de teste)
4. Mostra inconsistências (categoria errada, tipo incompatível, etc.)
5. O revisor confirma e a correção vai para a API UAU (`InsumosGeral/AtualizarInsumosGeral` ou exclusão no orçamento)

## Setup

```bash
npm install
cp .env.example .env.local
# preencha credenciais UAU no .env.local
npm run dev
```

Acesse http://localhost:3000 — a tela de login usa `AUTH_ADMIN_USER` e `AUTH_ADMIN_PASSWORD` do `.env.local`.

## Login do portal

```env
AUTH_ADMIN_USER=admin
AUTH_ADMIN_PASSWORD=admin
AUTH_SECRET=troque-este-segredo
```

Se a senha tiver `#`, use aspas. Reinicie o `npm run dev` depois de alterar o `.env.local`.

## Provider de teste (sem tokens)

Por padrão `LLM_PROVIDER=test`. Esse provider **não chama OpenAI**. Ele trata todo insumo da categoria `pro` (Projeto) como inválido, para validar o fluxo completo.

Altere o tipo marcado com:

```env
TEST_LLM_FLAGGED_CATEGORY=pro
```

Categorias comuns na obra 9999: `pro`, `aco`, `con`, `rhu`, `des`, `sem`.

## UAU

Credenciais no `.env.local` (mesmo ambiente de teste usado em `cac-engenharia`):

- `UAU_BASE_URL=https://apiglobalteccac.fwc.cloud:36000`
- `UAU_USUARIO` / `UAU_SENHA` — se a senha tiver `#`, use aspas (`UAU_SENHA="..."`)
- `UAU_INTEGRATION_TOKEN`

Para desenvolver sem a API:

```env
UAU_MOCK=true
```

## OpenAI

```env
LLM_PROVIDER=openai
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o-mini
```

Também dá para trocar o provider no botão **LLM** do cabeçalho.

## Correção no UAU

Cada inconsistência sugere uma ação:

- `reclassify` — atualiza a categoria em `InsumosGeral/AtualizarInsumosGeral`
- `inactivate` — inativa o insumo no cadastro geral
- `remove` — remove o insumo do orçamento (`Orcamento/ExcluirInsumoOrcamento`)

O provider de teste sugere reclassificar `pro` → `des` (Despesas).
