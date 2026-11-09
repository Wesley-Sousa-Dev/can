import { getCurrentPriceInCents, isWithinPriceLimit, type PriceLimit } from "@/lib/pricing";
import { normalizeForSearch } from "@/lib/text";
import type { GameListing, GameShowcase, Genre, GenreId } from "@/types/game";

// Regras da busca da loja, das listas da página de gênero e das vitrines da
// página inicial. São funções puras sobre a lista que a API já entregou
// (GET /games): a API traz os jogos, e a ordem, os filtros e as abas são decididos aqui.
//
// A ordem em que a API devolve os jogos é a "recomendada": a CheapShark já
// ordena as ofertas pela qualidade (DealRating). Por isso as ordenações abaixo
// usam sort estável, que mantém essa ordem entre os empates.

// ---------- Busca ----------

/** Quanto mais alto, mais o jogo combina com a busca. Zero: não combina. */
function getSearchRelevance(game: GameListing, searchTerm: string): number {
  const normalizedSearchTerm = normalizeForSearch(searchTerm);
  if (!normalizedSearchTerm) {
    return 1;
  }
  const normalizedTitle = normalizeForSearch(game.title);
  if (normalizedTitle.startsWith(normalizedSearchTerm)) {
    return 4;
  }
  if (normalizedTitle.split(/\s+/).some((word) => word.startsWith(normalizedSearchTerm))) {
    return 3;
  }
  if (normalizedTitle.includes(normalizedSearchTerm)) {
    return 2;
  }
  const otherTexts = [...game.tags, ...game.genres.map((genre) => genre.name), game.developer];
  return otherTexts.some((text) => normalizeForSearch(text).includes(normalizedSearchTerm)) ? 1 : 0;
}

/** O nome vale mais que marcador, gênero ou estúdio; no empate, fica a ordem recomendada. */
function sortByRelevance<TGame extends GameListing>(games: TGame[], searchTerm: string): TGame[] {
  return games
    .map((game) => ({ game, relevance: getSearchRelevance(game, searchTerm) }))
    .sort((firstMatch, secondMatch) => secondMatch.relevance - firstMatch.relevance)
    .map(({ game }) => game);
}

/** Sugestões da barra de busca: aparecem a partir de 2 letras. */
export const MINIMUM_SUGGESTION_LENGTH = 2;

// ---------- Filtros ----------

export interface CatalogFilters {
  searchTerm: string;
  priceLimit: PriceLimit;
  onlyDiscounted: boolean;
  /** O jogo precisa ter todos os gêneros marcados. */
  genreIds: GenreId[];
}

export const DEFAULT_CATALOG_FILTERS: CatalogFilters = {
  searchTerm: "",
  priceLimit: "any",
  onlyDiscounted: false,
  genreIds: [],
};

/** Só filtra: a ordem que chega é mantida, para não desfazer a aba ou a ordenação escolhida. */
export function filterCatalog<TGame extends GameListing>(games: TGame[], filters: CatalogFilters): TGame[] {
  return games.filter(
    (game) =>
      getSearchRelevance(game, filters.searchTerm) > 0 &&
      isWithinPriceLimit(game, filters.priceLimit) &&
      (!filters.onlyDiscounted || game.discountPercent > 0) &&
      filters.genreIds.every((genreId) => game.genres.some((genre) => genre.id === genreId)),
  );
}

/** Quantos filtros do painel estão ligados. A busca fica de fora, porque tem o próprio campo. */
export function countActiveCatalogFilters(filters: CatalogFilters): number {
  return (
    (filters.priceLimit !== "any" ? 1 : 0) + (filters.onlyDiscounted ? 1 : 0) + filters.genreIds.length
  );
}

export interface GenreCount {
  genre: Genre;
  count: number;
}

const nameCollator = new Intl.Collator("pt-BR");

/** Gêneros presentes na lista, com quantos jogos cada um tem, como no painel da Steam. */
export function countGamesByGenre(games: GameListing[], ignoredGenreId?: GenreId): GenreCount[] {
  const countsByGenreId = new Map<GenreId, GenreCount>();
  for (const game of games) {
    for (const genre of game.genres) {
      if (genre.id === ignoredGenreId) {
        continue;
      }
      const genreCount = countsByGenreId.get(genre.id) ?? { genre, count: 0 };
      genreCount.count += 1;
      countsByGenreId.set(genre.id, genreCount);
    }
  }
  return [...countsByGenreId.values()].sort(
    (firstCount, secondCount) =>
      secondCount.count - firstCount.count || nameCollator.compare(firstCount.genre.name, secondCount.genre.name),
  );
}

// ---------- Ordenação ----------

export type CatalogSortOrder = "relevance" | "biggest-discount" | "lowest-price" | "name";

export const CATALOG_SORT_OPTIONS: { value: CatalogSortOrder; label: string }[] = [
  { value: "relevance", label: "Relevância" },
  { value: "biggest-discount", label: "Maior desconto" },
  { value: "lowest-price", label: "Menor preço" },
  { value: "name", label: "Nome (A a Z)" },
];

type GameComparator = (firstGame: GameListing, secondGame: GameListing) => number;

