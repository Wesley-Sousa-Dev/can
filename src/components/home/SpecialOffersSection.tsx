import { GameCard } from "@/components/game/GameCard";
import { SectionHeader } from "@/components/ui/SectionHeader";
import type { Game } from "@/types/game";

interface SpecialOffersSectionProps {
  games: Game[];
}

const HEADING_ID = "special-offers-heading";

export function SpecialOffersSection({ games }: SpecialOffersSectionProps) {
  return (
    <section id="special-offers" aria-labelledby={HEADING_ID}>
      <SectionHeader
        headingId={HEADING_ID}
        title="Ofertas especiais"
        description="Os maiores descontos da semana."
      />

      {games.length === 0 ? (
        <p className="text-medium text-subtitle">Nenhuma oferta no momento.</p>
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
