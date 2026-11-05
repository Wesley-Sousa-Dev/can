"use client";

import { useSyncExternalStore } from "react";

import { sessionStore } from "@/services/authService";
import type { SessionState } from "@/types/user";

export function useSession(): SessionState {
  return useSyncExternalStore(
    sessionStore.subscribe,
    sessionStore.getSnapshot,
    sessionStore.getServerSnapshot,
  );
}
