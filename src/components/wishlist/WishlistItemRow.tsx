"use client";

import { Check, ChevronDown, ChevronUp, GripHorizontal, Plus, X } from "lucide-react";
import Link from "next/link";
import { useRef, type DragEvent } from "react";
import { flushSync } from "react-dom";

import { GameCover } from "@/components/game/GameCover";
import { PriceTag } from "@/components/game/PriceTag";
import { formatShortDate, formatShortLocalDate } from "@/lib/dates";
import { getPurchaseOption } from "@/lib/gameAvailability";
import { formatCount, getReviewLabel } from "@/lib/reviews";
import type { WishlistItem } from "@/lib/wishlist";

export type MoveDirection = "up" | "down";

export interface WishlistDragHandlers {
  onDragStart: () => void;
  onDragEnd: () => void;
  onDragOver: (event: DragEvent<HTMLElement>) => void;
  onDrop: (event: DragEvent<HTMLElement>) => void;
}

interface WishlistItemRowProps {
  item: WishlistItem;
  /** Falso quando a lista está filtrada ou em outra ordem: aí as setas somem. */
  canReorder: boolean;
  isFirst: boolean;
  isLast: boolean;
  isInCart: boolean;
  isInLibrary: boolean;
  isBeingDragged: boolean;
  isDropTarget: boolean;
  dragHandlers: WishlistDragHandlers;
  onMove: (direction: MoveDirection) => void;
  onRemove: () => void;
  onAddToCart: () => void;
  onAddToLibrary: () => void;
}

// Ids usados pela lista para devolver o foco depois de mover ou remover um jogo.
export function getTitleLinkId(gameId: string): string {
  return `wishlist-title-${gameId}`;
}

export function getMoveButtonId(gameId: string, direction: MoveDirection): string {
  return `wishlist-move-${direction}-${gameId}`;
}

const CTA_BUTTON_CLASS =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-cta px-4 text-medium font-medium text-on-accent shadow-soft underline-offset-4 transition-shadow hover:underline hover:shadow-strong";

const DONE_LINK_CLASS =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-cta px-4 text-medium font-medium text-title underline-offset-4 transition-colors hover:bg-panel hover:underline";

const MOVE_BUTTON_CLASS =
  "grid size-11 place-items-center rounded-md text-subtitle transition-colors hover:bg-panel hover:text-title aria-disabled:cursor-not-allowed aria-disabled:text-disabled aria-disabled:hover:bg-transparent";

interface MoveButtonProps {
  gameId: string;
  gameTitle: string;
  direction: MoveDirection;
  isUnavailable: boolean;
  onMove: (direction: MoveDirection) => void;
}

// aria-disabled em vez de disabled: no topo ou no fim da lista o botão
// continua focável, então o foco não se perde depois do último movimento.
function MoveButton({ gameId, gameTitle, direction, isUnavailable, onMove }: MoveButtonProps) {
  const Icon = direction === "up" ? ChevronUp : ChevronDown;
  return (
    <button
      type="button"
      id={getMoveButtonId(gameId, direction)}
      aria-label={`Mover ${gameTitle} para ${direction === "up" ? "cima" : "baixo"}`}
      aria-disabled={isUnavailable}
      onClick={() => {
        if (!isUnavailable) {
          onMove(direction);
        }
      }}
      className={MOVE_BUTTON_CLASS}
    >
      <Icon aria-hidden="true" className="size-6" />
    </button>
  );
}

