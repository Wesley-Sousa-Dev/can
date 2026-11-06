"use client";

import { SearchX } from "lucide-react";
import { useRef, useState } from "react";

import { CatalogFiltersPanel } from "@/components/catalog/CatalogFiltersPanel";
import { GameShowcaseRow } from "@/components/catalog/GameShowcaseRow";
import { SearchField } from "@/components/forms/SearchField";
import { useTabListNavigation } from "@/hooks/useTabListNavigation";
import {
  applyGenreView,
  countActiveCatalogFilters,
  countGamesByGenre,
  DEFAULT_CATALOG_FILTERS,
  filterCatalog,
  GENRE_VIEWS,
  type CatalogFilters,
  type GenreViewId,
} from "@/lib/gameCatalog";
import { normalizeForSearch } from "@/lib/text";
import type { GameShowcase, Genre } from "@/types/game";

interface GenreCatalogProps {
  genre: Genre;
  games: GameShowcase[];
}

const HEADING_ID = "genre-catalog-heading";
const PANEL_ID = "genre-catalog-panel";
const GENRE_VIEW_IDS = GENRE_VIEWS.map((view) => view.id);

function getViewTabId(viewId: GenreViewId): string {
  return `genre-view-${viewId}`;
}

function describeMatchCount(count: number): string {
  return count === 1 ? "1 correspondência" : `${count} correspondências`;
}

// Lista com todos os jogos do gênero, abaixo dos destaques, como a da Steam:
// abas de recorte (Tudo, Mais vendidos...), busca por nome e filtros ao lado.
export function GenreCatalog({ genre, games }: GenreCatalogProps) {
  const [selectedViewId, setSelectedViewId] = useState<GenreViewId>("all");
  const [filters, setFilters] = useState<CatalogFilters>(DEFAULT_CATALOG_FILTERS);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const { registerTab, handleTabListKeyDown } = useTabListNavigation(
    GENRE_VIEW_IDS,
    selectedViewId,
    setSelectedViewId,
  );

  const visibleGames = filterCatalog(applyGenreView(games, selectedViewId), filters);
  const hasSearchOrFilters =
    normalizeForSearch(filters.searchTerm) !== "" || countActiveCatalogFilters(filters) > 0;

  function clearSearchAndFilters() {
    setFilters(DEFAULT_CATALOG_FILTERS);
    searchInputRef.current?.focus();
  }

  return (
    <section aria-labelledby={HEADING_ID} className="flex flex-col gap-5">
      <h2 id={HEADING_ID} className="font-display text-x-large uppercase tracking-wide text-title">
        Todos os jogos de {genre.name}
      </h2>

      <div className="grid gap-6 lg:grid-cols-[16rem_1fr] lg:items-start">
        <CatalogFiltersPanel
          idPrefix="genre-catalog"
          filters={filters}
          genreCounts={countGamesByGenre(games, genre.id)}
          genreLegend="Combinar com"
          onFiltersChange={setFilters}
        />

        <div className="flex min-w-0 flex-col gap-4">
          <div className="flex flex-col gap-3 rounded-lg bg-panel p-3 shadow-soft">
            <div
              role="tablist"
              aria-label={`Recortes dos jogos de ${genre.name}`}
              onKeyDown={handleTabListKeyDown}
              className="flex flex-wrap"
            >
              {GENRE_VIEWS.map((view) => {
                const isSelected = view.id === selectedViewId;
                return (
                  <button
                    key={view.id}
                    ref={registerTab(view.id)}
                    type="button"
                    role="tab"
                    id={getViewTabId(view.id)}
                    aria-selected={isSelected}
                    aria-controls={PANEL_ID}
                    tabIndex={isSelected ? 0 : -1}
                    onClick={() => setSelectedViewId(view.id)}
                    className={`min-h-11 border-b-2 px-3 text-small font-medium uppercase tracking-wide transition-colors ${
                      isSelected
                        ? "border-primary-focus text-title"
                        : "border-transparent text-subtitle hover:text-title"
                    }`}
                  >
                    {view.label}
                  </button>
                );
              })}
            </div>
            <SearchField
              ref={searchInputRef}
              id="genre-catalog-search"
              label="Buscar nesta lista"
              value={filters.searchTerm}
              placeholder="Nome, marcador ou estúdio"
              onChange={(searchTerm) => setFilters({ ...filters, searchTerm })}
              className="sm:w-72 sm:self-end"
            />
          </div>

          {/* A contagem é anunciada sozinha quando a aba, a busca ou os filtros mudam. */}
          <p role="status" className="text-small font-medium uppercase tracking-wide text-subtitle">
            {describeMatchCount(visibleGames.length)}
          </p>

          {/* Sem links nem botões dentro, o painel precisa receber foco para ser lido pelo teclado. */}
          <div
            id={PANEL_ID}
            role="tabpanel"
            aria-labelledby={getViewTabId(selectedViewId)}
            tabIndex={visibleGames.length === 0 && !hasSearchOrFilters ? 0 : undefined}
          >
            {visibleGames.length > 0 ? (
              <ul className="flex flex-col gap-4">
                {visibleGames.map((game) => (
                  <li key={game.id}>
                    <GameShowcaseRow game={game} />
                  </li>
                ))}
              </ul>
            ) : (
              <div className="flex flex-col items-start gap-3 rounded-lg border border-dashed border-border-input p-6">
                <SearchX aria-hidden="true" className="size-8 text-primary-focus" />
                <p className="text-medium text-title">
                  {hasSearchOrFilters
                    ? "Nenhum jogo desta aba combina com a busca e os filtros."
                    : "Nenhum jogo nesta aba por enquanto."}
                </p>
                {hasSearchOrFilters && (
                  <button
                    type="button"
                    onClick={clearSearchAndFilters}
                    className="inline-flex min-h-11 items-center rounded-md bg-primary px-4 text-medium font-medium text-title transition-colors hover:bg-primary-hover"
                  >
                    Limpar busca e filtros
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
