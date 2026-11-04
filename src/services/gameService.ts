import { MOCK_GAMES } from "@/data/games";
import { GENRES } from "@/data/genres";
import type { Game, Genre } from "@/types/game";

// Camada de negócio: decide quais jogos aparecem em cada vitrine da loja.
// Os componentes só chamam estas funções e nunca leem os dados diretamente.

const DEFAULT_LIST_SIZE = 6;
const SPECIAL_OFFERS_LIST_SIZE = 8;

async function fetchAllGames(): Promise<Game[]> {
  // Quando a API ficar pronta, basta trocar o mock por uma requisição GET aqui.
  return MOCK_GAMES;
}

function isReleased(game: Game, referenceDate: Date): boolean {
  return new Date(game.releaseDate) <= referenceDate;
}

function isFree(game: Game): boolean {
  return game.priceInCents === 0;
}

function compareByNewestRelease(firstGame: Game, secondGame: Game): number {
  return secondGame.releaseDate.localeCompare(firstGame.releaseDate);
}

export async function getFeaturedGames(): Promise<Game[]> {
  const games = await fetchAllGames();
  return games.filter((game) => game.isFeatured);
}

export async function getSpecialOffers(
  limit = SPECIAL_OFFERS_LIST_SIZE,
): Promise<Game[]> {
  const games = await fetchAllGames();
  return games
    .filter((game) => game.discountPercent > 0)
    .sort((firstGame, secondGame) => secondGame.discountPercent - firstGame.discountPercent)
    .slice(0, limit);
}

export async function getNewReleases(limit = DEFAULT_LIST_SIZE): Promise<Game[]> {
  const games = await fetchAllGames();
  const today = new Date();
  return games
    .filter((game) => isReleased(game, today))
    .sort(compareByNewestRelease)
    .slice(0, limit);
}

// Jogos gratuitos ficam de fora porque "mais vendidos" mede vendas pagas.
export async function getTopSellers(limit = DEFAULT_LIST_SIZE): Promise<Game[]> {
  const games = await fetchAllGames();
  return games
    .filter((game) => !isFree(game))
    .sort((firstGame, secondGame) => secondGame.unitsSold - firstGame.unitsSold)
    .slice(0, limit);
}

export async function getUpcomingGames(limit = DEFAULT_LIST_SIZE): Promise<Game[]> {
  const games = await fetchAllGames();
  const today = new Date();
  return games
    .filter((game) => !isReleased(game, today))
    .sort((firstGame, secondGame) => firstGame.releaseDate.localeCompare(secondGame.releaseDate))
    .slice(0, limit);
}

export async function getFreeToPlayGames(limit = DEFAULT_LIST_SIZE): Promise<Game[]> {
  const games = await fetchAllGames();
  return games
    .filter((game) => isFree(game) && isReleased(game, new Date()))
    .sort((firstGame, secondGame) => secondGame.unitsSold - firstGame.unitsSold)
    .slice(0, limit);
}

export async function getGenres(): Promise<Genre[]> {
  return Object.values(GENRES);
}
