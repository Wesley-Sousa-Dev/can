import type { Game } from "@/types/game";

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

export function formatPriceInCents(priceInCents: number): string {
  return currencyFormatter.format(priceInCents / 100);
}

type GamePrice = Pick<Game, "priceInCents" | "currentPriceInCents">;

/** Jogos sem preço em reais não podem ser comprados: a API recusaria o pedido. */
export function hasKnownPrice(game: GamePrice): boolean {
  return game.priceInCents !== null && game.currentPriceInCents !== null;
}

export interface PriceTotals {
  fullPriceInCents: number;
  discountInCents: number;
  totalInCents: number;
}

// O desconto é a diferença entre os totais, com os preços que a loja informou,
// para o total bater com o que a API cobra no pedido.
export function calculatePriceTotals(games: GamePrice[]): PriceTotals {
  let fullPriceInCents = 0;
  let totalInCents = 0;
  for (const game of games) {
    fullPriceInCents += game.priceInCents ?? 0;
    totalInCents += game.currentPriceInCents ?? 0;
  }
  return { fullPriceInCents, discountInCents: fullPriceInCents - totalInCents, totalInCents };
}

/** Preço que a pessoa paga hoje. Sem preço conhecido, vai para o fim de qualquer ordem por preço. */
export function getCurrentPriceInCents(game: GamePrice): number {
  return game.currentPriceInCents ?? Number.POSITIVE_INFINITY;
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
export function isWithinPriceLimit(game: GamePrice, priceLimit: PriceLimit): boolean {
  const maxPriceInCents = MAX_PRICE_IN_CENTS[priceLimit];
  return maxPriceInCents === null || getCurrentPriceInCents(game) <= maxPriceInCents;
}
