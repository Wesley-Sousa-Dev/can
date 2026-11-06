"use client";

import { ChevronDown, SlidersHorizontal } from "lucide-react";
import { useId, useRef, useState } from "react";

import { SelectField } from "@/components/forms/SelectField";
import {
  countActiveCatalogFilters,
  DEFAULT_CATALOG_FILTERS,
  type CatalogFilters,
  type GenreCount,
} from "@/lib/gameCatalog";
import { PRICE_LIMIT_OPTIONS } from "@/lib/pricing";
import type { GenreId } from "@/types/game";

interface CatalogFiltersPanelProps {
  /** Prefixo dos ids, para a página poder ter mais de um painel sem repetir ids. */
  idPrefix: string;
  filters: CatalogFilters;
  genreCounts: GenreCount[];
  /** Título do grupo de gêneros: "Gêneros" na busca, "Combinar com" na página de um gênero. */
  genreLegend: string;
  onFiltersChange: (filters: CatalogFilters) => void;
}

const CHECKBOX_LABEL_CLASS = "flex min-h-11 cursor-pointer items-center gap-3 text-medium text-title";

// Painel lateral de filtros, como o da Steam. No celular ele vira um botão
// "Filtros" que abre o painel, para a lista aparecer logo.
export function CatalogFiltersPanel({
  idPrefix,
  filters,
  genreCounts,
  genreLegend,
  onFiltersChange,
}: CatalogFiltersPanelProps) {
  const [isOpenOnMobile, setIsOpenOnMobile] = useState(false);
  const titleId = useId();
  const priceSelectRef = useRef<HTMLDivElement>(null);
  const panelId = `${idPrefix}-filters`;
  const activeFilterCount = countActiveCatalogFilters(filters);

  function toggleGenre(genreId: GenreId, isChecked: boolean) {
    const genreIds = isChecked
      ? [...filters.genreIds, genreId]
      : filters.genreIds.filter((selectedGenreId) => selectedGenreId !== genreId);
    onFiltersChange({ ...filters, genreIds });
  }

  // O botão some quando não há filtro ligado. O foco vai antes para o
  // primeiro filtro, para não se perder com o botão.
  function clearFilters() {
    priceSelectRef.current?.querySelector("select")?.focus();
    onFiltersChange({ ...DEFAULT_CATALOG_FILTERS, searchTerm: filters.searchTerm });
  }

  return (
    <div className="flex flex-col gap-3">
      <button
        type="button"
        onClick={() => setIsOpenOnMobile((wasOpen) => !wasOpen)}
        aria-expanded={isOpenOnMobile}
        aria-controls={panelId}
        className="inline-flex min-h-11 items-center gap-2 self-start rounded-md border border-border-input bg-card px-4 text-medium font-medium text-title transition-colors hover:bg-panel lg:hidden"
      >
        <SlidersHorizontal aria-hidden="true" className="size-5" />
        Filtros
        {activeFilterCount > 0 && (
          <span className="rounded-full bg-primary px-2 text-small font-medium text-title">
            {activeFilterCount}
            <span className="sr-only"> {activeFilterCount === 1 ? "ativo" : "ativos"}</span>
          </span>
        )}
        <ChevronDown aria-hidden="true" className={`size-5 transition-transform ${isOpenOnMobile ? "rotate-180" : ""}`} />
      </button>

      <div
        id={panelId}
        role="group"
        aria-labelledby={titleId}
        className={`${isOpenOnMobile ? "flex" : "hidden"} flex-col gap-5 rounded-lg bg-panel p-4 shadow-soft lg:flex`}
      >
        <p id={titleId} className="font-display text-x-large uppercase tracking-wide text-title">
          Filtros
        </p>

        <div ref={priceSelectRef}>
          <SelectField
            id={`${idPrefix}-price-limit`}
            label="Preço máximo"
            value={filters.priceLimit}
            options={PRICE_LIMIT_OPTIONS}
            onChange={(priceLimit) => onFiltersChange({ ...filters, priceLimit })}
          />
        </div>

        <label className={CHECKBOX_LABEL_CLASS}>
          <input
            type="checkbox"
            checked={filters.onlyDiscounted}
            onChange={(event) => onFiltersChange({ ...filters, onlyDiscounted: event.target.checked })}
            className="size-5 accent-primary"
          />
          Só jogos em promoção
        </label>

        {genreCounts.length > 0 && (
          <fieldset>
            <legend className="text-small uppercase tracking-wide text-subtitle">{genreLegend}</legend>
            {genreCounts.map(({ genre, count }) => (
              <label key={genre.id} className={`${CHECKBOX_LABEL_CLASS} justify-between`}>
                <span className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={filters.genreIds.includes(genre.id)}
                    onChange={(event) => toggleGenre(genre.id, event.target.checked)}
                    className="size-5 accent-primary"
                  />
                  {genre.name}
                </span>
                <span className="text-small text-subtitle">
                  {count}
                  <span className="sr-only"> {count === 1 ? "jogo" : "jogos"}</span>
                </span>
              </label>
            ))}
          </fieldset>
        )}

        {activeFilterCount > 0 && (
          <button
            type="button"
            onClick={clearFilters}
            className="inline-flex min-h-11 items-center self-start rounded-md px-2 text-medium font-medium text-primary-focus underline underline-offset-4 hover:text-title"
          >
            Limpar filtros
          </button>
        )}
      </div>
    </div>
  );
}
