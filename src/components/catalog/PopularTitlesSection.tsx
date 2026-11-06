import { GameCapsule } from "@/components/game/GameCapsule";
import { SectionHeader } from "@/components/ui/SectionHeader";
import type { GameShowcase } from "@/types/game";

interface PopularTitlesSectionProps {
  games: GameShowcase[];
}

const HEADING_ID = "popular-titles-heading";
const LARGE_CAPSULE_COUNT = 2;

// "Títulos populares" da página de gênero: os dois primeiros em destaque, como na Steam.
export function PopularTitlesSection({ games }: PopularTitlesSectionProps) {
  return (
    <section aria-labelledby={HEADING_ID}>
      <SectionHeader headingId={HEADING_ID} title="Títulos populares" />
      <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-6">
        {games.map((game, index) => {
          const isLarge = index < LARGE_CAPSULE_COUNT;
          return (
            <li key={game.id} className={isLarge ? "lg:col-span-3" : "lg:col-span-2"}>
              <GameCapsule game={game} size={isLarge ? "large" : "medium"} />
            </li>
          );
        })}
      </ul>
    </section>
  );
}
