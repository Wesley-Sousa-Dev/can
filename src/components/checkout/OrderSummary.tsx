import type { ReactNode } from "react";

import { calculateDiscountedPriceInCents, calculatePriceTotals, formatPriceInCents } from "@/lib/pricing";
import { formatGameCount } from "@/lib/text";
import type { Game } from "@/types/game";

interface OrderSummaryProps {
  headingId: string;
  games: Game[];
  /** Lista cada jogo com o preço. O carrinho não precisa, porque já mostra os jogos ao lado. */
  showGameList?: boolean;
  /** Botões e avisos que ficam embaixo do total. */
  children?: ReactNode;
}

// Caixa de totais, como a "Total estimado" do carrinho da Steam.
// Usada no carrinho e na página de pagamento.
export function OrderSummary({ headingId, games, showGameList = false, children }: OrderSummaryProps) {
  const { fullPriceInCents, discountInCents, totalInCents } = calculatePriceTotals(games);

  return (
    <section aria-labelledby={headingId} className="flex flex-col gap-4 rounded-lg bg-panel p-5 shadow-medium">
      <h2 id={headingId} className="font-display text-x-large text-title">
        Resumo do pedido
      </h2>

      {showGameList && (
        <ul className="flex flex-col gap-2 border-b border-border pb-4">
          {games.map((game) => (
            <li key={game.id} className="flex justify-between gap-4 text-small">
              <span className="text-title">{game.title}</span>
              <span className="shrink-0 text-subtitle">
                {formatPriceInCents(calculateDiscountedPriceInCents(game.priceInCents, game.discountPercent))}
              </span>
            </li>
          ))}
        </ul>
      )}

      <dl className="flex flex-col gap-2 text-medium">
        <div className="flex justify-between gap-4">
          <dt className="text-subtitle">Preço cheio ({formatGameCount(games.length)})</dt>
          <dd className="text-title">{formatPriceInCents(fullPriceInCents)}</dd>
        </div>
        {discountInCents > 0 && (
          <div className="flex justify-between gap-4">
            <dt className="text-subtitle">Descontos</dt>
            <dd className="text-title">−{formatPriceInCents(discountInCents)}</dd>
          </div>
        )}
        <div className="flex items-baseline justify-between gap-4 border-t border-border pt-3">
          <dt className="font-medium text-title">Total</dt>
          <dd className="text-large font-medium text-title">{formatPriceInCents(totalInCents)}</dd>
        </div>
      </dl>

      {children}
    </section>
  );
}
