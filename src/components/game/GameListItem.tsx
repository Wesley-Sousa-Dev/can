import Link from "next/link";

import { GameCover } from "@/components/game/GameCover";
import { PriceTag } from "@/components/game/PriceTag";
import { formatReleaseDate } from "@/lib/dates";
import type { Game } from "@/types/game";

interface GameListItemProps {
  game: Game;
  showReleaseDate?: boolean;
}

export function GameListItem({ game, showReleaseDate = false }: GameListItemProps) {
  const genreNames = game.genres.map((genre) => genre.name).join(" · ");

  return (
    <article className="group relative flex items-center gap-4 rounded-lg border border-transparent bg-card p-2 pr-4 shadow-soft transition-colors hover:border-primary-focus has-[a:focus-visible]:outline-2 has-[a:focus-visible]:outline-offset-2 has-[a:focus-visible]:outline-primary-focus">
      <div className="w-28 shrink-0 overflow-hidden rounded-md sm:w-40">
        <GameCover imageUrl={game.coverImageUrl} sizes="160px" />
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <div className="min-w-0">
          <h3 className="text-medium font-medium">
            <Link
              href={`/games/${game.slug}`}
              className="after:absolute after:inset-0 group-hover:text-primary-focus focus-visible:outline-none"
            >
              {game.title}
            </Link>
          </h3>
          <p className="text-small text-subtitle">{genreNames}</p>
          {showReleaseDate && (
            <p className="text-small text-subtitle">
              Lançamento:{" "}
              <time dateTime={game.releaseDate}>
                {formatReleaseDate(game.releaseDate)}
              </time>
            </p>
          )}
        </div>
        <PriceTag
          priceInCents={game.priceInCents}
          discountPercent={game.discountPercent}
          className="shrink-0"
        />
      </div>
    </article>
  );
}
