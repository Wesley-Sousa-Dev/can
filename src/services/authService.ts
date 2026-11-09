import { isSessionTokenKey, readSessionToken, saveSessionToken } from "@/data/sessionToken";
import { ApiError, requestApi } from "@/services/apiClient";
import { onSessionExpired, reloadUserCollections, resetUserCollections } from "@/services/userCollections";
import type { ProfileChanges, RegistrationData, SessionState, UserProfile } from "@/types/user";

// Camada de negócio das contas. Cada função corresponde a uma rota da API:
//   registerAccount → POST /users        signIn        → POST /sessions
//   updateProfile   → PATCH /users/:id   signOut       → DELETE /sessions
//   deleteAccount   → DELETE /users/:id  (ao abrir)    → GET /users/me
// A sessão também segue o formato do useSyncExternalStore do React.

export type AccountFieldErrors = Partial<Record<keyof RegistrationData, string>>;

export type AccountResult =
  | { isSuccess: true; user: UserProfile }
  | {
      isSuccess: false;
      /** Código HTTP da falha: 401 é e-mail ou senha errados; 0 é servidor fora do ar. */
      status: number;
      message: string;
      /** Erros que a API apontou em cada campo, como apelido já usado. */
      fieldErrors: AccountFieldErrors;
    };

const LOADING_SESSION: SessionState = { status: "loading" };
const SIGNED_OUT_SESSION: SessionState = { status: "signed-out" };

const listeners = new Set<() => void>();
// O React exige o mesmo objeto enquanto nada mudar, então a sessão fica guardada aqui.
let currentSession: SessionState | null = null;
let isRestoringSession = false;

function setSession(nextSession: SessionState) {
  const previousStatus = currentSession?.status;
  currentSession = nextSession;
  listeners.forEach((listener) => listener());

  // Carrinho, desejos e biblioteca pertencem à conta: entram junto com ela e saem ao sair.
  if (nextSession.status === "signed-in" && previousStatus !== "signed-in") {
    void reloadUserCollections();
  }
  if (nextSession.status === "signed-out") {
    resetUserCollections();
  }
}

function toFailure(error: unknown): AccountResult {
  if (error instanceof ApiError) {
    return { isSuccess: false, status: error.status, message: error.message, fieldErrors: error.fieldErrors };
  }
  return { isSuccess: false, status: 0, message: "Algo deu errado. Tente de novo.", fieldErrors: {} };
}

function endLocalSession() {
  saveSessionToken(null);
  setSession(SIGNED_OUT_SESSION);
}

// A API guarda as sessões na memória: se ela reiniciar, o token salvo deixa de valer.
onSessionExpired(endLocalSession);

async function restoreSession() {
  const token = readSessionToken();
  if (!token) {
    setSession(SIGNED_OUT_SESSION);
    return;
  }
  isRestoringSession = true;
  try {
    const user = await requestApi<UserProfile>("/users/me", { token });
    setSession({ status: "signed-in", user });
  } catch (error) {
    // Token recusado: apaga. Servidor fora do ar: guarda o token para a próxima visita.
    if (error instanceof ApiError && error.status !== 0) {
      saveSessionToken(null);
    }
    setSession(SIGNED_OUT_SESSION);
  } finally {
    isRestoringSession = false;
  }
}

// O evento "storage" só dispara nas outras abas: entrar ou sair vale para todas.
function handleStorageChange(event: StorageEvent) {
  if (isSessionTokenKey(event.key) && !isRestoringSession) {
    void restoreSession();
  }
}

function getCurrentSession(): SessionState {
  currentSession ??= readSessionToken() ? LOADING_SESSION : SIGNED_OUT_SESSION;
  return currentSession;
}

export const sessionStore = {
  subscribe(onChange: () => void) {
    listeners.add(onChange);
    if (listeners.size === 1) {
      window.addEventListener("storage", handleStorageChange);
      // Com token salvo, a sessão começa "carregando" até a API confirmar quem é.
      // A primeira inscrição pode chegar antes de alguém ler a sessão, então ela é lida aqui.
      if (getCurrentSession().status === "loading" && !isRestoringSession) {
        void restoreSession();
      }
    }
    return () => {
      listeners.delete(onChange);
      if (listeners.size === 0) {
        window.removeEventListener("storage", handleStorageChange);
      }
    };
  },
  getSnapshot: getCurrentSession,
  // No servidor não existe localStorage: a página começa "carregando" e o
  // navegador decide logo em seguida se há alguém conectado.
  getServerSnapshot(): SessionState {
    return LOADING_SESSION;
  },
};

export async function signIn(email: string, password: string): Promise<AccountResult> {
  try {
    const session = await requestApi<{ token: string; user: UserProfile }>("/sessions", {
      method: "POST",
      body: { email: email.trim(), password },
    });
    saveSessionToken(session.token);
    setSession({ status: "signed-in", user: session.user });
    return { isSuccess: true, user: session.user };
  } catch (error) {
    return toFailure(error);
  }
}

// A API cria a conta sem abrir a sessão. Quem acabou de se cadastrar já entra
// direto, sem precisar digitar a senha de novo.
export async function registerAccount(registration: RegistrationData): Promise<AccountResult> {
  try {
    await requestApi<UserProfile>("/users", { method: "POST", body: registration });
  } catch (error) {
    return toFailure(error);
  }
  return signIn(registration.email, registration.password);
}

export async function signOut(): Promise<void> {
  const token = readSessionToken();
  // A tela já mostra a pessoa fora da conta, mesmo que a API demore ou falhe.
  endLocalSession();
  if (token) {
    await requestApi("/sessions", { method: "DELETE", token }).catch(() => undefined);
  }
}

export async function updateProfile(userId: string, changes: ProfileChanges): Promise<AccountResult> {
  try {
    const user = await requestApi<UserProfile>(`/users/${encodeURIComponent(userId)}`, {
      method: "PATCH",
      body: changes,
      token: readSessionToken(),
    });
    setSession({ status: "signed-in", user });
    return { isSuccess: true, user };
  } catch (error) {
    return toFailure(error);
  }
}

/** Apaga a conta e tudo o que é dela na API: carrinho, desejos, biblioteca e pedidos. */
export async function deleteAccount(userId: string): Promise<{ isSuccess: boolean; message: string }> {
  try {
    await requestApi(`/users/${encodeURIComponent(userId)}`, { method: "DELETE", token: readSessionToken() });
    endLocalSession();
    return { isSuccess: true, message: "" };
  } catch (error) {
    return { isSuccess: false, message: error instanceof ApiError ? error.message : "Algo deu errado. Tente de novo." };
  }
}
