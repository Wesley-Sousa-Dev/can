"use client";

import { SearchX } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { CatalogFiltersPanel } from "@/components/catalog/CatalogFiltersPanel";
import { SearchField } from "@/components/forms/SearchField";
import { SelectField } from "@/components/forms/SelectField";
import { GameListItem } from "@/components/game/GameListItem";
import {
  CATALOG_SORT_OPTIONS,
  countGamesByGenre,
  DEFAULT_CATALOG_FILTERS,
  filterCatalog,
  sortCatalog,
  type CatalogFilters,
  type CatalogSortOrder,
} from "@/lib/gameCatalog";
import type { GameShowcase, GenreId } from "@/types/game";

interface SearchViewProps {
  games: GameShowcase[];
  initialSearchTerm: string;
  initialGenreIds: GenreId[];
}

function describeResults(count: number, searchTerm: string): string {
  const resultCount = count === 1 ? "1 resultado" : `${count} resultados`;
  const trimmedSearchTerm = searchTerm.trim();
  return trimmedSearchTerm ? `${resultCount} para “${trimmedSearchTerm}”` : resultCount;
}

// Endereço que reproduz a busca atual, para dar para copiar, favoritar ou voltar.
function buildSearchPageUrl({ searchTerm, genreIds }: CatalogFilters): string {
  const searchParams = new URLSearchParams();
  if (searchTerm.trim()) {
    searchParams.set("q", searchTerm.trim());
  }
  if (genreIds.length > 0) {
    searchParams.set("genre", genreIds.join(","));
  }
  const queryString = searchParams.toString();
  return queryString ? `/search?${queryString}` : "/search";
}

// Pesquisa completa da loja: os resultados mudam enquanto a pessoa digita
// ou marca um filtro, e o endereço da página acompanha.
export function SearchView({ games, initialSearchTerm, initialGenreIds }: SearchViewProps) {
  const [filters, setFilters] = useState<CatalogFilters>({
    ...DEFAULT_CATALOG_FILTERS,
    searchTerm: initialSearchTerm,
    genreIds: initialGenreIds,
  });
  const [sortOrder, setSortOrder] = useState<CatalogSortOrder>("relevance");
  const searchInputRef = useRef<HTMLInputElement>(null);

  const visibleGames = sortCatalog(filterCatalog(games, filters), sortOrder, filters.searchTerm);

  // replaceState troca o endereço sem recarregar a página nem criar uma entrada
  // nova no histórico a cada letra digitada.
  useEffect(() => {
    window.history.replaceState(null, "", buildSearchPageUrl(filters));
  }, [filters]);

  function clearSearchAndFilters() {
    setFilters(DEFAULT_CATALOG_FILTERS);
    searchInputRef.current?.focus();
  }

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-6 sm:px-6">
      <h1 className="font-display text-xx-large uppercase text-title sm:text-xxx-large">Pesquisar na loja</h1>

      <form
        role="search"
        aria-label="Pesquisar jogos"
        onSubmit={(event) => event.preventDefault()}
        className="flex flex-col gap-3 rounded-lg bg-panel p-3 shadow-soft sm:flex-row sm:items-end"
      >
        <SearchField
          ref={searchInputRef}
          id="search-page-term"
          label="Buscar por nome, marcador, gênero ou estúdio"
          value={filters.searchTerm}
          placeholder="Ex.: corrida"
          onChange={(searchTerm) => setFilters({ ...filters, searchTerm })}
          className="flex-1"
        />
        <SelectField
          id="search-page-sort"
          label="Ordenar por"
          value={sortOrder}
          options={CATALOG_SORT_OPTIONS}
          onChange={setSortOrder}
          className="sm:w-64"
        />
      </form>

      <div className="grid gap-6 lg:grid-cols-[16rem_1fr] lg:items-start">
        <CatalogFiltersPanel
          idPrefix="search-page"
          filters={filters}
          genreCounts={countGamesByGenre(games)}
          genreLegend="Gêneros"
          onFiltersChange={setFilters}
        />

        <section aria-labelledby="search-results-heading" className="flex min-w-0 flex-col gap-4">
          <h2 id="search-results-heading" className="sr-only">
            Resultados
          </h2>
          {/* A contagem é anunciada sozinha a cada mudança na busca ou nos filtros. */}
          <p role="status" className="text-small font-medium uppercase tracking-wide text-subtitle">
            {describeResults(visibleGames.length, filters.searchTerm)}
          </p>

          {visibleGames.length > 0 ? (
            <ul className="flex flex-col gap-3">
              {visibleGames.map((game) => (
                <li key={game.id}>
                  <GameListItem game={game} showReleaseDate />
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex flex-col items-start gap-3 rounded-lg border border-dashed border-border-input p-6">
              <SearchX aria-hidden="true" className="size-8 text-primary-focus" />
              <h3 className="font-display text-x-large text-title">Nenhum jogo encontrado</h3>
              <p className="text-medium text-subtitle">
                Confira se o nome está certo, tente uma palavra mais curta ou tire alguns filtros.
              </p>
              <button
                type="button"
                onClick={clearSearchAndFilters}
                className="inline-flex min-h-11 items-center rounded-md bg-primary px-4 text-medium font-medium text-title transition-colors hover:bg-primary-hover"
              >
                Limpar busca e filtros
              </button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
