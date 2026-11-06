import type { Metadata } from "next";

import { SearchView } from "@/components/catalog/SearchView";
import { getGameShowcases, getGenres } from "@/services/gameService";
import type { Genre, GenreId } from "@/types/game";

export const metadata: Metadata = {
  title: "Pesquisar na loja",
  description: "Encontre jogos da Can por nome, marcador, gênero ou estúdio, com filtros de preço e promoção.",
};

// "?genre=rpg,adventure" vira a lista de gêneros marcados. Ids que não existem são ignorados.
function parseGenreIds(value: string | string[] | undefined, genres: Genre[]): GenreId[] {
  if (typeof value !== "string") {
    return [];
  }
  return value.split(",").flatMap((genreId) => genres.find((genre) => genre.id === genreId)?.id ?? []);
}

export default async function SearchPage({ searchParams }: PageProps<"/search">) {
  const { q, genre } = await searchParams;
  const [games, genres] = await Promise.all([getGameShowcases(), getGenres()]);
  const initialSearchTerm = typeof q === "string" ? q : "";
  const initialGenreIds = parseGenreIds(genre, genres);

  // A key recria a busca quando a página é aberta com outros parâmetros,
  // em vez de manter o texto digitado antes.
  return (
    <SearchView
      key={`${initialSearchTerm}|${initialGenreIds.join(",")}`}
      games={games}
      initialSearchTerm={initialSearchTerm}
      initialGenreIds={initialGenreIds}
    />
  );
}
