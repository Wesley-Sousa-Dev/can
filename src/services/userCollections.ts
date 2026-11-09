import { readSessionToken } from "@/data/sessionToken";
import { ApiError, requestApi } from "@/services/apiClient";
import type { ApiCollectionGameSnapshot } from "@/types/api";
import type { GameCollectionEntry } from "@/types/collection";
import type { Game } from "@/types/game";

// Coleções da conta: carrinho, lista de desejos e biblioteca, guardadas na API.
//   GET /cart, /wishlist, /library     → reload
//   POST /cart, /wishlist              → add
//   DELETE /cart/:id, /wishlist/:id    → remove
//   PATCH /wishlist/:id (posição)      → move
//   PATCH /library/:id (lastPlayedAt)  → markPlayed
// A biblioteca não aceita POST nem DELETE: os jogos só entram nela por uma
// compra (POST /orders) e não saem mais.
//
// As mudanças aparecem na tela na hora (atualização otimista). Se a API
// recusar, a coleção volta ao que era e a promessa é rejeitada com o motivo.

export type CollectionName = "cart" | "wishlist" | "library";

/** idle: ninguém conectado · loading: buscando na API · ready: pronta · error: a API não respondeu. */
export type CollectionStatus = "idle" | "loading" | "ready" | "error";

export interface GameCollectionState {
  status: CollectionStatus;
  entries: readonly GameCollectionEntry[];
}

export interface GameCollection {
  subscribe: (onChange: () => void) => () => void;
  getSnapshot: () => GameCollectionState;
  getServerSnapshot: () => GameCollectionState;
  reload: () => Promise<void>;
  add: (game: Game) => Promise<void>;
  remove: (gameId: string) => Promise<void>;
  /** Leva o jogo para a posição que targetGameId ocupa agora. */
  move: (gameId: string, targetGameId: string) => Promise<void>;
  /** Só na biblioteca: registra que o jogo foi aberto agora. */
  markPlayed: (gameId: string) => Promise<void>;
  /** Volta ao estado de quem não está conectado. */
  reset: () => void;
}

const SIGNED_OUT_STATE: GameCollectionState = Object.freeze({ status: "idle", entries: Object.freeze([]) });

const sessionExpiredListeners = new Set<() => void>();

/** O authService avisa aqui o que fazer quando a API recusar o token. */
export function onSessionExpired(listener: () => void) {
  sessionExpiredListeners.add(listener);
}

function handleRequestError(error: unknown): never {
  if (error instanceof ApiError && error.status === 401) {
    sessionExpiredListeners.forEach((listener) => listener());
  }
  throw error;
}

function requireSessionToken(): string {
  const token = readSessionToken();
  if (!token) {
    throw new ApiError(401, "Entre na sua conta para continuar.");
  }
  return token;
}

function toSnapshot(game: Game): ApiCollectionGameSnapshot {
  return { id: game.id, title: game.title, priceInCents: game.currentPriceInCents };
}

