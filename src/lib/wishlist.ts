import { isGameReleased } from "@/lib/gameAvailability";
import { calculateDiscountedPriceInCents, formatPriceInCents } from "@/lib/pricing";
import { normalizeForSearch } from "@/lib/text";
import type { GameCollectionEntry } from "@/types/collection";
import type { GameListing } from "@/types/game";

// Regras da lista de desejos: montar os itens, buscar, filtrar e ordenar.
// São funções puras, então continuam iguais quando os dados vierem da API.

export interface WishlistItem {
  game: GameListing;
  addedAt: string;
  /** Posição escolhida pela pessoa, começando em 1. */
  position: number;
}

export type WishlistSortOrder =
  | "custom"
  | "name"
  | "lowest-price"
  | "biggest-discount"
  | "recently-added"
  | "newest-release"
  | "best-reviews";

export const WISHLIST_SORT_OPTIONS: { value: WishlistSortOrder; label: string }[] = [
  { value: "custom", label: "Posição personalizada" },
  { value: "name", label: "Nome (A a Z)" },
  { value: "lowest-price", label: "Menor preço" },
  { value: "biggest-discount", label: "Maior desconto" },
  { value: "recently-added", label: "Adicionados recentemente" },
  { value: "newest-release", label: "Lançamento mais recente" },
  { value: "best-reviews", label: "Melhores análises" },
];

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

export interface WishlistFilters {
  searchTerm: string;
  onlyDiscounted: boolean;
  onlyReleased: boolean;
  priceLimit: PriceLimit;
}

export const DEFAULT_WISHLIST_FILTERS: WishlistFilters = {
  searchTerm: "",
  onlyDiscounted: false,
  onlyReleased: false,
  priceLimit: "any",
};

// Jogos que saíram do catálogo ficam de fora, e as posições continuam em sequência.
export function buildWishlistItems(
  entries: readonly GameCollectionEntry[],
  games: GameListing[],
): WishlistItem[] {
  const gamesById = new Map(games.map((game) => [game.id, game]));
  const items: WishlistItem[] = [];
  for (const entry of entries) {
    const game = gamesById.get(entry.gameId);
    if (game) {
      items.push({ game, addedAt: entry.addedAt, position: items.length + 1 });
    }
  }
  return items;
}

// A busca olha o nome, os marcadores e os gêneros, como a da Steam.
function matchesSearchTerm(game: GameListing, searchTerm: string): boolean {
  const normalizedSearchTerm = normalizeForSearch(searchTerm);
  if (!normalizedSearchTerm) {
    return true;
  }
  const searchableTexts = [game.title, ...game.tags, ...game.genres.map((genre) => genre.name)];
  return searchableTexts.some((text) => normalizeForSearch(text).includes(normalizedSearchTerm));
}

function getCurrentPriceInCents(game: GameListing): number {
  return calculateDiscountedPriceInCents(game.priceInCents, game.discountPercent);
}

export function filterWishlistItems(
  items: WishlistItem[],
  filters: WishlistFilters,
  referenceDate: Date = new Date(),
): WishlistItem[] {
  const maxPriceInCents = MAX_PRICE_IN_CENTS[filters.priceLimit];
  return items.filter(
    ({ game }) =>
      matchesSearchTerm(game, filters.searchTerm) &&
      (!filters.onlyDiscounted || game.discountPercent > 0) &&
      (!filters.onlyReleased || isGameReleased(game, referenceDate)) &&
      (maxPriceInCents === null || getCurrentPriceInCents(game) <= maxPriceInCents),
  );
}

/** Quantos filtros do painel estão ligados. A busca fica de fora, porque tem o próprio campo. */
export function countActiveFilters(filters: WishlistFilters): number {
  return [filters.onlyDiscounted, filters.onlyReleased, filters.priceLimit !== "any"].filter(Boolean)
    .length;
}

export function hasActiveSearchOrFilters(filters: WishlistFilters): boolean {
  return normalizeForSearch(filters.searchTerm) !== "" || countActiveFilters(filters) > 0;
}

type WishlistComparator = (firstItem: WishlistItem, secondItem: WishlistItem) => number;

const titleCollator = new Intl.Collator("pt-BR");

// Jogos sem análises (ainda não lançados) recebem -1 e vão para o fim.
function getPositivePercent(item: WishlistItem): number {
  return item.game.reviewSummary?.positivePercent ?? -1;
}

const WISHLIST_COMPARATORS: Record<WishlistSortOrder, WishlistComparator> = {
  custom: (firstItem, secondItem) => firstItem.position - secondItem.position,
  name: (firstItem, secondItem) => titleCollator.compare(firstItem.game.title, secondItem.game.title),
  "lowest-price": (firstItem, secondItem) =>
    getCurrentPriceInCents(firstItem.game) - getCurrentPriceInCents(secondItem.game),
  "biggest-discount": (firstItem, secondItem) =>
    secondItem.game.discountPercent - firstItem.game.discountPercent,
  "recently-added": (firstItem, secondItem) => secondItem.addedAt.localeCompare(firstItem.addedAt),
  "newest-release": (firstItem, secondItem) =>
    secondItem.game.releaseDate.localeCompare(firstItem.game.releaseDate),
  "best-reviews": (firstItem, secondItem) => getPositivePercent(secondItem) - getPositivePercent(firstItem),
};

// Nos empates vale a posição personalizada, para a ordem nunca ficar aleatória.
export function sortWishlistItems(items: WishlistItem[], sortOrder: WishlistSortOrder): WishlistItem[] {
  const compare = WISHLIST_COMPARATORS[sortOrder];
  return [...items].sort(
    (firstItem, secondItem) =>
      compare(firstItem, secondItem) || firstItem.position - secondItem.position,
  );
}

export function getSortOptionLabel(sortOrder: WishlistSortOrder): string {
  return WISHLIST_SORT_OPTIONS.find((option) => option.value === sortOrder)?.label ?? "";
}
