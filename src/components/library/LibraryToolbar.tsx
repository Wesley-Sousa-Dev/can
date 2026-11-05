"use client";

import { LayoutGrid, List } from "lucide-react";
import type { RefObject } from "react";

import { SearchField } from "@/components/forms/SearchField";
import { SelectField, type SelectOption } from "@/components/forms/SelectField";
import type { LibraryLayout } from "@/components/library/LibraryGameCard";
import {
  LIBRARY_SORT_OPTIONS,
  type LibraryFilters,
  type LibraryGenreFilter,
  type LibrarySortOrder,
} from "@/lib/library";
import type { Genre } from "@/types/game";

interface LibraryToolbarProps {
  filters: LibraryFilters;
  sortOrder: LibrarySortOrder;
  layout: LibraryLayout;
  genres: Genre[];
  searchInputRef: RefObject<HTMLInputElement | null>;
  onFiltersChange: (filters: LibraryFilters) => void;
  onSortOrderChange: (sortOrder: LibrarySortOrder) => void;
  onLayoutChange: (layout: LibraryLayout) => void;
}

const LAYOUT_OPTIONS: { value: LibraryLayout; label: string; Icon: typeof LayoutGrid }[] = [
  { value: "grid", label: "Grade", Icon: LayoutGrid },
  { value: "list", label: "Lista", Icon: List },
];

// Barra da biblioteca: busca, gênero, ordenação e o modo de exibição.
export function LibraryToolbar({
  filters,
  sortOrder,
  layout,
  genres,
  searchInputRef,
  onFiltersChange,
  onSortOrderChange,
  onLayoutChange,
}: LibraryToolbarProps) {
  const genreOptions: SelectOption<LibraryGenreFilter>[] = [
    { value: "all", label: "Todos os gêneros" },
    ...genres.map((genre) => ({ value: genre.id, label: genre.name })),
  ];

  return (
    <form
      role="search"
      aria-label="Buscar e filtrar a biblioteca"
      onSubmit={(event) => event.preventDefault()}
      className="flex flex-col gap-3 lg:flex-row lg:items-end"
    >
      <SearchField
        ref={searchInputRef}
        id="library-search"
        label="Buscar na biblioteca"
        value={filters.searchTerm}
        placeholder="Nome ou gênero"
        onChange={(searchTerm) => onFiltersChange({ ...filters, searchTerm })}
        className="lg:flex-1"
      />
      <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end lg:flex">
        <SelectField
          id="library-genre"
          label="Gênero"
          value={filters.genreId}
          options={genreOptions}
          onChange={(genreId) => onFiltersChange({ ...filters, genreId })}
          className="lg:w-48"
        />
        <SelectField
          id="library-sort"
          label="Ordenar por"
          value={sortOrder}
          options={LIBRARY_SORT_OPTIONS}
          onChange={onSortOrderChange}
          className="lg:w-60"
        />
        {/* Botões de alternância: aria-pressed diz qual modo está ativo. */}
        <div role="group" aria-label="Modo de exibição" className="flex w-fit rounded-md border border-border-input">
          {LAYOUT_OPTIONS.map(({ value, label, Icon }) => (
            <button
              key={value}
              type="button"
              aria-pressed={layout === value}
              onClick={() => onLayoutChange(value)}
              className="inline-flex min-h-11 items-center gap-2 bg-card px-3 first:rounded-l-md last:rounded-r-md text-medium font-medium text-subtitle transition-colors hover:text-title aria-pressed:bg-primary aria-pressed:text-title"
            >
              <Icon aria-hidden="true" className="size-5" />
              {label}
            </button>
          ))}
        </div>
      </div>
    </form>
  );
}
