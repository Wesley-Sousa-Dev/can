import Link from "next/link";

import { GameCover } from "@/components/game/GameCover";
import { PriceTag } from "@/components/game/PriceTag";
import type { Game } from "@/types/game";

interface GameCardProps {
  game: Game;
}

export function GameCard({ game }: GameCardProps) {
  const genreNames = game.genres.map((genre) => genre.name).join(" · ");

  return (
    // O card inteiro é clicável: o ::after do link cobre o card todo.
    // Assim existe um único link por jogo, em vez de um na capa e outro no título.
    <article className="group relative flex h-full flex-col overflow-hidden rounded-lg bg-card shadow-soft transition-shadow hover:shadow-strong has-[a:focus-visible]:outline-2 has-[a:focus-visible]:outline-offset-2 has-[a:focus-visible]:outline-primary-focus">
      <GameCover
        imageUrl={game.coverImageUrl}
        sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
      />
      <div className="flex flex-1 flex-col gap-1 p-4">
        <h3 className="text-large font-medium">
          <Link
            href={`/games/${game.id}`}
            className="after:absolute after:inset-0 group-hover:text-primary-focus focus-visible:outline-none"
          >
            {game.title}
          </Link>
        </h3>
        <p className="text-small text-subtitle">{genreNames}</p>
        <PriceTag
          price={game}
          className="mt-auto self-end pt-3"
        />
      </div>
    </article>
  );
}
