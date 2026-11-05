import { normalizeForSearch } from "@/lib/text";
import type { GameCollectionEntry } from "@/types/collection";
import type { Game, Genre, GenreId } from "@/types/game";

// Regras da biblioteca: montar os itens, buscar, filtrar por gênero e ordenar.
// São funções puras, então continuam iguais quando os dados vierem da API.

export interface LibraryItem {
  game: Game;
  addedAt: string;
  /** Nulo enquanto o jogo nunca foi aberto. */
  lastPlayedAt: string | null;
}

export type LibrarySortOrder = "recent-activity" | "name" | "recently-added" | "newest-release";

export const LIBRARY_SORT_OPTIONS: { value: LibrarySortOrder; label: string }[] = [
  { value: "recent-activity", label: "Atividade recente" },
  { value: "name", label: "Nome (A a Z)" },
  { value: "recently-added", label: "Adicionados recentemente" },
  { value: "newest-release", label: "Lançamento mais recente" },
];

export type LibraryGenreFilter = GenreId | "all";

export interface LibraryFilters {
  searchTerm: string;
  genreId: LibraryGenreFilter;
}

export const DEFAULT_LIBRARY_FILTERS: LibraryFilters = { searchTerm: "", genreId: "all" };

const titleCollator = new Intl.Collator("pt-BR");

// Jogos que saíram do catálogo ficam de fora.
export function buildLibraryItems(entries: readonly GameCollectionEntry[], games: Game[]): LibraryItem[] {
  const gamesById = new Map(games.map((game) => [game.id, game]));
  return entries.flatMap((entry) => {
    const game = gamesById.get(entry.gameId);
    return game ? [{ game, addedAt: entry.addedAt, lastPlayedAt: entry.lastPlayedAt ?? null }] : [];
  });
}

function matchesSearchTerm(game: Game, searchTerm: string): boolean {
  const normalizedSearchTerm = normalizeForSearch(searchTerm);
  if (!normalizedSearchTerm) {
    return true;
  }
  const searchableTexts = [game.title, ...game.genres.map((genre) => genre.name)];
  return searchableTexts.some((text) => normalizeForSearch(text).includes(normalizedSearchTerm));
}

export function filterLibraryItems(items: LibraryItem[], filters: LibraryFilters): LibraryItem[] {
  return items.filter(
    ({ game }) =>
      matchesSearchTerm(game, filters.searchTerm) &&
      (filters.genreId === "all" || game.genres.some((genre) => genre.id === filters.genreId)),
  );
}

export function hasActiveLibraryFilters(filters: LibraryFilters): boolean {
  return normalizeForSearch(filters.searchTerm) !== "" || filters.genreId !== "all";
}

/** Gêneros que aparecem na biblioteca, em ordem alfabética, para o filtro. */
export function listGenresInLibrary(items: LibraryItem[]): Genre[] {
  const genresById = new Map<GenreId, Genre>();
  for (const { game } of items) {
    for (const genre of game.genres) {
      genresById.set(genre.id, genre);
    }
  }
  return [...genresById.values()].sort((firstGenre, secondGenre) =>
    titleCollator.compare(firstGenre.name, secondGenre.name),
  );
}

// A atividade mais recente é a última vez que o jogo foi aberto ou, se nunca
// foi, o momento em que entrou na biblioteca. Assim, o jogo recém-comprado
// aparece no topo, como na Steam.
function getLastActivityAt(item: LibraryItem): string {
  return item.lastPlayedAt ?? item.addedAt;
}

type LibraryComparator = (firstItem: LibraryItem, secondItem: LibraryItem) => number;

const LIBRARY_COMPARATORS: Record<LibrarySortOrder, LibraryComparator> = {
  "recent-activity": (firstItem, secondItem) =>
    getLastActivityAt(secondItem).localeCompare(getLastActivityAt(firstItem)),
  name: () => 0,
  "recently-added": (firstItem, secondItem) => secondItem.addedAt.localeCompare(firstItem.addedAt),
  "newest-release": (firstItem, secondItem) =>
    secondItem.game.releaseDate.localeCompare(firstItem.game.releaseDate),
};

// Nos empates (e na ordem por nome) vale o título.
export function sortLibraryItems(items: LibraryItem[], sortOrder: LibrarySortOrder): LibraryItem[] {
  const compare = LIBRARY_COMPARATORS[sortOrder];
  return [...items].sort(
    (firstItem, secondItem) =>
      compare(firstItem, secondItem) || titleCollator.compare(firstItem.game.title, secondItem.game.title),
  );
}

const DAYS_A_GAME_STAYS_NEW = 7;
const MILLISECONDS_PER_DAY = 86_400_000;

/** Entrou na biblioteca na última semana e ainda não foi aberto. */
export function isNewInLibrary(item: LibraryItem, now: Date = new Date()): boolean {
  const daysSinceAdded = (now.getTime() - new Date(item.addedAt).getTime()) / MILLISECONDS_PER_DAY;
  return item.lastPlayedAt === null && daysSinceAdded < DAYS_A_GAME_STAYS_NEW;
}
