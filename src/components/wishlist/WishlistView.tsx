"use client";

import { Heart, SearchX } from "lucide-react";
import Link from "next/link";
import { useRef, useState, type DragEvent, type RefObject } from "react";
import { flushSync } from "react-dom";

import { Avatar } from "@/components/ui/Avatar";
import {
  getMoveButtonId,
  getTitleLinkId,
  WishlistItemRow,
  type MoveDirection,
  type WishlistDragHandlers,
} from "@/components/wishlist/WishlistItemRow";
import { WishlistToolbar } from "@/components/wishlist/WishlistToolbar";
import { useGameCollection } from "@/hooks/useGameCollection";
import { useSession } from "@/hooks/useSession";
import { formatGameCount } from "@/lib/text";
import {
  buildWishlistItems,
  DEFAULT_WISHLIST_FILTERS,
  filterWishlistItems,
  getSortOptionLabel,
  hasActiveSearchOrFilters,
  sortWishlistItems,
  type WishlistFilters,
  type WishlistItem,
  type WishlistSortOrder,
} from "@/lib/wishlist";
import {
  cartCollection,
  libraryCollection,
  wishlistCollection,
} from "@/services/userCollections";
import type { GameListing } from "@/types/game";

interface WishlistViewProps {
  games: GameListing[];
}

interface EmptyStateProps {
  headingRef: RefObject<HTMLHeadingElement | null>;
}

const PRIMARY_ACTION_CLASS =
  "inline-flex min-h-11 items-center rounded-md bg-primary px-4 text-medium font-medium text-title transition-colors hover:bg-primary-hover";

const EMPTY_STATE_CLASS =
  "flex flex-col items-start gap-3 rounded-lg border border-dashed border-border-input p-6";

function EmptyWishlist({ headingRef }: EmptyStateProps) {
  return (
    <div className={EMPTY_STATE_CLASS}>
      <Heart aria-hidden="true" className="size-8 text-primary-focus" />
      <h2 ref={headingRef} tabIndex={-1} className="font-display text-x-large text-title">
        Sua lista de desejos está vazia
      </h2>
      <p className="text-medium text-subtitle">
        Achou um jogo para comprar depois? Use o botão “Lista de desejos” na página dele e ele
        aparece aqui.
      </p>
      <Link href="/" className={PRIMARY_ACTION_CLASS}>
        Explorar a loja
      </Link>
    </div>
  );
}

function NoMatchingGames({ headingRef, onClear }: EmptyStateProps & { onClear: () => void }) {
  return (
    <div className={EMPTY_STATE_CLASS}>
      <SearchX aria-hidden="true" className="size-8 text-primary-focus" />
      <h2 ref={headingRef} tabIndex={-1} className="font-display text-x-large text-title">
        Nenhum jogo encontrado
      </h2>
      <p className="text-medium text-subtitle">
        Nenhum jogo da sua lista combina com a busca e os filtros escolhidos.
      </p>
      <button type="button" onClick={onClear} className={PRIMARY_ACTION_CLASS}>
        Limpar busca e filtros
      </button>
    </div>
  );
}

interface ReorderHintProps {
  sortOrder: WishlistSortOrder;
  hasSearchOrFilters: boolean;
}

// Explica como mudar a ordem, ou por que as setas de posição sumiram.
function ReorderHint({ sortOrder, hasSearchOrFilters }: ReorderHintProps) {
  const hintClass = "-mt-3 text-small text-subtitle";
  if (sortOrder !== "custom") {
    return <p className={hintClass}>Para mudar a ordem dos jogos, escolha “Posição personalizada” em Ordenar por.</p>;
  }
  if (hasSearchOrFilters) {
    return <p className={hintClass}>Para mudar a ordem dos jogos, limpe a busca e os filtros.</p>;
  }
  return (
    <p className={hintClass}>
      Use as setas ao lado de cada jogo para mudar a ordem.
      {/* A alça de arrastar só aparece com mouse, então a dica também. */}
      <span className="hidden pointer-fine:inline"> Com o mouse, você também pode arrastar pela alça.</span>
    </p>
  );
}