export function WishlistItemRow({
  item,
  canReorder,
  isFirst,
  isLast,
  isInCart,
  isInLibrary,
  isBeingDragged,
  isDropTarget,
  dragHandlers,
  onMove,
  onRemove,
  onAddToCart,
  onAddToLibrary,
}: WishlistItemRowProps) {
  const { game, addedAt, position } = item;
  const completedActionLinkRef = useRef<HTMLAnchorElement>(null);
  const titleId = `wishlist-heading-${game.id}`;
  const tagsLabelId = `wishlist-tags-${game.id}`;
  const purchaseOption = getPurchaseOption(game);
  const gamePageUrl = `/games/${game.slug}`;

  // O botão vira um link "No carrinho". O flushSync coloca o link na tela
  // na hora, para ele receber o foco no lugar do botão que sumiu.
  function runAndFocusCompletedAction(action: () => void) {
    flushSync(action);
    completedActionLinkRef.current?.focus();
  }

  // A alça é só para mouse. A imagem do arraste é a linha inteira, para
  // ficar claro qual jogo está sendo levado.
  function handleDragStart(event: DragEvent<HTMLSpanElement>) {
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", game.id);
    const row = event.currentTarget.closest("article");
    if (row) {
      event.dataTransfer.setDragImage(row, 24, 24);
    }
    dragHandlers.onDragStart();
  }

  function renderMainAction() {
    if (purchaseOption === "upcoming") {
      return <p className="text-medium font-medium text-title">Em breve</p>;
    }

    if (purchaseOption === "free") {
      return isInLibrary ? (
        <Link ref={completedActionLinkRef} href="/library" className={DONE_LINK_CLASS}>
          <Check aria-hidden="true" className="size-5 text-cta" />
          Na biblioteca<span className="sr-only">: ver biblioteca</span>
        </Link>
      ) : (
        <button type="button" onClick={() => runAndFocusCompletedAction(onAddToLibrary)} className={CTA_BUTTON_CLASS}>
          <Plus aria-hidden="true" className="size-5" />
          Biblioteca<span className="sr-only">: adicionar {game.title}</span>
        </button>
      );
    }

    return isInCart ? (
      <Link ref={completedActionLinkRef} href="/cart" className={DONE_LINK_CLASS}>
        <Check aria-hidden="true" className="size-5 text-cta" />
        No carrinho<span className="sr-only">: ver carrinho</span>
      </Link>
    ) : (
      <button type="button" onClick={() => runAndFocusCompletedAction(onAddToCart)} className={CTA_BUTTON_CLASS}>
        <Plus aria-hidden="true" className="size-5" />
        Carrinho<span className="sr-only">: adicionar {game.title}</span>
      </button>
    );
  }

  return (
    <article
      aria-labelledby={titleId}
      onDragOver={dragHandlers.onDragOver}
      onDrop={dragHandlers.onDrop}
      className={`flex gap-2 rounded-lg border-2 bg-card p-3 shadow-soft transition-opacity sm:gap-4 sm:p-4 ${
        isDropTarget ? "border-dashed border-primary-focus" : "border-transparent"
      } ${isBeingDragged ? "opacity-50" : ""}`}
    >
      {/* Coluna da posição, como a da Steam: setas, alça de arrastar e número. */}
      <div className="flex w-11 shrink-0 flex-col items-center gap-1">
        {canReorder && (
          <MoveButton
            gameId={game.id}
            gameTitle={game.title}
            direction="up"
            isUnavailable={isFirst}
            onMove={onMove}
          />
        )}
        {canReorder && (
          <span
            aria-hidden="true"
            draggable
            onDragStart={handleDragStart}
            onDragEnd={dragHandlers.onDragEnd}
            title="Arraste para mudar a posição"
            className="hidden size-11 cursor-grab place-items-center rounded-md text-subtitle hover:bg-panel hover:text-title active:cursor-grabbing pointer-fine:grid"
          >
            <GripHorizontal className="size-6" />
          </span>
        )}
        <p className="py-1 text-small font-medium text-subtitle">
          <span className="sr-only">Posição </span>
          {position}
        </p>
        {canReorder && (
          <MoveButton
            gameId={game.id}
            gameTitle={game.title}
            direction="down"
            isUnavailable={isLast}
            onMove={onMove}
          />
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-3 md:flex-row md:gap-4">
        {/* A capa repete o link do título. Fica fora do teclado e do leitor de
            tela para não criar uma parada a mais em cada jogo. */}
        <Link
          href={gamePageUrl}
          tabIndex={-1}
          aria-hidden="true"
          className="group block shrink-0 self-start overflow-hidden rounded-md max-md:w-full md:w-48"
        >
          <GameCover imageUrl={game.coverImageUrl} sizes="(min-width: 768px) 192px, 90vw" />
        </Link>

        <div className="flex min-w-0 flex-1 flex-col gap-3">
          <div className="flex flex-col gap-1 lg:flex-row lg:items-start lg:justify-between lg:gap-4">
            <h2 id={titleId} className="font-display text-x-large text-title">
              <Link
                id={getTitleLinkId(game.id)}
                href={gamePageUrl}
                className="underline-offset-4 hover:text-primary-focus hover:underline"
              >
                {game.title}
              </Link>
            </h2>
            <div className="flex flex-wrap items-center gap-x-2 lg:shrink-0">
              <p className="text-small text-subtitle">
                Adicionado em <time dateTime={addedAt}>{formatShortLocalDate(addedAt)}</time>
              </p>
              <button
                type="button"
                onClick={onRemove}
                className="-ml-2 inline-flex min-h-11 items-center gap-1 rounded-md px-2 text-small font-medium text-subtitle transition-colors hover:bg-panel hover:text-title"
              >
                <X aria-hidden="true" className="size-4 text-destructive" />
                Remover<span className="sr-only"> {game.title} da lista de desejos</span>
              </button>
            </div>
          </div>

          <dl className="flex flex-col gap-1 text-small sm:flex-row sm:flex-wrap sm:gap-x-6">
            <div className="flex flex-wrap gap-x-1">
              <dt className="uppercase text-subtitle">
                {purchaseOption === "upcoming" ? "Lançamento previsto:" : "Lançamento:"}
              </dt>
              <dd className="text-title">
                <time dateTime={game.releaseDate}>{formatShortDate(game.releaseDate)}</time>
              </dd>
            </div>
            <div className="flex flex-wrap gap-x-1">
              <dt className="uppercase text-subtitle">Análises:</dt>
              <dd className="text-title">
                {game.reviewSummary ? (
                  <>
                    <span className="font-medium">{getReviewLabel(game.reviewSummary)}</span>{" "}
                    <span className="text-subtitle">({formatCount(game.reviewSummary.totalReviews)})</span>
                  </>
                ) : (
                  <span className="text-subtitle">Depois do lançamento</span>
                )}
              </dd>
            </div>
          </dl>

          {game.tags.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <p id={tagsLabelId} className="text-small uppercase text-subtitle">
                Marcadores:
              </p>
              <ul aria-labelledby={tagsLabelId} className="flex flex-wrap gap-2">
                {game.tags.map((tag) => (
                  <li key={tag} className="rounded-md border border-tag px-2 text-small text-tag">
                    {tag}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-auto flex flex-wrap items-center justify-end gap-3">
            {purchaseOption !== "upcoming" && (
              <PriceTag priceInCents={game.priceInCents} discountPercent={game.discountPercent} />
            )}
            {renderMainAction()}
          </div>
        </div>
      </div>
    </article>
  );
}
