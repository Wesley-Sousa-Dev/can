"use client";

import { useEffect, useMemo, useState } from "react";

import { getGamesByIds } from "@/services/gameService";
import type { GameShowcase } from "@/types/game";

export type GamesRequestStatus = "loading" | "ready" | "error";

interface GamesRequestResult {
  requestKey: string;
  games: GameShowcase[];
  status: GamesRequestStatus;
}

// As coleções da API guardam só os ids. Este hook busca os dados de cada jogo
// (GET /games/:id) e devolve na ordem dos ids. Enquanto busca jogos novos, os
// já carregados continuam na tela, para a lista não piscar a cada mudança.
export function useGamesByIds(gameIds: readonly string[]) {
  const requestKey = gameIds.join(",");
  const [result, setResult] = useState<GamesRequestResult>({ requestKey: "", games: [], status: "ready" });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let isCurrentRequest = true;
    const requestedIds = requestKey ? requestKey.split(",") : [];
    getGamesByIds(requestedIds)
      .then((games) => {
        if (isCurrentRequest) {
          setResult({ requestKey, games, status: "ready" });
        }
      })
      .catch(() => {
        if (isCurrentRequest) {
          setResult((previousResult) => ({ ...previousResult, requestKey, status: "error" }));
        }
      });
    return () => {
      isCurrentRequest = false;
    };
  }, [requestKey, attempt]);

  const games = useMemo(() => {
    const gamesById = new Map(result.games.map((game) => [game.id, game]));
    return gameIds.flatMap((gameId) => gamesById.get(gameId) ?? []);
  }, [gameIds, result.games]);

  const status: GamesRequestStatus = result.requestKey === requestKey ? result.status : "loading";

  return {
    games,
    status,
    /** Faz a busca de novo, depois de uma falha. */
    retry: () => setAttempt((currentAttempt) => currentAttempt + 1),
  };
}
