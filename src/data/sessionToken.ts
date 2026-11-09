// Token JWT da sessão, guardado no localStorage do navegador. A API o devolve
// no login (POST /sessions) e o exige no cabeçalho Authorization das rotas da conta.

const SESSION_TOKEN_STORAGE_KEY = "can:session-token";

export function readSessionToken(): string | null {
  try {
    return window.localStorage.getItem(SESSION_TOKEN_STORAGE_KEY);
  } catch {
    // Armazenamento bloqueado (ex.: algumas janelas privadas): ninguém conectado.
    return null;
  }
}

export function saveSessionToken(token: string | null) {
  try {
    if (token === null) {
      window.localStorage.removeItem(SESSION_TOKEN_STORAGE_KEY);
    } else {
      window.localStorage.setItem(SESSION_TOKEN_STORAGE_KEY, token);
    }
  } catch {
    // Sem armazenamento, a sessão vale só enquanto a aba estiver aberta.
  }
}

/** O evento "storage" do navegador avisa as outras abas; esta chave identifica o token. */
export function isSessionTokenKey(storageKey: string | null): boolean {
  return storageKey === SESSION_TOKEN_STORAGE_KEY;
}
