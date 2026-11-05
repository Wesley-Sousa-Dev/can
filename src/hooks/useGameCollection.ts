"use client";

import { useSyncExternalStore } from "react";

import type { StoredIdList } from "@/data/storedIdList";

export function useGameCollection(collection: StoredIdList) {
  const gameIds = useSyncExternalStore(
    collection.subscribe,
    collection.getSnapshot,
    collection.getServerSnapshot,
  );

  return {
    gameIds,
    hasGame: (gameId: string) => gameIds.includes(gameId),
    addGame: collection.add,
    removeGame: collection.remove,
  };
}
