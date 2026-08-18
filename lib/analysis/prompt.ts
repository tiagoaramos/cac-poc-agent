import { UauInsumo, UauObra } from "@/lib/uau/types";

export function buildAnalysisPrompt(obra: UauObra, insumos: UauInsumo[]) {
  const system = `Você é um analista de orçamento de obras da CAC Engenharia.
Sua tarefa é identificar padrões de erro nos insumos lançados no orçamento de uma obra.

Padrões a procurar:
1. Categoria incompatível com a descrição do insumo
2. Insumo incompatível com o tipo/fase típica da obra
3. Projetos, RH ou despesas lançados como se fossem material de execução
4. Unidade de medida incoerente com o insumo
5. Duplicidade ou cadastro inconsistente

Classifique cada problema como "suspeito" ou "invalido".
Não inclua insumos válidos no array issues.

Responda APENAS um JSON válido neste formato:
{
  "summary": "resumo em português",
  "issues": [
    {
      "codigo": "string",
      "descricao": "string",
      "categoria": "string",
      "classificacao": "suspeito" | "invalido",
      "scoreConfianca": 0.0,
      "justificativa": "string",
      "padraoErro": "string",
      "sugestaoCorrecao": {
        "acao": "reclassify" | "inactivate" | "remove",
        "categoriaAtual": "string",
        "categoriaSugerida": "string",
        "descricao": "o que deve ser corrigido no UAU"
      }
    }
  ]
}`;

  const user = JSON.stringify(
    {
      obra: {
        codigo: obra.codigo,
        nome: obra.nome,
        tipo: obra.tipoLabel,
        periodo: {
          inicio: obra.dataInicio,
          fim: obra.dataFim,
        },
      },
      insumos,
    },
    null,
    2
  );

  return { system, user };
}
