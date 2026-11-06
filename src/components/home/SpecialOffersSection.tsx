import { GameCapsule } from "@/components/game/GameCapsule";
import { SectionHeader } from "@/components/ui/SectionHeader";
import type { GameShowcase } from "@/types/game";

interface SpecialOffersSectionProps {
  games: GameShowcase[];
}

const HEADING_ID = "special-offers-heading";

// Ofertas da loja em cápsulas que crescem ao passar o mouse, como na Steam.
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
              <GameCapsule game={game} size="small" />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
