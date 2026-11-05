import type { SessionState, UserProfile } from "@/types/user";

// Contas e sessão guardadas no localStorage: é a fonte de dados provisória
// até a API ficar pronta. Segue o formato do useSyncExternalStore do React.

export interface StoredAccount extends UserProfile {
  passwordHash: string;
}

const ACCOUNTS_STORAGE_KEY = "can:accounts";
const SESSION_STORAGE_KEY = "can:session";

// Conta para testar sem cadastro. Senha: Can12345 (o valor abaixo é o hash dela).
const DEMO_ACCOUNT: StoredAccount = {
  id: "demo-account",
  fullName: "Conta Demonstração",
  nickname: "demo",
  birthDate: "2000-05-10",
  address: "Rua do Comércio, 1000, Ijuí - RS",
  email: "demo@example.com",
  createdAt: "2026-11-01T12:00:00.000Z",
  passwordHash: "81c19a34f1ee55abb7771d660e6fa15b289555f70fcef47282c073848d4f8b27",
};

const LOADING_SESSION: SessionState = { status: "loading" };
const SIGNED_OUT_SESSION: SessionState = { status: "signed-out" };

const listeners = new Set<() => void>();
// O React exige o mesmo objeto enquanto nada mudar, então a sessão fica guardada aqui.
let cachedSession: SessionState | null = null;

function isStoredAccountList(value: unknown): value is StoredAccount[] {
  return (
    Array.isArray(value) &&
    value.every((item) => typeof item === "object" && item !== null && "passwordHash" in item)
  );
}

export function toUserProfile(account: StoredAccount): UserProfile {
  return {
    id: account.id,
    fullName: account.fullName,
    nickname: account.nickname,
    birthDate: account.birthDate,
    address: account.address,
    email: account.email,
    createdAt: account.createdAt,
  };
}

export function readAccounts(): StoredAccount[] {
  try {
    const storedValue = window.localStorage.getItem(ACCOUNTS_STORAGE_KEY);
    // Na primeira visita ainda não há nada salvo: começa só com a conta de demonstração.
    if (storedValue === null) {
      return [DEMO_ACCOUNT];
    }
    const parsedValue: unknown = JSON.parse(storedValue);
    return isStoredAccountList(parsedValue) ? parsedValue : [DEMO_ACCOUNT];
  } catch {
    return [DEMO_ACCOUNT];
  }
}

function notifySessionChange() {
  cachedSession = null;
  listeners.forEach((listener) => listener());
}

export function saveAccounts(accounts: StoredAccount[]) {
  try {
    window.localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(accounts));
  } catch {
    // Sem armazenamento disponível (ex.: janela privada): a mudança se perde ao recarregar.
  }
  notifySessionChange();
}

function readSessionAccountId(): string | null {
  try {
    return window.localStorage.getItem(SESSION_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function saveSessionAccountId(accountId: string | null) {
  try {
    if (accountId === null) {
      window.localStorage.removeItem(SESSION_STORAGE_KEY);
    } else {
      window.localStorage.setItem(SESSION_STORAGE_KEY, accountId);
    }
  } catch {
    // Mesmo caso de armazenamento indisponível.
  }
  notifySessionChange();
}

function readSession(): SessionState {
  const accountId = readSessionAccountId();
  const account = accountId ? readAccounts().find((candidate) => candidate.id === accountId) : undefined;
  return account ? { status: "signed-in", user: toUserProfile(account) } : SIGNED_OUT_SESSION;
}

// O evento "storage" só dispara em outras abas: entrar ou sair vale para todas.
function handleStorageChange(event: StorageEvent) {
  if (event.key === ACCOUNTS_STORAGE_KEY || event.key === SESSION_STORAGE_KEY) {
    notifySessionChange();
  }
}

export const sessionStore = {
  subscribe(onChange: () => void) {
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
  getSnapshot(): SessionState {
    cachedSession ??= readSession();
    return cachedSession;
  },
  // No servidor não existe localStorage: a página começa "carregando" e o
  // navegador decide logo em seguida se há alguém conectado.
  getServerSnapshot(): SessionState {
    return LOADING_SESSION;
  },
};
