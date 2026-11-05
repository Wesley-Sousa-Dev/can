"use client";

import { Gamepad2, SearchX } from "lucide-react";
import Link from "next/link";
import { useRef, useState } from "react";

import { LibraryGameCard, type LibraryLayout } from "@/components/library/LibraryGameCard";
import { LibraryToolbar } from "@/components/library/LibraryToolbar";
import { Avatar } from "@/components/ui/Avatar";
import { useGameCollection } from "@/hooks/useGameCollection";
import { useSession } from "@/hooks/useSession";
import {
  buildLibraryItems,
  DEFAULT_LIBRARY_FILTERS,
  filterLibraryItems,
  hasActiveLibraryFilters,
  listGenresInLibrary,
  sortLibraryItems,
  type LibraryFilters,
  type LibraryItem,
  type LibrarySortOrder,
} from "@/lib/library";
import { formatGameCount } from "@/lib/text";
import { launchGame } from "@/services/libraryService";
import { libraryCollection } from "@/services/userCollections";
import type { Game } from "@/types/game";

interface LibraryViewProps {
  games: Game[];
}

const LIST_CLASS_BY_LAYOUT: Record<LibraryLayout, string> = {
  grid: "grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4",
  list: "flex flex-col gap-3",
};

const EMPTY_STATE_CLASS =
  "flex flex-col items-start gap-3 rounded-lg border border-dashed border-border-input p-6";

export function LibraryView({ games }: LibraryViewProps) {
  const session = useSession();
  const library = useGameCollection(libraryCollection);
  const [filters, setFilters] = useState<LibraryFilters>(DEFAULT_LIBRARY_FILTERS);
  // Por padrão, os jogos mais recentes primeiro: quem acabou de comprar já
  // encontra os jogos novos no topo.
  const [sortOrder, setSortOrder] = useState<LibrarySortOrder>("recent-activity");
  const [layout, setLayout] = useState<LibraryLayout>("grid");
  const [statusMessage, setStatusMessage] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);

  // A sessão e a biblioteca moram no navegador: no HTML do servidor ainda não
  // existem. Sem esta espera, a tela piscaria "biblioteca vazia" antes de carregar.
  if (session.status === "loading") {
    return (
      <p aria-busy="true" className="mx-auto max-w-6xl px-4 py-16 text-medium text-subtitle sm:px-6">
        Carregando biblioteca...
      </p>
    );
  }

  const allItems = buildLibraryItems(library.entries, games);
  const visibleItems = sortLibraryItems(filterLibraryItems(allItems, filters), sortOrder);
  const hasFilters = hasActiveLibraryFilters(filters);
  const pageTitle = session.status === "signed-in" ? `Biblioteca de ${session.user.nickname}` : "Sua biblioteca";
  const resultCountText = hasFilters
    ? `Mostrando ${visibleItems.length} de ${formatGameCount(allItems.length)}`
    : formatGameCount(allItems.length);

  function playGame(item: LibraryItem) {
    launchGame(item.game.id);
    setStatusMessage(`Abrindo ${item.game.title}. Bom jogo!`);
  }

  function clearFilters() {
    setFilters(DEFAULT_LIBRARY_FILTERS);
    setStatusMessage("Busca e filtro limpos.");
    searchInputRef.current?.focus();
  }

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-5 px-4 py-6 sm:px-6">
      <div className="flex items-center gap-5">
        {session.status === "signed-in" && (
          <div className="hidden sm:block">
            <Avatar fullName={session.user.fullName} size="large" />
          </div>
        )}
        <h1 className="min-w-0 font-display text-xx-large uppercase text-title wrap-break-word sm:text-xxx-large">
          {pageTitle}
        </h1>
      </div>

      {allItems.length > 0 && (
        <LibraryToolbar
          filters={filters}
          sortOrder={sortOrder}
          layout={layout}
          genres={listGenresInLibrary(allItems)}
          searchInputRef={searchInputRef}
          onFiltersChange={setFilters}
          onSortOrderChange={setSortOrder}
          onLayoutChange={setLayout}
        />
      )}

      {allItems.length === 0 && (
        <div className={EMPTY_STATE_CLASS}>
          <Gamepad2 aria-hidden="true" className="size-8 text-primary-focus" />
          <h2 className="font-display text-x-large text-title">Sua biblioteca está vazia</h2>
          <p className="text-medium text-subtitle">
            Os jogos que você comprar ou os gratuitos que adicionar aparecem aqui, prontos para jogar.
          </p>
          <Link
            href="/"
            className="inline-flex min-h-11 items-center rounded-md bg-primary px-4 text-medium font-medium text-title transition-colors hover:bg-primary-hover"
          >
            Explorar a loja
          </Link>
        </div>
      )}

      {allItems.length > 0 && (
        <section aria-labelledby="library-games-heading" className="flex flex-col gap-4">
          <div className="flex flex-col gap-x-6 gap-y-1 sm:flex-row sm:items-baseline sm:justify-between">
            <div className="flex flex-wrap items-baseline gap-x-3">
              <h2 id="library-games-heading" className="font-display text-x-large uppercase tracking-wide text-title">
                Todos os jogos
              </h2>
              {/* A contagem é anunciada sozinha quando a busca ou o filtro mudam o resultado. */}
              <p role="status" className="text-small font-medium uppercase tracking-wide text-subtitle">
                {resultCountText}
              </p>
            </div>
            {/* Confirmações das ações. Fica sempre no HTML, mesmo vazia, para ser anunciada (WCAG 4.1.3). */}
            <p role="status" className="min-h-6 text-small text-title sm:text-right">
              {statusMessage}
            </p>
          </div>

          {visibleItems.length === 0 ? (
            <div className={EMPTY_STATE_CLASS}>
              <SearchX aria-hidden="true" className="size-8 text-primary-focus" />
              <h3 className="font-display text-x-large text-title">Nenhum jogo encontrado</h3>
              <p className="text-medium text-subtitle">Nenhum jogo da biblioteca combina com a busca e o gênero escolhidos.</p>
              <button
                type="button"
                onClick={clearFilters}
                className="inline-flex min-h-11 items-center rounded-md bg-primary px-4 text-medium font-medium text-title transition-colors hover:bg-primary-hover"
              >
                Limpar busca e filtro
              </button>
            </div>
          ) : (
            <ul className={LIST_CLASS_BY_LAYOUT[layout]}>
              {visibleItems.map((item) => (
                <li key={item.game.id}>
                  <LibraryGameCard item={item} layout={layout} onPlay={() => playGame(item)} />
                </li>
              ))}
            </ul>
          )}
        </section>
      )}
    </div>
  );
}