const GAME_COMPARATORS: Record<Exclude<CatalogSortOrder, "relevance">, GameComparator> = {
  "biggest-discount": (firstGame, secondGame) => secondGame.discountPercent - firstGame.discountPercent,
  // Jogo sem preço vale "infinito" e vai para o fim; dois sem preço empatam.
  "lowest-price": (firstGame, secondGame) =>
    getCurrentPriceInCents(firstGame) - getCurrentPriceInCents(secondGame) || 0,
  name: (firstGame, secondGame) => nameCollator.compare(firstGame.title, secondGame.title),
};

/** A relevância depende do que foi buscado; as outras ordens, só dos jogos. */
export function sortCatalog<TGame extends GameListing>(
  games: TGame[],
  sortOrder: CatalogSortOrder,
  searchTerm = "",
): TGame[] {
  if (sortOrder === "relevance") {
    return sortByRelevance(games, searchTerm);
  }
  return [...games].sort(GAME_COMPARATORS[sortOrder]);
}

// ---------- Abas da página de gênero ----------

export type GenreViewId = "all" | "biggest-discount" | "lowest-price";

export const GENRE_VIEWS: { id: GenreViewId; label: string }[] = [
  { id: "all", label: "Tudo" },
  { id: "biggest-discount", label: "Maiores descontos" },
  { id: "lowest-price", label: "Menor preço" },
];

/** Cada aba é a lista do gênero em uma ordem, como as da Steam. "Tudo" é a ordem recomendada. */
export function applyGenreView<TGame extends GameListing>(games: TGame[], viewId: GenreViewId): TGame[] {
  return viewId === "all" ? games : sortCatalog(games, viewId);
}

const POPULAR_TITLE_COUNT = 5;

/** Títulos populares: as 5 primeiras ofertas recomendadas do gênero (2 grandes e 3 menores). */
export function getPopularTitles<TGame extends GameListing>(games: TGame[]): TGame[] {
  return games.slice(0, POPULAR_TITLE_COUNT);
}

// ---------- Vitrines da página inicial ----------

const FEATURED_GAME_COUNT = 5;
const SPECIAL_OFFER_COUNT = 8;
const CATALOG_TAB_GAME_COUNT = 6;
const BUDGET_PRICE_IN_CENTS = 2000;
const MID_RANGE_PRICE_IN_CENTS = 5000;

/** Destaques: as primeiras ofertas recomendadas que têm capturas de tela para o carrossel. */
export function selectFeaturedGames<TGame extends GameShowcase>(games: TGame[]): TGame[] {
  return games.filter((game) => game.screenshotUrls.length > 0).slice(0, FEATURED_GAME_COUNT);
}

function excludeGames<TGame extends GameListing>(games: TGame[], excludedGames: TGame[]): TGame[] {
  const excludedGameIds = new Set(excludedGames.map((game) => game.id));
  return games.filter((game) => !excludedGameIds.has(game.id));
}

/** Ofertas especiais: os maiores descontos, sem repetir os destaques de cima. */
export function selectSpecialOffers<TGame extends GameShowcase>(games: TGame[], featuredGames: TGame[]): TGame[] {
  return sortCatalog(
    excludeGames(games, featuredGames).filter((game) => game.discountPercent > 0),
    "biggest-discount",
  ).slice(0, SPECIAL_OFFER_COUNT);
}

/** Recomendados: as ofertas seguintes da lista da API, depois dos destaques. */
export function selectRecommendedGames<TGame extends GameListing>(games: TGame[], featuredGames: TGame[]): TGame[] {
  return excludeGames(games, featuredGames).slice(0, CATALOG_TAB_GAME_COUNT);
}

/** Jogos até R$ 20, dos mais baratos para os mais caros. */
export function selectBudgetGames<TGame extends GameListing>(games: TGame[]): TGame[] {
  return sortCatalog(
    games.filter((game) => getCurrentPriceInCents(game) <= BUDGET_PRICE_IN_CENTS),
    "lowest-price",
  ).slice(0, CATALOG_TAB_GAME_COUNT);
}

/** Jogos acima de R$ 20 e até R$ 50, na ordem recomendada. */
export function selectMidRangeGames<TGame extends GameListing>(games: TGame[]): TGame[] {
  return games
    .filter((game) => {
      const currentPriceInCents = getCurrentPriceInCents(game);
      return currentPriceInCents > BUDGET_PRICE_IN_CENTS && currentPriceInCents <= MID_RANGE_PRICE_IN_CENTS;
    })
    .slice(0, CATALOG_TAB_GAME_COUNT);
}

// ---------- Jogos parecidos ----------

const SIMILAR_GAME_COUNT = 4;

function countSharedGenres(firstGame: GameListing, secondGame: GameListing): number {
  const secondGameGenreIds = new Set(secondGame.genres.map((genre) => genre.id));
  return firstGame.genres.filter((genre) => secondGameGenreIds.has(genre.id)).length;
}

/** Jogos com mais gêneros em comum aparecem primeiro; no empate, fica a ordem recomendada. */
export function selectSimilarGames<TGame extends GameListing>(game: GameListing, games: TGame[]): TGame[] {
  return games
    .filter((candidate) => candidate.id !== game.id && countSharedGenres(game, candidate) > 0)
    .sort((firstGame, secondGame) => countSharedGenres(game, secondGame) - countSharedGenres(game, firstGame))
    .slice(0, SIMILAR_GAME_COUNT);
}
