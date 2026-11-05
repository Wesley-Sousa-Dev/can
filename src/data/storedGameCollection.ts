import type { GameCollectionEntry, GameCollectionEntryChanges } from "@/types/collection";

// Coleção de jogos guardada no localStorage do navegador, no formato que o
// useSyncExternalStore do React espera (subscribe + getSnapshot).
// É a fonte de dados provisória do carrinho, da lista de desejos e da biblioteca.
// A ordem do array é a ordem da coleção: na lista de desejos, é a posição
// que a pessoa escolheu para cada jogo.

export interface StoredGameCollection {
  subscribe: (onChange: () => void) => () => void;
  getSnapshot: () => readonly GameCollectionEntry[];
  getServerSnapshot: () => readonly GameCollectionEntry[];
  add: (gameId: string) => void;
  remove: (gameId: string) => void;
  /** Leva o jogo para a posição que targetGameId ocupa agora. */
  move: (gameId: string, targetGameId: string) => void;
  update: (gameId: string, changes: GameCollectionEntryChanges) => void;
  clear: () => void;
}

const EMPTY_COLLECTION: readonly GameCollectionEntry[] = Object.freeze([]);

function isCollectionEntry(value: unknown): value is GameCollectionEntry {
  return (
    typeof value === "object" &&
    value !== null &&
    "gameId" in value &&
    typeof value.gameId === "string" &&
    "addedAt" in value &&
    typeof value.addedAt === "string" &&
    (!("lastPlayedAt" in value) || typeof value.lastPlayedAt === "string")
  );
}

// A primeira versão guardava só os ids. Eles viram entradas com a data de hoje,
// para quem já tinha jogos salvos não perder a lista.
function toCollectionEntries(value: unknown): readonly GameCollectionEntry[] {
  if (!Array.isArray(value)) {
    return EMPTY_COLLECTION;
  }
  const migrationDate = new Date().toISOString();
  const entries: unknown[] = value.map((item) =>
    typeof item === "string" ? { gameId: item, addedAt: migrationDate } : item,
  );
  return entries.every(isCollectionEntry) ? entries : EMPTY_COLLECTION;
}

export function createStoredGameCollection(storageKey: string): StoredGameCollection {
  const listeners = new Set<() => void>();
  // O React exige que getSnapshot devolva o mesmo array enquanto nada mudar,
  // então a leitura do localStorage fica guardada aqui.
  let cachedEntries: readonly GameCollectionEntry[] | null = null;

  function notifyListeners() {
    listeners.forEach((listener) => listener());
  }

  function readFromStorage(): readonly GameCollectionEntry[] {
    try {
      const storedValue = window.localStorage.getItem(storageKey);
      return storedValue ? toCollectionEntries(JSON.parse(storedValue)) : EMPTY_COLLECTION;
    } catch {
      // Valor corrompido ou armazenamento bloqueado: começa vazio.
      return EMPTY_COLLECTION;
    }
  }

  function getSnapshot(): readonly GameCollectionEntry[] {
    cachedEntries ??= readFromStorage();
    return cachedEntries;
  }

  function save(entries: readonly GameCollectionEntry[]) {
    cachedEntries = entries;
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(entries));
    } catch {
      // Sem armazenamento (ex.: janela privada), a coleção vale só até fechar a aba.
    }
    notifyListeners();
  }

  // O evento "storage" só dispara em outras abas: mantém todas sincronizadas.
  function handleStorageChange(event: StorageEvent) {
    if (event.key !== storageKey) {
      return;
    }
    cachedEntries = null;
    notifyListeners();
  }

  return {
    subscribe(onChange) {
      listeners.add(onChange);
      if (listeners.size === 1) {
        window.addEventListener("storage", handleStorageChange);
      }
      return () => {
        listeners.delete(onChange);
        if (listeners.size === 0) {
          window.removeEventListener("storage", handleStorageChange);
        }
      };
    },
    getSnapshot,
    // No servidor não existe localStorage: a página nasce com as coleções vazias.
    getServerSnapshot: () => EMPTY_COLLECTION,
    add(gameId) {
      const currentEntries = getSnapshot();
      if (!currentEntries.some((entry) => entry.gameId === gameId)) {
        save([...currentEntries, { gameId, addedAt: new Date().toISOString() }]);
      }
    },
    remove(gameId) {
      save(getSnapshot().filter((entry) => entry.gameId !== gameId));
    },
    move(gameId, targetGameId) {
      const currentEntries = getSnapshot();
      const movedEntry = currentEntries.find((entry) => entry.gameId === gameId);
      const targetIndex = currentEntries.findIndex((entry) => entry.gameId === targetGameId);
      if (!movedEntry || targetIndex === -1 || gameId === targetGameId) {
        return;
      }
      // Tirar o jogo antes de inserir faz ele ficar depois do alvo quando desce
      // e antes do alvo quando sobe, que é o que a pessoa espera nos dois casos.
      const reorderedEntries = currentEntries.filter((entry) => entry.gameId !== gameId);
      reorderedEntries.splice(targetIndex, 0, movedEntry);
      save(reorderedEntries);
    },
    update(gameId, changes) {
      save(getSnapshot().map((entry) => (entry.gameId === gameId ? { ...entry, ...changes } : entry)));
    },
    clear() {
      save(EMPTY_COLLECTION);
    },
  };
}
