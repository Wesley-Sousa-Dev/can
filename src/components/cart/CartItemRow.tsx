import { X } from "lucide-react";
import Link from "next/link";

import { GameCover } from "@/components/game/GameCover";
import { PriceTag } from "@/components/game/PriceTag";
import type { Game } from "@/types/game";

interface CartItemRowProps {
  game: Game;
  onRemove: () => void;
}

// Id usado pelo carrinho para devolver o foco depois de remover um jogo.
export function getCartTitleLinkId(gameId: string): string {
  return `cart-title-${gameId}`;
}

export function CartItemRow({ game, onRemove }: CartItemRowProps) {
  const gamePageUrl = `/games/${game.id}`;
  const genreNames = game.genres.map((genre) => genre.name).join(" · ");

  return (
    <article
      aria-labelledby={getCartTitleLinkId(game.id)}
      className="flex flex-col gap-3 rounded-lg bg-card p-3 shadow-soft sm:flex-row sm:gap-4 sm:p-4"
    >
      {/* A capa repete o link do título, então fica fora do teclado e do leitor de tela. */}
      <Link
        href={gamePageUrl}
        tabIndex={-1}
        aria-hidden="true"
        className="group block shrink-0 self-start overflow-hidden rounded-md max-sm:w-full sm:w-40"
      >
        <GameCover imageUrl={game.coverImageUrl} sizes="(min-width: 640px) 160px, 90vw" />
      </Link>

      <div className="flex min-w-0 flex-1 flex-col gap-3 sm:flex-row sm:justify-between">
        <div className="min-w-0">
          <h2 className="font-display text-x-large text-title">
            <Link
              id={getCartTitleLinkId(game.id)}
              href={gamePageUrl}
              className="underline-offset-4 hover:text-primary-focus hover:underline"
            >
              {game.title}
            </Link>
          </h2>
          <p className="text-small text-subtitle">{genreNames}</p>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 sm:flex-col sm:items-end sm:justify-start">
          <PriceTag price={game} />
          <button
            type="button"
            onClick={onRemove}
            className="inline-flex min-h-11 items-center gap-1 rounded-md px-2 text-small font-medium text-subtitle transition-colors hover:bg-panel hover:text-title"
          >
            <X aria-hidden="true" className="size-4 text-destructive" />
            Remover<span className="sr-only"> {game.title} do carrinho</span>
          </button>
        </div>
      </div>
    </article>
  );
}
