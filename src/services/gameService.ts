import { GENRES } from "@/data/genres";
import { ApiError, CATALOG_CACHE_SECONDS, requestApi } from "@/services/apiClient";
import { toGameDetails, toGameShowcase } from "@/services/gameMapper";
import type { ApiGame, ApiGameDetails } from "@/types/api";
import type { GameDetails, GameShowcase, Genre, GenreId } from "@/types/game";

// Camada de negócio do catálogo: cada função corresponde a uma rota de jogos
// da Can Games API, que reúne as ofertas da CheapShark e os dados da Steam.
//   getStoreCatalog          → GET /games?limit=60 (jogos em promoção)
//   getGameShowcasesByGenre  → GET /games?genre=:id
//   searchStoreCatalog       → GET /games?search=:termo
//   getGameDetails           → GET /games/:id

/** O máximo que a API devolve por página. */
const CATALOG_PAGE_SIZE = 60;
const SUGGESTION_COUNT = 5;

async function fetchGameList(query: Record<string, string>): Promise<GameShowcase[]> {
  const apiGames = await requestApi<ApiGame[]>(`/games?${new URLSearchParams(query)}`, {
    cacheSeconds: CATALOG_CACHE_SECONDS,
  });
  // Sem o id da Steam, a página do jogo não teria como buscá-lo depois.
  // A mesma oferta pode vir duas vezes; fica a primeira.
  const seenGameIds = new Set<string>();
  return apiGames.flatMap((apiGame) => {
    if (!apiGame.steamAppId || seenGameIds.has(apiGame.id)) {
      return [];
    }
    seenGameIds.add(apiGame.id);
    return [toGameShowcase(apiGame)];
  });
}

/** Vitrine da loja: as melhores ofertas do momento, na ordem de relevância da CheapShark. */
export async function getStoreCatalog(): Promise<GameShowcase[]> {
  return fetchGameList({ limit: String(CATALOG_PAGE_SIZE) });
}

export async function getGameShowcasesByGenre(genreId: GenreId): Promise<GameShowcase[]> {
  return fetchGameList({ genre: genreId, limit: String(CATALOG_PAGE_SIZE) });
}

/** A busca inclui jogos sem promoção, porque quem procura um nome quer achá-lo pelo preço que for. */
export async function searchStoreCatalog(searchTerm: string): Promise<GameShowcase[]> {
  const trimmedSearchTerm = searchTerm.trim();
  if (!trimmedSearchTerm) {
    return getStoreCatalog();
  }
  return fetchGameList({ search: trimmedSearchTerm, onSale: "false", limit: String(CATALOG_PAGE_SIZE) });
}

/** Sugestões da barra de busca (chamada pelo navegador enquanto a pessoa digita). */
export async function suggestStoreGames(searchTerm: string): Promise<GameShowcase[]> {
  return fetchGameList({ search: searchTerm.trim(), onSale: "false", limit: String(SUGGESTION_COUNT) });
}

/** Devolve null quando o jogo não existe, para a página mostrar o 404. */
export async function getGameDetails(gameId: string): Promise<GameDetails | null> {
  // Ids da Steam são só números; qualquer outra coisa nem chega à API.
  if (!/^\d+$/.test(gameId)) {
    return null;
  }
  try {
    const apiGame = await requestApi<ApiGameDetails>(`/games/${gameId}`, { cacheSeconds: CATALOG_CACHE_SECONDS });
    return toGameDetails(apiGame);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return null;
    }
    throw error;
  }
}

// No navegador, cada jogo é buscado uma vez só por visita: o carrinho, a lista
// de desejos e a biblioteca costumam repetir os mesmos jogos.
const gameRequestsById = new Map<string, Promise<GameShowcase | null>>();

function getCachedGameDetails(gameId: string): Promise<GameShowcase | null> {
  let gameRequest = gameRequestsById.get(gameId);
  if (!gameRequest) {
    gameRequest = getGameDetails(gameId);
    // Uma falha de rede não fica guardada: a próxima tentativa pede de novo.
    gameRequest.catch(() => gameRequestsById.delete(gameId));
    gameRequestsById.set(gameId, gameRequest);
  }
  return gameRequest;
}

/** Jogos das coleções do usuário, na mesma ordem dos ids. Ids que a loja não acha ficam de fora. */
export async function getGamesByIds(gameIds: readonly string[]): Promise<GameShowcase[]> {
  const games = await Promise.all(gameIds.map(getCachedGameDetails));
  return games.filter((game) => game !== null);
}

export async function getGenres(): Promise<Genre[]> {
  return Object.values(GENRES);
}

// Devolve null quando o gênero não existe, para a página mostrar o 404.
export async function getGenreById(genreId: string): Promise<Genre | null> {
  return Object.values(GENRES).find((genre) => genre.id === genreId) ?? null;
}