export function WishlistView({ games }: WishlistViewProps) {
  const session = useSession();
  const wishlist = useGameCollection(wishlistCollection);
  const cart = useGameCollection(cartCollection);
  const library = useGameCollection(libraryCollection);
  const [filters, setFilters] = useState<WishlistFilters>(DEFAULT_WISHLIST_FILTERS);
  const [sortOrder, setSortOrder] = useState<WishlistSortOrder>("custom");
  const [statusMessage, setStatusMessage] = useState("");
  const [draggedGameId, setDraggedGameId] = useState<string | null>(null);
  const [dropTargetGameId, setDropTargetGameId] = useState<string | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const emptyStateHeadingRef = useRef<HTMLHeadingElement>(null);

  // A sessão e a lista moram no navegador: no HTML do servidor ainda não
  // existem. Sem esta espera, a tela piscaria "lista vazia" antes de carregar.
  if (session.status === "loading") {
    return (
      <p aria-busy="true" className="mx-auto max-w-6xl px-4 py-16 text-medium text-subtitle sm:px-6">
        Carregando lista de desejos...
      </p>
    );
  }

  const allItems = buildWishlistItems(wishlist.entries, games);
  const visibleItems = sortWishlistItems(filterWishlistItems(allItems, filters), sortOrder);
  const hasSearchOrFilters = hasActiveSearchOrFilters(filters);
  const canReorder = sortOrder === "custom" && !hasSearchOrFilters && allItems.length > 1;
  const pageTitle =
    session.status === "signed-in" ? `Lista de desejos de ${session.user.nickname}` : "Sua lista de desejos";
  const resultCountText = hasSearchOrFilters
    ? `Mostrando ${visibleItems.length} de ${formatGameCount(allItems.length)}`
    : formatGameCount(allItems.length);

  function clearSearchAndFilters() {
    setFilters(DEFAULT_WISHLIST_FILTERS);
    setStatusMessage("Busca e filtros limpos.");
    searchInputRef.current?.focus();
  }

  function changeSortOrder(nextSortOrder: WishlistSortOrder) {
    setSortOrder(nextSortOrder);
    setStatusMessage(`Lista ordenada por “${getSortOptionLabel(nextSortOrder)}”.`);
  }

  function moveItem(item: WishlistItem, targetItem: WishlistItem) {
    wishlist.moveGame(item.game.id, targetItem.game.id);
    // O jogo toma o lugar do alvo, então a nova posição é a que o alvo tinha.
    setStatusMessage(
      `${item.game.title} agora está na posição ${targetItem.position} de ${allItems.length}.`,
    );
  }

  // Mover troca a linha de lugar no HTML, e o navegador tira o foco dela.
  // O foco volta para a mesma seta, para dar para apertar de novo.
  function moveItemByOnePosition(item: WishlistItem, direction: MoveDirection) {
    const neighborIndex = item.position - 1 + (direction === "up" ? -1 : 1);
    const neighborItem = allItems[neighborIndex];
    if (!neighborItem) {
      return;
    }
    flushSync(() => moveItem(item, neighborItem));
    document.getElementById(getMoveButtonId(item.game.id, direction))?.focus();
  }

  // Depois de remover, o foco vai para o jogo seguinte (ou o anterior, se era
  // o último). Sem jogos na tela, vai para a mensagem de lista vazia.
  function removeItem(item: WishlistItem) {
    const visibleIndex = visibleItems.findIndex((visibleItem) => visibleItem.game.id === item.game.id);
    const nextFocusedItem = visibleItems[visibleIndex + 1] ?? visibleItems[visibleIndex - 1];
    flushSync(() => {
      wishlist.removeGame(item.game.id);
      setStatusMessage(`${item.game.title} foi removido da lista de desejos.`);
    });
    if (nextFocusedItem) {
      document.getElementById(getTitleLinkId(nextFocusedItem.game.id))?.focus();
    } else {
      emptyStateHeadingRef.current?.focus();
    }
  }

  function addToCart(item: WishlistItem) {
    cart.addGame(item.game.id);
    setStatusMessage(`${item.game.title} foi adicionado ao carrinho.`);
  }

  function addToLibrary(item: WishlistItem) {
    library.addGame(item.game.id);
    setStatusMessage(`${item.game.title} foi adicionado à sua biblioteca.`);
  }

  function clearDragState() {
    setDraggedGameId(null);
    setDropTargetGameId(null);
  }

  function buildDragHandlers(item: WishlistItem): WishlistDragHandlers {
    return {
      onDragStart: () => setDraggedGameId(item.game.id),
      onDragEnd: clearDragState,
      onDragOver(event: DragEvent<HTMLElement>) {
        // Só aceita linhas desta lista, e não textos ou arquivos arrastados de fora.
        if (!draggedGameId) {
          return;
        }
        event.preventDefault();
        event.dataTransfer.dropEffect = "move";
        setDropTargetGameId(item.game.id);
      },
      onDrop(event: DragEvent<HTMLElement>) {
        event.preventDefault();
        const draggedItem = allItems.find((candidate) => candidate.game.id === draggedGameId);
        if (draggedItem && draggedItem.game.id !== item.game.id) {
          moveItem(draggedItem, item);
        }
        clearDragState();
      },
    };
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
        <WishlistToolbar
          filters={filters}
          sortOrder={sortOrder}
          searchInputRef={searchInputRef}
          onFiltersChange={setFilters}
          onSortOrderChange={changeSortOrder}
        />
      )}

      <div className="flex flex-col gap-x-6 gap-y-1 sm:flex-row sm:items-baseline sm:justify-between">
        {/* A contagem é anunciada sozinha quando a busca ou os filtros mudam o resultado. */}
        {allItems.length > 0 && (
          <p role="status" className="text-small font-medium uppercase tracking-wide text-subtitle">
            {resultCountText}
          </p>
        )}
        {/* Confirmações das ações. Fica sempre no HTML, mesmo vazia, para ser anunciada (WCAG 4.1.3). */}
        <p role="status" className="min-h-6 text-small text-title sm:text-right">
          {statusMessage}
        </p>
      </div>

      {allItems.length > 1 && <ReorderHint sortOrder={sortOrder} hasSearchOrFilters={hasSearchOrFilters} />}

      {allItems.length === 0 && <EmptyWishlist headingRef={emptyStateHeadingRef} />}

      {allItems.length > 0 && visibleItems.length === 0 && (
        <NoMatchingGames headingRef={emptyStateHeadingRef} onClear={clearSearchAndFilters} />
      )}

      {visibleItems.length > 0 && (
        <ol aria-label="Jogos da lista de desejos" className="flex flex-col gap-3">
          {visibleItems.map((item, visibleIndex) => (
            <li key={item.game.id}>
              <WishlistItemRow
                item={item}
                canReorder={canReorder}
                isFirst={visibleIndex === 0}
                isLast={visibleIndex === visibleItems.length - 1}
                isInCart={cart.hasGame(item.game.id)}
                isInLibrary={library.hasGame(item.game.id)}
                isBeingDragged={draggedGameId === item.game.id}
                isDropTarget={dropTargetGameId === item.game.id && draggedGameId !== item.game.id}
                dragHandlers={buildDragHandlers(item)}
                onMove={(direction) => moveItemByOnePosition(item, direction)}
                onRemove={() => removeItem(item)}
                onAddToCart={() => addToCart(item)}
                onAddToLibrary={() => addToLibrary(item)}
              />
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
