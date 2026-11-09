import type { Metadata } from "next";

import { SearchView } from "@/components/catalog/SearchView";
import { getGenres, searchStoreCatalog } from "@/services/gameService";
import type { Genre, GenreId } from "@/types/game";

export const metadata: Metadata = {
  title: "Pesquisar na loja",
  description: "Encontre jogos da Can pelo nome, com filtros de preço, promoção e gênero.",
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
  const initialSearchTerm = typeof q === "string" ? q : "";
  // Sem termo, a página mostra as ofertas da loja para filtrar por gênero e preço.
  const [games, genres] = await Promise.all([searchStoreCatalog(initialSearchTerm), getGenres()]);
  const initialGenreIds = parseGenreIds(genre, genres);

  // A key recria a busca quando a página é aberta com outros parâmetros,
  // em vez de manter o texto digitado antes.
  return (
    <SearchView
      key={`${initialSearchTerm}|${initialGenreIds.join(",")}`}
      initialGames={games}
      initialSearchTerm={initialSearchTerm}
      initialGenreIds={initialGenreIds}
    />
  );
}
