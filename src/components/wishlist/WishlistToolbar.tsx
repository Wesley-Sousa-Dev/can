"use client";

import { ChevronDown, Search, SlidersHorizontal } from "lucide-react";
import { useRef, useState, type RefObject } from "react";

import {
  countActiveFilters,
  DEFAULT_WISHLIST_FILTERS,
  PRICE_LIMIT_OPTIONS,
  WISHLIST_SORT_OPTIONS,
  type PriceLimit,
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

const FIELD_LABEL_CLASS = "text-small text-subtitle";

const SELECT_CLASS =
  "min-h-11 w-full appearance-none rounded-md border border-border-input bg-card pl-3 pr-10 text-medium text-title";

const CHECKBOX_LABEL_CLASS = "flex min-h-11 cursor-pointer items-center gap-3 text-medium text-title";

function isSortOrder(value: string): value is WishlistSortOrder {
  return WISHLIST_SORT_OPTIONS.some((option) => option.value === value);
}

function isPriceLimit(value: string): value is PriceLimit {
  return PRICE_LIMIT_OPTIONS.some((option) => option.value === value);
}

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
        <div className="flex flex-1 flex-col gap-1">
          <label htmlFor="wishlist-search" className={FIELD_LABEL_CLASS}>
            Buscar na lista
          </label>
          <div className="relative">
            <Search
              aria-hidden="true"
              className="pointer-events-none absolute top-1/2 left-3 size-5 -translate-y-1/2 text-placeholder"
            />
            <input
              ref={searchInputRef}
              id="wishlist-search"
              type="search"
              value={filters.searchTerm}
              onChange={(event) => updateFilters({ searchTerm: event.target.value })}
              placeholder="Nome, marcador ou gênero"
              autoComplete="off"
              spellCheck={false}
              className="min-h-11 w-full rounded-md border border-border-input bg-background pr-3 pl-10 text-medium text-title placeholder:text-placeholder"
            />
          </div>
        </div>

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

          <div className="flex min-w-0 flex-1 flex-col gap-1 sm:w-64 sm:flex-none">
            <label htmlFor="wishlist-sort" className={FIELD_LABEL_CLASS}>
              Ordenar por
            </label>
            <div className="relative">
              <select
                id="wishlist-sort"
                value={sortOrder}
                onChange={(event) => {
                  if (isSortOrder(event.target.value)) {
                    onSortOrderChange(event.target.value);
                  }
                }}
                className={SELECT_CLASS}
              >
                {WISHLIST_SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <ChevronDown
                aria-hidden="true"
                className="pointer-events-none absolute top-1/2 right-3 size-5 -translate-y-1/2 text-subtitle"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Painel que abre embaixo da barra, sem cobrir a lista. */}
      <div id={FILTERS_PANEL_ID} hidden={!areFiltersOpen} className="rounded-lg bg-panel p-4 shadow-soft">
        <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end sm:gap-x-8">
          <fieldset>
            <legend className={FIELD_LABEL_CLASS}>Mostrar só</legend>
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

          <div className="flex flex-col gap-1 sm:w-56">
            <label htmlFor="wishlist-price-limit" className={FIELD_LABEL_CLASS}>
              Preço máximo
            </label>
            <div className="relative">
              <select
                id="wishlist-price-limit"
                value={filters.priceLimit}
                onChange={(event) => {
                  if (isPriceLimit(event.target.value)) {
                    updateFilters({ priceLimit: event.target.value });
                  }
                }}
                className={SELECT_CLASS}
              >
                {PRICE_LIMIT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <ChevronDown
                aria-hidden="true"
                className="pointer-events-none absolute top-1/2 right-3 size-5 -translate-y-1/2 text-subtitle"
              />
            </div>
          </div>

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
