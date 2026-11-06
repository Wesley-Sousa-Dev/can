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

/** Preço que a pessoa paga hoje, já com o desconto. */
export function getCurrentPriceInCents(game: Pick<Game, "priceInCents" | "discountPercent">): number {
  return calculateDiscountedPriceInCents(game.priceInCents, game.discountPercent);
}

export type PriceLimit = "any" | "free" | "up-to-20" | "up-to-50" | "up-to-100";

const MAX_PRICE_IN_CENTS: Record<PriceLimit, number | null> = {
  any: null,
  free: 0,
  "up-to-20": 2000,
  "up-to-50": 5000,
  "up-to-100": 10000,
};

export const PRICE_LIMIT_OPTIONS: { value: PriceLimit; label: string }[] = [
  { value: "any", label: "Qualquer preço" },
  { value: "free", label: "Só gratuitos" },
  { value: "up-to-20", label: `Até ${formatPriceInCents(2000)}` },
  { value: "up-to-50", label: `Até ${formatPriceInCents(5000)}` },
  { value: "up-to-100", label: `Até ${formatPriceInCents(10000)}` },
];

/** O filtro "Preço máximo" olha o preço com desconto, que é o que a pessoa paga. */
export function isWithinPriceLimit(
  game: Pick<Game, "priceInCents" | "discountPercent">,
  priceLimit: PriceLimit,
): boolean {
  const maxPriceInCents = MAX_PRICE_IN_CENTS[priceLimit];
  return maxPriceInCents === null || getCurrentPriceInCents(game) <= maxPriceInCents;
}
