"use client";

import { ChevronDown, SlidersHorizontal } from "lucide-react";
import { useRef, useState, type RefObject } from "react";

import { SearchField } from "@/components/forms/SearchField";
import { SelectField } from "@/components/forms/SelectField";
import { PRICE_LIMIT_OPTIONS } from "@/lib/pricing";
import {
  countActiveFilters,
  DEFAULT_WISHLIST_FILTERS,
  WISHLIST_SORT_OPTIONS,
  type WishlistFilters,
  type WishlistSortOrder,
} from "@/lib/wishlist";

interface WishlistToolbarProps {
  filters: WishlistFilters;
  sortOrder: WishlistSortOrder;
  searchInputRef: RefObject<HTMLInputElement | null>;
  onFiltersChange: (filters: WishlistFilters) => void;
  onSortOrderChange: (sortOrder: WishlistSortOrder) => void;
}

const FILTERS_PANEL_ID = "wishlist-filters";

const CHECKBOX_LABEL_CLASS = "flex min-h-11 cursor-pointer items-center gap-3 text-medium text-title";

// Barra da lista de desejos, como a da Steam: busca, filtros e ordenação.
// Tudo é aplicado na hora, sem botão de enviar.
export function WishlistToolbar({
  filters,
  sortOrder,
  searchInputRef,
  onFiltersChange,
  onSortOrderChange,
}: WishlistToolbarProps) {
  const [areFiltersOpen, setAreFiltersOpen] = useState(false);
  const firstFilterRef = useRef<HTMLInputElement>(null);
  const activeFilterCount = countActiveFilters(filters);

  function updateFilters(changes: Partial<WishlistFilters>) {
    onFiltersChange({ ...filters, ...changes });
  }

  // O botão "Limpar filtros" some quando não há filtro ligado. O foco vai antes
  // para o primeiro filtro, para não se perder com o botão.
  function clearPanelFilters() {
    firstFilterRef.current?.focus();
    updateFilters({
      onlyDiscounted: DEFAULT_WISHLIST_FILTERS.onlyDiscounted,
      onlyReleased: DEFAULT_WISHLIST_FILTERS.onlyReleased,
      priceLimit: DEFAULT_WISHLIST_FILTERS.priceLimit,
    });
  }

  return (
    // role="search" cria um ponto de referência para quem navega por regiões.
    // O formulário não é enviado: os resultados mudam enquanto a pessoa digita.
    <form
      role="search"
      aria-label="Buscar e filtrar a lista de desejos"
      onSubmit={(event) => event.preventDefault()}
      className="flex flex-col gap-3"
    >
      <div className="flex flex-col gap-3 md:flex-row md:items-end">
        <SearchField
          ref={searchInputRef}
          id="wishlist-search"
          label="Buscar na lista"
          value={filters.searchTerm}
          placeholder="Nome, marcador ou gênero"
          onChange={(searchTerm) => updateFilters({ searchTerm })}
          className="flex-1"
        />

        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <button
            type="button"
            onClick={() => setAreFiltersOpen((wereOpen) => !wereOpen)}
            aria-expanded={areFiltersOpen}
            aria-controls={FILTERS_PANEL_ID}
            className="inline-flex min-h-11 shrink-0 items-center gap-2 self-start rounded-md border border-border-input bg-card px-4 text-medium font-medium text-title transition-colors hover:bg-panel"
          >
            <SlidersHorizontal aria-hidden="true" className="size-5" />
            Filtros
            {activeFilterCount > 0 && (
              <span className="rounded-full bg-primary px-2 text-small font-medium text-title">
                {activeFilterCount}
                <span className="sr-only"> {activeFilterCount === 1 ? "ativo" : "ativos"}</span>
              </span>
            )}
            <ChevronDown
              aria-hidden="true"
              className={`size-5 transition-transform ${areFiltersOpen ? "rotate-180" : ""}`}
            />
          </button>

          <SelectField
            id="wishlist-sort"
            label="Ordenar por"
            value={sortOrder}
            options={WISHLIST_SORT_OPTIONS}
            onChange={onSortOrderChange}
            className="flex-1 sm:w-64 sm:flex-none"
          />
        </div>
      </div>

      {/* Painel que abre embaixo da barra, sem cobrir a lista. */}
      <div id={FILTERS_PANEL_ID} hidden={!areFiltersOpen} className="rounded-lg bg-panel p-4 shadow-soft">
        <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end sm:gap-x-8">
          <fieldset>
            <legend className="text-small text-subtitle">Mostrar só</legend>
            <label className={CHECKBOX_LABEL_CLASS}>
              <input
                ref={firstFilterRef}
                type="checkbox"
                checked={filters.onlyDiscounted}
                onChange={(event) => updateFilters({ onlyDiscounted: event.target.checked })}
                className="size-5 accent-primary"
              />
              Jogos em promoção
            </label>
            <label className={CHECKBOX_LABEL_CLASS}>
              <input
                type="checkbox"
                checked={filters.onlyReleased}
                onChange={(event) => updateFilters({ onlyReleased: event.target.checked })}
                className="size-5 accent-primary"
              />
              Jogos já lançados
            </label>
          </fieldset>

          <SelectField
            id="wishlist-price-limit"
            label="Preço máximo"
            value={filters.priceLimit}
            options={PRICE_LIMIT_OPTIONS}
            onChange={(priceLimit) => updateFilters({ priceLimit })}
            className="sm:w-56"
          />

          {activeFilterCount > 0 && (
            <button
              type="button"
              onClick={clearPanelFilters}
              className="inline-flex min-h-11 items-center self-start rounded-md px-2 text-medium font-medium text-primary-focus underline underline-offset-4 hover:text-title sm:self-auto"
            >
              Limpar filtros
            </button>
          )}
        </div>
      </div>
    </form>
  );
}
