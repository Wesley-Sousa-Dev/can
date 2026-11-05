import { GameCard } from "@/components/game/GameCard";
import { SectionHeader } from "@/components/ui/SectionHeader";
import type { Game } from "@/types/game";

interface SimilarGamesSectionProps {
  games: Game[];
}

const HEADING_ID = "similar-games-heading";

export function SimilarGamesSection({ games }: SimilarGamesSectionProps) {
  return (
    <section aria-labelledby={HEADING_ID}>
      <SectionHeader
        headingId={HEADING_ID}
        title="Jogos parecidos"
        description="Outros jogos com gêneros em comum."
      />
      <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {games.map((game) => (
          <li key={game.id}>
            <GameCard game={game} />
          </li>
        ))}
      </ul>
    </section>
  );
}
