import type { AgeRating } from "@/types/game";

// Textos oficiais da Classificação Indicativa brasileira.
export function describeAgeRating(ageRating: AgeRating): string {
  if (ageRating === "L") {
    return "Livre para todos os públicos";
  }
  return `Não recomendado para menores de ${ageRating} anos`;
}
