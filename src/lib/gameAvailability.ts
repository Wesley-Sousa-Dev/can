import { hasKnownPrice } from "@/lib/pricing";
import type { Game } from "@/types/game";

// Regras que dizem se um jogo já pode ser comprado. Ficam aqui, sem depender
// dos dados, para valerem tanto no servidor quanto no navegador.

/**
 * buy: jogo pago · free: gratuito · unavailable: a loja não informou o preço
 * em reais, então não dá para comprar. Todo jogo da API é uma oferta à venda,
 * então não existe a opção "em breve".
 */
export type PurchaseOption = "buy" | "free" | "unavailable";

export function isFreeGame(game: Pick<Game, "currentPriceInCents">): boolean {
  return game.currentPriceInCents === 0;
}

export function getPurchaseOption(game: Game): PurchaseOption {
  if (!hasKnownPrice(game)) {
    return "unavailable";
  }
  return isFreeGame(game) ? "free" : "buy";
}
