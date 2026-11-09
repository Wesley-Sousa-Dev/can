import type { ApiErrorBody, ApiResponse } from "@/types/api";

// Ponto único de acesso à Can Games API. Monta a URL, envia o token quando a
// rota exige login e transforma qualquer falha em um ApiError com a mensagem
// da própria API, para a interface mostrar ao usuário.

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

/** Quanto tempo o servidor do Next guarda as listas de jogos antes de pedir de novo. */
export const CATALOG_CACHE_SECONDS = 600;

export class ApiError extends Error {
  /** Código HTTP da resposta. Zero quando a API nem respondeu (fora do ar ou sem internet). */
  readonly status: number;
  /** Erros por campo, quando a API valida um formulário. */
  readonly fieldErrors: Record<string, string>;

  constructor(status: number, message: string, fieldErrors: Record<string, string> = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

const UNREACHABLE_API_MESSAGE =
  "Não foi possível falar com o servidor da Can. Confira sua conexão e tente de novo.";

type HttpMethod = "GET" | "POST" | "PATCH" | "DELETE";

interface ApiRequestOptions {
  method?: HttpMethod;
  body?: unknown;
  /** Token da sessão, para as rotas que exigem login. */
  token?: string | null;
  /** Só no servidor do Next: guarda a resposta por esse número de segundos. */
  cacheSeconds?: number;
}

async function readErrorBody(response: Response): Promise<ApiErrorBody> {
  try {
    return (await response.json()) as ApiErrorBody;
  } catch {
    return {};
  }
}

/** Faz a requisição e devolve o conteúdo de "data". Respostas 204 devolvem undefined. */
export async function requestApi<TData>(path: string, options: ApiRequestOptions = {}): Promise<TData> {
  const { method = "GET", body, token, cacheSeconds } = options;
  const headers: Record<string, string> = { Accept: "application/json" };
  if (body !== undefined) {
    headers["Content-Type"] = "application/json";
  }
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      // Dados da conta nunca entram no cache; as listas de jogos, sim.
      ...(cacheSeconds === undefined ? { cache: "no-store" } : { next: { revalidate: cacheSeconds } }),
    });
  } catch {
    throw new ApiError(0, UNREACHABLE_API_MESSAGE);
  }

  if (!response.ok) {
    const errorBody = await readErrorBody(response);
    throw new ApiError(
      response.status,
      errorBody.error?.message ?? "Algo deu errado no servidor. Tente de novo.",
      errorBody.error?.fields,
    );
  }

  if (response.status === 204) {
    return undefined as TData;
  }
  const responseBody = (await response.json()) as ApiResponse<TData>;
  return responseBody.data;
}
