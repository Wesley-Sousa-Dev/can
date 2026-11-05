import { libraryCollection } from "@/services/userCollections";

// Os jogos da Can são fictícios, então "Jogar" não abre nada de verdade:
// só registra a sessão, que alimenta a ordem por atividade recente.
// Com a API, vira um PATCH /library/:gameId com o novo lastPlayedAt.
export function launchGame(gameId: string): void {
  libraryCollection.update(gameId, { lastPlayedAt: new Date().toISOString() });
}
