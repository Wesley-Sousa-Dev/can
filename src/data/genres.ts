import type { Genre, GenreId } from "@/types/game";

export const GENRES: Record<GenreId, Genre> = {
  action: { id: "action", name: "Ação" },
  adventure: { id: "adventure", name: "Aventura" },
  rpg: { id: "rpg", name: "RPG" },
  strategy: { id: "strategy", name: "Estratégia" },
  racing: { id: "racing", name: "Corrida" },
  simulation: { id: "simulation", name: "Simulação" },
  puzzle: { id: "puzzle", name: "Quebra-cabeça" },
  horror: { id: "horror", name: "Terror" },
};
