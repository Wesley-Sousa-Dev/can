"use client";

import { useMemo, useSyncExternalStore } from "react";

import type { StoredGameCollection } from "@/data/storedGameCollection";

export function useGameCollection(collection: StoredGameCollection) {
  const entries = useSyncExternalStore(
    collection.subscribe,
    collection.getSnapshot,
    collection.getServerSnapshot,
  );
  // A maioria das telas só precisa dos ids. O useMemo devolve o mesmo array
  // enquanto a coleção não muda.
  const gameIds = useMemo(() => entries.map((entry) => entry.gameId), [entries]);

  return {
    entries,
    gameIds,
    hasGame: (gameId: string) => gameIds.includes(gameId),
    addGame: collection.add,
    removeGame: collection.remove,
    moveGame: collection.move,
  };
}
