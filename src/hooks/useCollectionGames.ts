"use client";

import { useGameCollection } from "@/hooks/useGameCollection";
import { useGamesByIds } from "@/hooks/useGamesByIds";
import { useSession } from "@/hooks/useSession";
import type { GameCollection } from "@/services/userCollections";

/** O que a tela de uma coleção deve mostrar agora. */
export type CollectionViewState = "loading" | "signed-out" | "error" | "ready";

// Junta a sessão, a coleção da API e os dados de cada jogo, que chegam em
// pedidos separados, e diz à tela em que pé está o carregamento.
export function useCollectionGames(collection: GameCollection) {
  const session = useSession();
  const collectionState = useGameCollection(collection);
  const { games, status: gamesStatus, retry: retryGames } = useGamesByIds(collectionState.gameIds);
  // Um jogo que a loja não acha mais é descartado, então "faltar jogo" só
  // significa algo enquanto a busca ainda está em andamento ou falhou.
  const isMissingGames = games.length < collectionState.gameIds.length;

  let viewState: CollectionViewState = "ready";
  if (session.status === "loading") {
    viewState = "loading";
  } else if (session.status === "signed-out") {
    viewState = "signed-out";
  } else if (collectionState.status === "error" || (gamesStatus === "error" && isMissingGames)) {
    viewState = "error";
  } else if (collectionState.status !== "ready" || (gamesStatus === "loading" && isMissingGames)) {
    viewState = "loading";
  }

  function retry() {
    if (collectionState.status === "error") {
      void collection.reload();
    }
    retryGames();
  }

  return { session, collection: collectionState, games, viewState, retry };
}
