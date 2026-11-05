import type { Game } from "@/types/game";

// Regras que dizem se um jogo já pode ser comprado. Ficam aqui, sem depender
// dos dados, para valerem tanto no servidor quanto no navegador.

/** buy: jogo pago já lançado · free: gratuito · upcoming: ainda não lançado. */
export type PurchaseOption = "buy" | "free" | "upcoming";

export function isGameReleased(
  game: Pick<Game, "releaseDate">,
  referenceDate: Date = new Date(),
): boolean {
  return new Date(game.releaseDate) <= referenceDate;
}

export function isFreeGame(game: Pick<Game, "priceInCents">): boolean {
  return game.priceInCents === 0;
}

export function getPurchaseOption(game: Game, referenceDate: Date = new Date()): PurchaseOption {
  if (!isGameReleased(game, referenceDate)) {
    return "upcoming";
  }
  return isFreeGame(game) ? "free" : "buy";
}
