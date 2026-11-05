import Link from "next/link";

import { GameCard } from "@/components/game/GameCard";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { formatGameCount } from "@/lib/text";
import type { Game } from "@/types/game";

interface GameShelfProps {
  headingId: string;
  title: string;
  games: Game[];
  emptyMessage: string;
}

export function GameShelf({ headingId, title, games, emptyMessage }: GameShelfProps) {
  return (
    <section aria-labelledby={headingId}>
      <SectionHeader headingId={headingId} title={title} description={formatGameCount(games.length)} />
      {games.length === 0 ? (
        // Estado vazio com um próximo passo, em vez de uma área em branco.
        <div className="flex flex-col items-start gap-3 rounded-lg border border-dashed border-border-input p-6">
          <p className="text-medium text-subtitle">{emptyMessage}</p>
          <Link
            href="/"
            className="inline-flex min-h-11 items-center rounded-md bg-primary px-4 text-medium font-medium text-title transition-colors hover:bg-primary-hover"
          >
            Explorar a loja
          </Link>
        </div>
      ) : (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {games.map((game) => (
            <li key={game.id}>
              <GameCard game={game} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
