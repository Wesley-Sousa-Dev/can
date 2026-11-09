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
import { searchStoreCatalog } from "@/services/gameService";
import type { GameShowcase, GenreId } from "@/types/game";

interface SearchViewProps {
  /** Resultados do termo inicial, já buscados pelo servidor. */
  initialGames: GameShowcase[];
  initialSearchTerm: string;
  initialGenreIds: GenreId[];
}

interface SearchResults {
  /** Termo que a API respondeu. Enquanto ele difere do digitado, uma busca está a caminho. */
  searchTerm: string;
  games: GameShowcase[];
  hasFailed: boolean;
}

/** Espera a pessoa parar de digitar antes de chamar a API. */
const SEARCH_DELAY_MS = 400;

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
export function SearchView({ initialGames, initialSearchTerm, initialGenreIds }: SearchViewProps) {
  const [filters, setFilters] = useState<CatalogFilters>({
    ...DEFAULT_CATALOG_FILTERS,
    searchTerm: initialSearchTerm,
    genreIds: initialGenreIds,
  });
  const [sortOrder, setSortOrder] = useState<CatalogSortOrder>("relevance");
  const [results, setResults] = useState<SearchResults>({
    searchTerm: initialSearchTerm.trim(),
    games: initialGames,
    hasFailed: false,
  });
  const searchInputRef = useRef<HTMLInputElement>(null);

  const trimmedSearchTerm = filters.searchTerm.trim();
  const isSearching = trimmedSearchTerm !== results.searchTerm;
  // A API já buscou pelo nome; aqui entram só os filtros do painel e a ordem.
  const visibleGames = sortCatalog(
    filterCatalog(results.games, { ...filters, searchTerm: "" }),
    sortOrder,
    results.searchTerm,
  );

  // GET /games?search= a cada termo novo, depois de uma pausa na digitação.
  useEffect(() => {
    if (trimmedSearchTerm === results.searchTerm) {
      return;
    }
    let isCurrentSearch = true;
    const timeoutId = window.setTimeout(() => {
      searchStoreCatalog(trimmedSearchTerm)
        .then((games) => {
          if (isCurrentSearch) {
            setResults({ searchTerm: trimmedSearchTerm, games, hasFailed: false });
          }
        })
        .catch(() => {
          if (isCurrentSearch) {
            setResults({ searchTerm: trimmedSearchTerm, games: [], hasFailed: true });
          }
        });
    }, SEARCH_DELAY_MS);
    return () => {
      isCurrentSearch = false;
      window.clearTimeout(timeoutId);
    };
  }, [trimmedSearchTerm, results.searchTerm]);

  function describeStatus(): string {
    if (isSearching) {
      return "Buscando...";
    }
    if (results.hasFailed) {
      return "Não foi possível buscar agora";
    }
    return describeResults(visibleGames.length, results.searchTerm);
  }

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
          label="Buscar pelo nome do jogo"
          value={filters.searchTerm}
          placeholder="Ex.: portal"
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
          genreCounts={countGamesByGenre(results.games)}
          genreLegend="Gêneros"
          onFiltersChange={setFilters}
        />

        <section aria-labelledby="search-results-heading" className="flex min-w-0 flex-col gap-4">
          <h2 id="search-results-heading" className="sr-only">
            Resultados
          </h2>
          {/* A contagem é anunciada sozinha a cada mudança na busca ou nos filtros. */}
          <p role="status" className="text-small font-medium uppercase tracking-wide text-subtitle">
            {describeStatus()}
          </p>

          {results.hasFailed && !isSearching ? (
            <div className="flex flex-col items-start gap-3 rounded-lg border border-dashed border-border-input p-6">
              <SearchX aria-hidden="true" className="size-8 text-error-text" />
              <h3 className="font-display text-x-large text-title">O servidor da Can não respondeu</h3>
              <p className="text-medium text-subtitle">Confira sua conexão e tente buscar de novo daqui a pouco.</p>
            </div>
          ) : visibleGames.length > 0 ? (
            <ul className="flex flex-col gap-3">
              {visibleGames.map((game) => (
                <li key={game.id}>
                  <GameListItem game={game} />
                </li>
              ))}
            </ul>
          ) : (
            <div
              aria-busy={isSearching}
              className="flex flex-col items-start gap-3 rounded-lg border border-dashed border-border-input p-6"
            >
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
