/**
 * Client para API externa.
 * Atualmente usa a PokeAPI como exemplo gratuito.
 * Troque pela API real que desejar — basta alterar a função fetchExternalData.
 */

export interface ExternalDataResult {
  source: string;
  query: string;
  data: Record<string, unknown>;
  summary: string;
}

const BASE_URL =
  process.env.EXTERNAL_API_BASE_URL || "https://pokeapi.co/api/v2";

/**
 * Busca dados na API externa com base na query do usuário.
 * Adapte esta função para a API que você quiser consumir.
 */
export async function fetchExternalData(
  query: string
): Promise<ExternalDataResult> {
  const normalizedQuery = query.toLowerCase().trim();

  try {
    const response = await fetch(`${BASE_URL}/pokemon/${normalizedQuery}`);

    if (!response.ok) {
      if (response.status === 404) {
        return {
          source: "PokeAPI",
          query: normalizedQuery,
          data: {},
          summary: `Nenhum resultado encontrado para "${normalizedQuery}".`,
        };
      }
      throw new Error(`External API error: ${response.status}`);
    }

    const raw = await response.json();

    const data = {
      name: raw.name,
      id: raw.id,
      types: raw.types?.map((t: { type: { name: string } }) => t.type.name),
      abilities: raw.abilities?.map(
        (a: { ability: { name: string } }) => a.ability.name
      ),
      stats: raw.stats?.map(
        (s: { stat: { name: string }; base_stat: number }) => ({
          name: s.stat.name,
          value: s.base_stat,
        })
      ),
      height: raw.height,
      weight: raw.weight,
      sprite: raw.sprites?.front_default,
    };

    const summary = `Pokemon: ${data.name} (#${data.id}), Types: ${data.types?.join(", ")}, Abilities: ${data.abilities?.join(", ")}, Height: ${data.height}, Weight: ${data.weight}`;

    return {
      source: "PokeAPI",
      query: normalizedQuery,
      data,
      summary,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return {
      source: "PokeAPI",
      query: normalizedQuery,
      data: {},
      summary: `Erro ao buscar dados: ${message}`,
    };
  }
}
