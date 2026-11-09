import { libraryCollection } from "@/services/userCollections";

// "Jogar" não abre o jogo de verdade (a Can não instala nada): só registra a
// sessão, que alimenta a ordem por atividade recente. Equivale ao
// PATCH /library/:gameId, que grava o lastPlayedAt.
export function launchGame(gameId: string): Promise<void> {
  return libraryCollection.markPlayed(gameId);
}
