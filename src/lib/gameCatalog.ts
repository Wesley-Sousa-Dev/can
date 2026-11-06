import { isGameReleased } from "@/lib/gameAvailability";
import { getCurrentPriceInCents, isWithinPriceLimit, type PriceLimit } from "@/lib/pricing";
import { normalizeForSearch } from "@/lib/text";
import type { GameListing, Genre, GenreId } from "@/types/game";

// Regras da busca da loja e das listas da página de gênero.
// São funções puras: com a API, a busca vira GET /games?search=, mas a
// interface continua chamando estas mesmas funções.

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

/** O nome vale mais que marcador, gênero ou estúdio; no empate, ganha o mais vendido. */
function sortByRelevance<TGame extends GameListing>(games: TGame[], searchTerm: string): TGame[] {
  return games
    .map((game) => ({ game, relevance: getSearchRelevance(game, searchTerm) }))
    .sort(
      (firstMatch, secondMatch) =>
        secondMatch.relevance - firstMatch.relevance || secondMatch.game.unitsSold - firstMatch.game.unitsSold,
    )
    .map(({ game }) => game);
}

export function searchGames<TGame extends GameListing>(games: TGame[], searchTerm: string): TGame[] {
  return sortByRelevance(
    games.filter((game) => getSearchRelevance(game, searchTerm) > 0),
    searchTerm,
  );
}

/** Sugestões da barra de busca: aparecem a partir de 2 letras, no máximo 5. */
export const MINIMUM_SUGGESTION_LENGTH = 2;
const MAXIMUM_SUGGESTIONS = 5;

export function suggestGames<TGame extends GameListing>(games: TGame[], searchTerm: string): TGame[] {
  if (normalizeForSearch(searchTerm).length < MINIMUM_SUGGESTION_LENGTH) {
    return [];
  }
  return searchGames(games, searchTerm).slice(0, MAXIMUM_SUGGESTIONS);
}

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

export type CatalogSortOrder = "relevance" | "top-sellers" | "newest" | "top-rated" | "lowest-price" | "name";

export const CATALOG_SORT_OPTIONS: { value: CatalogSortOrder; label: string }[] = [
  { value: "relevance", label: "Relevância" },
  { value: "top-sellers", label: "Mais vendidos" },
  { value: "newest", label: "Lançamento mais recente" },
  { value: "top-rated", label: "Mais bem avaliados" },
  { value: "lowest-price", label: "Menor preço" },
  { value: "name", label: "Nome (A a Z)" },
];

type GameComparator = (firstGame: GameListing, secondGame: GameListing) => number;

// Jogos sem análises (ainda não lançados) recebem -1 e vão para o fim.
function getPositivePercent(game: GameListing): number {
  return game.reviewSummary?.positivePercent ?? -1;
}

const GAME_COMPARATORS: Record<Exclude<CatalogSortOrder, "relevance">, GameComparator> = {
  "top-sellers": (firstGame, secondGame) => secondGame.unitsSold - firstGame.unitsSold,
  newest: (firstGame, secondGame) => secondGame.releaseDate.localeCompare(firstGame.releaseDate),
  "top-rated": (firstGame, secondGame) => getPositivePercent(secondGame) - getPositivePercent(firstGame),
  "lowest-price": (firstGame, secondGame) => getCurrentPriceInCents(firstGame) - getCurrentPriceInCents(secondGame),
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
  const compare = GAME_COMPARATORS[sortOrder];
  return [...games].sort(
    (firstGame, secondGame) => compare(firstGame, secondGame) || nameCollator.compare(firstGame.title, secondGame.title),
  );
}

// ---------- Abas da página de gênero ----------

export type GenreViewId = "all" | "top-sellers" | "newest" | "top-rated" | "upcoming";

export const GENRE_VIEWS: { id: GenreViewId; label: string }[] = [
  { id: "all", label: "Tudo" },
  { id: "top-sellers", label: "Mais vendidos" },
  { id: "newest", label: "Mais recentes" },
  { id: "top-rated", label: "Mais bem avaliados" },
  { id: "upcoming", label: "Futuros" },
];

/** Cada aba é um recorte com a própria ordem, como as da Steam. */
export function applyGenreView<TGame extends GameListing>(
  games: TGame[],
  viewId: GenreViewId,
  referenceDate: Date = new Date(),
): TGame[] {
  const releasedGames = games.filter((game) => isGameReleased(game, referenceDate));
  switch (viewId) {
    case "all":
      return sortCatalog(games, "top-sellers");
    case "top-sellers":
      return sortCatalog(releasedGames, "top-sellers");
    case "newest":
      return sortCatalog(releasedGames, "newest");
    case "top-rated":
      return sortCatalog(
        releasedGames.filter((game) => game.reviewSummary !== null),
        "top-rated",
      );
    case "upcoming":
      return games
        .filter((game) => !isGameReleased(game, referenceDate))
        .sort((firstGame, secondGame) => firstGame.releaseDate.localeCompare(secondGame.releaseDate));
  }
}

/** Títulos populares: os jogos já lançados mais vendidos, no máximo 5 (2 grandes e 3 menores). */
export function getPopularTitles<TGame extends GameListing>(
  games: TGame[],
  referenceDate: Date = new Date(),
): TGame[] {
  return applyGenreView(games, "top-sellers", referenceDate).slice(0, 5);
}
