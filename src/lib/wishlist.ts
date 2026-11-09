import { getCurrentPriceInCents, isWithinPriceLimit, type PriceLimit } from "@/lib/pricing";
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
  | "recently-added";

export const WISHLIST_SORT_OPTIONS: { value: WishlistSortOrder; label: string }[] = [
  { value: "custom", label: "Posição personalizada" },
  { value: "name", label: "Nome (A a Z)" },
  { value: "lowest-price", label: "Menor preço" },
  { value: "biggest-discount", label: "Maior desconto" },
  { value: "recently-added", label: "Adicionados recentemente" },
];

export interface WishlistFilters {
  searchTerm: string;
  onlyDiscounted: boolean;
  priceLimit: PriceLimit;
}

export const DEFAULT_WISHLIST_FILTERS: WishlistFilters = {
  searchTerm: "",
  onlyDiscounted: false,
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

export function filterWishlistItems(items: WishlistItem[], filters: WishlistFilters): WishlistItem[] {
  return items.filter(
    ({ game }) =>
      matchesSearchTerm(game, filters.searchTerm) &&
      (!filters.onlyDiscounted || game.discountPercent > 0) &&
      isWithinPriceLimit(game, filters.priceLimit),
  );
}

/** Quantos filtros do painel estão ligados. A busca fica de fora, porque tem o próprio campo. */
export function countActiveFilters(filters: WishlistFilters): number {
  return [filters.onlyDiscounted, filters.priceLimit !== "any"].filter(Boolean).length;
}

export function hasActiveSearchOrFilters(filters: WishlistFilters): boolean {
  return normalizeForSearch(filters.searchTerm) !== "" || countActiveFilters(filters) > 0;
}

type WishlistComparator = (firstItem: WishlistItem, secondItem: WishlistItem) => number;

const titleCollator = new Intl.Collator("pt-BR");

const WISHLIST_COMPARATORS: Record<WishlistSortOrder, WishlistComparator> = {
  custom: (firstItem, secondItem) => firstItem.position - secondItem.position,
  name: (firstItem, secondItem) => titleCollator.compare(firstItem.game.title, secondItem.game.title),
  // Jogo sem preço vale "infinito" e vai para o fim; dois sem preço empatam.
  "lowest-price": (firstItem, secondItem) =>
    getCurrentPriceInCents(firstItem.game) - getCurrentPriceInCents(secondItem.game) || 0,
  "biggest-discount": (firstItem, secondItem) =>
    secondItem.game.discountPercent - firstItem.game.discountPercent,
  "recently-added": (firstItem, secondItem) => secondItem.addedAt.localeCompare(firstItem.addedAt),
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
