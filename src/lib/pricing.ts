import type { Game } from "@/types/game";

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

export function calculateDiscountedPriceInCents(
  priceInCents: number,
  discountPercent: number,
): number {
  return Math.round((priceInCents * (100 - discountPercent)) / 100);
}

export function formatPriceInCents(priceInCents: number): string {
  return currencyFormatter.format(priceInCents / 100);
}

export interface PriceTotals {
  fullPriceInCents: number;
  discountInCents: number;
  totalInCents: number;
}

// O desconto é a diferença entre os totais. Somar o desconto de cada jogo
// poderia errar um centavo por causa dos arredondamentos.
export function calculatePriceTotals(
  games: Pick<Game, "priceInCents" | "discountPercent">[],
): PriceTotals {
  let fullPriceInCents = 0;
  let totalInCents = 0;
  for (const game of games) {
    fullPriceInCents += game.priceInCents;
    totalInCents += calculateDiscountedPriceInCents(game.priceInCents, game.discountPercent);
  }
  return { fullPriceInCents, discountInCents: fullPriceInCents - totalInCents, totalInCents };
}
