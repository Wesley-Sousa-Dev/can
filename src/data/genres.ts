import type { Genre, GenreId } from "@/types/game";

// Nomes em português dos gêneros que a API reconhece. A Steam não tem
// "quebra-cabeça" nem "terror" como gênero (só como marcador), então eles não entram.
export const GENRES: Record<GenreId, Genre> = {
  action: { id: "action", name: "Ação" },
  adventure: { id: "adventure", name: "Aventura" },
  rpg: { id: "rpg", name: "RPG" },
  strategy: { id: "strategy", name: "Estratégia" },
  racing: { id: "racing", name: "Corrida" },
  simulation: { id: "simulation", name: "Simulação" },
};

export function isGenreId(value: string): value is GenreId {
  return value in GENRES;
}
