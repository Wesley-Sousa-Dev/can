// Lista de ids guardada no localStorage do navegador, no formato que o
// useSyncExternalStore do React espera (subscribe + getSnapshot).
// É a fonte de dados provisória do carrinho, da lista de desejos e da biblioteca.

export interface StoredIdList {
  subscribe: (onChange: () => void) => () => void;
  getSnapshot: () => readonly string[];
  getServerSnapshot: () => readonly string[];
  add: (id: string) => void;
  remove: (id: string) => void;
}

const EMPTY_LIST: readonly string[] = Object.freeze([]);

function isStringList(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

export function createStoredIdList(storageKey: string): StoredIdList {
  const listeners = new Set<() => void>();
  // O React exige que getSnapshot devolva o mesmo array enquanto nada mudar,
  // então a leitura do localStorage fica guardada aqui.
  let cachedIds: readonly string[] | null = null;

  function notifyListeners() {
    listeners.forEach((listener) => listener());
  }

  function readFromStorage(): readonly string[] {
    try {
      const storedValue = window.localStorage.getItem(storageKey);
      const parsedValue: unknown = storedValue ? JSON.parse(storedValue) : [];
      return isStringList(parsedValue) ? parsedValue : EMPTY_LIST;
    } catch {
      // Valor corrompido ou armazenamento bloqueado: começa vazio.
      return EMPTY_LIST;
    }
  }

  function getSnapshot(): readonly string[] {
    cachedIds ??= readFromStorage();
    return cachedIds;
  }

  function save(ids: readonly string[]) {
    cachedIds = ids;
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(ids));
    } catch {
      // Sem armazenamento (ex.: janela privada), a lista vale só até fechar a aba.
    }
    notifyListeners();
  }

  // O evento "storage" só dispara em outras abas: mantém todas sincronizadas.
  function handleStorageChange(event: StorageEvent) {
    if (event.key !== storageKey) {
      return;
    }
    cachedIds = null;
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
    // No servidor não existe localStorage: a página nasce com as listas vazias.
    getServerSnapshot: () => EMPTY_LIST,
    add(id) {
      const currentIds = getSnapshot();
      if (!currentIds.includes(id)) {
        save([...currentIds, id]);
      }
    },
    remove(id) {
      save(getSnapshot().filter((storedId) => storedId !== id));
    },
  };
}