function createGameCollection(name: CollectionName): GameCollection {
  const listeners = new Set<() => void>();
  let state: GameCollectionState = SIGNED_OUT_STATE;
  // Cada carregamento ganha um número: a resposta de um pedido antigo não
  // sobrescreve a de um mais novo (ex.: sair e entrar rápido).
  let loadVersion = 0;

  function setState(nextState: GameCollectionState) {
    state = nextState;
    listeners.forEach((listener) => listener());
  }

  function setEntries(entries: readonly GameCollectionEntry[]) {
    setState({ status: "ready", entries });
  }

  // Aplica a mudança na hora e desfaz se a API recusar.
  async function updateOptimistically(
    nextEntries: readonly GameCollectionEntry[],
    request: () => Promise<readonly GameCollectionEntry[] | void>,
  ) {
    const previousEntries = state.entries;
    setEntries(nextEntries);
    try {
      const confirmedEntries = await request();
      if (confirmedEntries) {
        setEntries(confirmedEntries);
      }
    } catch (error) {
      setEntries(previousEntries);
      handleRequestError(error);
    }
  }

  return {
    subscribe(onChange) {
      listeners.add(onChange);
      return () => listeners.delete(onChange);
    },
    getSnapshot: () => state,
    // No servidor não há sessão: a página nasce sem coleção e o navegador busca em seguida.
    getServerSnapshot: () => SIGNED_OUT_STATE,

    async reload() {
      const token = readSessionToken();
      if (!token) {
        setState(SIGNED_OUT_STATE);
        return;
      }
      const currentLoadVersion = ++loadVersion;
      setState({ status: state.status === "ready" ? "ready" : "loading", entries: state.entries });
      try {
        const entries = await requestApi<GameCollectionEntry[]>(`/${name}`, { token });
        if (currentLoadVersion === loadVersion) {
          setEntries(entries);
        }
      } catch (error) {
        if (currentLoadVersion !== loadVersion) {
          return;
        }
        setState({ status: "error", entries: state.entries });
        if (error instanceof ApiError && error.status === 401) {
          sessionExpiredListeners.forEach((listener) => listener());
        }
      }
    },

    async add(game) {
      if (state.entries.some((entry) => entry.gameId === game.id)) {
        return;
      }
      const token = requireSessionToken();
      const optimisticEntry: GameCollectionEntry = { gameId: game.id, addedAt: new Date().toISOString() };
      await updateOptimistically([...state.entries, optimisticEntry], async () => {
        const savedEntry = await requestApi<GameCollectionEntry>(`/${name}`, {
          method: "POST",
          body: { game: toSnapshot(game) },
          token,
        });
        return state.entries.map((entry) => (entry.gameId === savedEntry.gameId ? savedEntry : entry));
      });
    },

    async remove(gameId) {
      const token = requireSessionToken();
      await updateOptimistically(
        state.entries.filter((entry) => entry.gameId !== gameId),
        async () => {
          await requestApi(`/${name}/${encodeURIComponent(gameId)}`, { method: "DELETE", token });
        },
      );
    },

    async move(gameId, targetGameId) {
      const movedEntry = state.entries.find((entry) => entry.gameId === gameId);
      const targetIndex = state.entries.findIndex((entry) => entry.gameId === targetGameId);
      if (!movedEntry || targetIndex === -1 || gameId === targetGameId) {
        return;
      }
      const token = requireSessionToken();
      // Tirar o jogo antes de inserir faz ele ficar depois do alvo quando desce
      // e antes do alvo quando sobe. A API segue a mesma regra com "position".
      const reorderedEntries = state.entries.filter((entry) => entry.gameId !== gameId);
      reorderedEntries.splice(targetIndex, 0, movedEntry);
      await updateOptimistically(reorderedEntries, () =>
        requestApi<GameCollectionEntry[]>(`/${name}/${encodeURIComponent(gameId)}`, {
          method: "PATCH",
          body: { position: targetIndex },
          token,
        }),
      );
    },

    async markPlayed(gameId) {
      const token = requireSessionToken();
      const playedAt = new Date().toISOString();
      await updateOptimistically(
        state.entries.map((entry) => (entry.gameId === gameId ? { ...entry, lastPlayedAt: playedAt } : entry)),
        async () => {
          const savedEntry = await requestApi<GameCollectionEntry>(`/${name}/${encodeURIComponent(gameId)}`, {
            method: "PATCH",
            token,
          });
          return state.entries.map((entry) => (entry.gameId === savedEntry.gameId ? savedEntry : entry));
        },
      );
    },

    reset() {
      loadVersion++;
      setState(SIGNED_OUT_STATE);
    },
  };
}

export const cartCollection = createGameCollection("cart");
export const wishlistCollection = createGameCollection("wishlist");
export const libraryCollection = createGameCollection("library");

const ALL_COLLECTIONS = [cartCollection, wishlistCollection, libraryCollection];

export async function reloadUserCollections(): Promise<void> {
  await Promise.all(ALL_COLLECTIONS.map((collection) => collection.reload()));
}

export function resetUserCollections() {
  ALL_COLLECTIONS.forEach((collection) => collection.reset());
}
