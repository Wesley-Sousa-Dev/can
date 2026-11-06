import { MOCK_GAME_DETAILS } from "@/data/gameDetails";
import { MOCK_GAMES } from "@/data/games";
import { GENRES } from "@/data/genres";
import { isFreeGame, isGameReleased } from "@/lib/gameAvailability";
import type { Game, GameDetails, GameListing, GameShowcase, Genre, GenreId } from "@/types/game";

// Camada de negócio: decide quais jogos aparecem em cada vitrine da loja.
// Os componentes só chamam estas funções e nunca leem os dados diretamente.

const DEFAULT_LIST_SIZE = 6;
const SPECIAL_OFFERS_LIST_SIZE = 8;

async function fetchAllGames(): Promise<Game[]> {
  // Quando a API ficar pronta, basta trocar o mock por uma requisição GET aqui.
  return MOCK_GAMES;
}

function compareByNewestRelease(firstGame: Game, secondGame: Game): number {
  return secondGame.releaseDate.localeCompare(firstGame.releaseDate);
}

export async function getAllGames(): Promise<Game[]> {
  return fetchAllGames();
}

// Todos os jogos com marcadores e análises, para a lista de desejos.
export async function getGameListings(): Promise<GameListing[]> {
  // Com a API, vira um GET /games que já traga "tags" e "reviewSummary".
  const games = await fetchAllGames();
  return games.map((game) => {
    const details = MOCK_GAME_DETAILS[game.slug];
    return {
      ...game,
      tags: details?.tags ?? [],
      reviewSummary: details?.reviewSummary ?? null,
    };
  });
}

// Jogos com distribuidora e capturas de tela, para as páginas de gênero e de busca.
export async function getGameShowcases(): Promise<GameShowcase[]> {
  // Com a API, vira um GET /games que já traga esses campos.
  const games = await fetchAllGames();
  return games.flatMap((game) => {
    const details = MOCK_GAME_DETAILS[game.slug];
    if (!details) {
      return [];
    }
    return [
      {
        ...game,
        tags: details.tags,
        reviewSummary: details.reviewSummary,
        publisher: details.publisher,
        screenshotUrls: details.screenshotUrls,
      },
    ];
  });
}

// Jogos de um gênero, dos mais vendidos para os menos (equivale a GET /games?genre=:id).
export async function getGameShowcasesByGenre(genreId: GenreId): Promise<GameShowcase[]> {
  const games = await getGameShowcases();
  return games
    .filter((game) => game.genres.some((genre) => genre.id === genreId))
    .sort((firstGame, secondGame) => secondGame.unitsSold - firstGame.unitsSold);
}

// Devolve null quando o gênero não existe, para a página mostrar o 404.
export async function getGenreById(genreId: string): Promise<Genre | null> {
  return Object.values(GENRES).find((genre) => genre.id === genreId) ?? null;
}

export async function getFeaturedGames(): Promise<Game[]> {
  const games = await fetchAllGames();
  return games.filter((game) => game.isFeatured);
}

// Vem com capturas de tela e marcadores porque a cápsula da oferta cresce e os mostra.
export async function getSpecialOffers(
  limit = SPECIAL_OFFERS_LIST_SIZE,
): Promise<GameShowcase[]> {
  const games = await getGameShowcases();
  return games
    .filter((game) => game.discountPercent > 0)
    .sort((firstGame, secondGame) => secondGame.discountPercent - firstGame.discountPercent)
    .slice(0, limit);
}

export async function getNewReleases(limit = DEFAULT_LIST_SIZE): Promise<Game[]> {
  const games = await fetchAllGames();
  const today = new Date();
  return games
    .filter((game) => isGameReleased(game, today))
    .sort(compareByNewestRelease)
    .slice(0, limit);
}

// Jogos gratuitos ficam de fora porque "mais vendidos" mede vendas pagas.
export async function getTopSellers(limit = DEFAULT_LIST_SIZE): Promise<Game[]> {
  const games = await fetchAllGames();
  return games
    .filter((game) => !isFreeGame(game))
    .sort((firstGame, secondGame) => secondGame.unitsSold - firstGame.unitsSold)
    .slice(0, limit);
}

export async function getUpcomingGames(limit = DEFAULT_LIST_SIZE): Promise<Game[]> {
  const games = await fetchAllGames();
  const today = new Date();
  return games
    .filter((game) => !isGameReleased(game, today))
    .sort((firstGame, secondGame) => firstGame.releaseDate.localeCompare(secondGame.releaseDate))
    .slice(0, limit);
}

export async function getFreeToPlayGames(limit = DEFAULT_LIST_SIZE): Promise<Game[]> {
  const games = await fetchAllGames();
  return games
    .filter((game) => isFreeGame(game) && isGameReleased(game))
    .sort((firstGame, secondGame) => secondGame.unitsSold - firstGame.unitsSold)
    .slice(0, limit);
}

export async function getGenres(): Promise<Genre[]> {
  return Object.values(GENRES);
}

export async function getAllGameSlugs(): Promise<string[]> {
  const games = await fetchAllGames();
  return games.map((game) => game.slug);
}

// Devolve null quando o jogo não existe, para a página mostrar o 404.
export async function getGameBySlug(slug: string): Promise<GameDetails | null> {
  // Quando a API ficar pronta, esta função vira um GET /games/:slug.
  const games = await fetchAllGames();
  const game = games.find((candidate) => candidate.slug === slug);
  const details = MOCK_GAME_DETAILS[slug];
  if (!game || !details) {
    return null;
  }
  return { ...game, ...details };
}

function countSharedGenres(firstGame: Game, secondGame: Game): number {
  const secondGameGenreIds = new Set(secondGame.genres.map((genre) => genre.id));
  return firstGame.genres.filter((genre) => secondGameGenreIds.has(genre.id)).length;
}

// Jogos com mais gêneros em comum aparecem primeiro; o empate fica com o mais vendido.
export async function getSimilarGames(game: Game, limit = 4): Promise<Game[]> {
  const games = await fetchAllGames();
  return games
    .filter((candidate) => candidate.id !== game.id && countSharedGenres(game, candidate) > 0)
    .sort(
      (firstGame, secondGame) =>
        countSharedGenres(game, secondGame) - countSharedGenres(game, firstGame) ||
        secondGame.unitsSold - firstGame.unitsSold,
    )
    .slice(0, limit);
}
