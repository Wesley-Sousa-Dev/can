// Formato das respostas da Can Games API (repositório can-api). Fica separado
// dos tipos da interface: src/services/gameMapper.ts traduz um no outro, então
// uma mudança na API só mexe no mapeamento.

/** Toda resposta de sucesso vem dentro de "data". */
export interface ApiResponse<TData> {
  data: TData;
}

/** Toda resposta de erro traz uma mensagem e, às vezes, o erro de cada campo. */
export interface ApiErrorBody {
  error?: {
    message?: string;
    fields?: Record<string, string>;
  };
}

export interface ApiGenre {
  id: string;
  name: string;
}

/** Valores na unidade da moeda (não em centavos). */
export interface ApiPrice {
  current: number | null;
  original: number | null;
  currency: string;
  discountPercent: number;
  isOnSale: boolean;
}

export interface ApiGame {
  id: string;
  steamAppId: string | null;
  title: string;
  shortDescription: string;
  developer: string;
  genres: ApiGenre[];
  /** Preço a pagar, já com desconto, em centavos de real. Nulo quando a fonte não traz o preço em reais. */
  priceInCents: number | null;
  discountPercent: number;
  coverImageUrl: string | null;
  tags: string[];
  publisher: string;
  screenshotUrls: string[];
  price: ApiPrice;
}

export interface ApiLanguageSupport {
  language: string;
  hasInterface: boolean;
  hasAudio: boolean;
  hasSubtitles: boolean;
}

export interface ApiSystemRequirements {
  operatingSystem: string;
  processor: string;
  memory: string;
  graphics: string;
  storage: string;
}

export interface ApiGameDetails extends ApiGame {
  aboutSections: { title: string; text: string }[];
  platforms: string[];
  features: string[];
  accessibilityFeatures: string[];
  languages: ApiLanguageSupport[];
  ageRating: string | null;
  ageRatingDescriptors: string[];
  minimumRequirements: ApiSystemRequirements;
  recommendedRequirements: ApiSystemRequirements;
}

/** Corpo de POST /cart e POST /wishlist: a API guarda o jogo para somar o pedido depois. */
export interface ApiCollectionGameSnapshot {
  id: string;
  title: string;
  /** Preço a pagar, já com desconto, em centavos de real. */
  priceInCents: number | null;
}
