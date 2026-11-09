// Gêneros que a Can Games API reconhece nos dados da Steam.
export type GenreId = "action" | "adventure" | "rpg" | "strategy" | "racing" | "simulation";

export interface Genre {
  id: GenreId;
  name: string;
}

export interface Game {
  /** Id do jogo na Steam (Steam App ID). */
  id: string;
  title: string;
  shortDescription: string;
  developer: string;
  genres: Genre[];
  /**
   * Preço cheio, sem desconto, em centavos de real (centavos evitam erros de
   * arredondamento). Nulo quando a loja não informa o preço em reais.
   */
  priceInCents: number | null;
  /** Preço a pagar hoje, já com o desconto, em centavos. Nulo junto com o preço cheio. */
  currentPriceInCents: number | null;
  /** Desconto de 0 a 100. Zero significa que o jogo está sem promoção. */
  discountPercent: number;
  /** Capa horizontal da Steam (460 × 215). Nula quando a loja não tem imagem. */
  coverImageUrl: string | null;
}

export type Platform = "windows" | "macos" | "linux";

export type GameFeatureId =
  | "single-player"
  | "online-multiplayer"
  | "co-op"
  | "achievements"
  | "controller-support"
  | "cloud-saves";

/** Faixas da Classificação Indicativa brasileira. */
export type AgeRating = "L" | "10" | "12" | "14" | "16" | "18";

export interface GameAboutSection {
  title: string;
  text: string;
}

export interface LanguageSupport {
  language: string;
  hasInterface: boolean;
  hasAudio: boolean;
  hasSubtitles: boolean;
}

/** Cada campo fica vazio quando a Steam não informa aquele item. */
export interface SystemRequirements {
  operatingSystem: string;
  processor: string;
  memory: string;
  graphics: string;
  storage: string;
}

// A interface não mostra data de lançamento nem análises: a API não consegue
// ler a maioria das datas da Steam e não traz as análises na rota de cada jogo.

/** Jogo com marcadores, para listas mais completas que um card, como a lista de desejos. */
export interface GameListing extends Game {
  tags: string[];
}

/** Jogo com distribuidora e capturas de tela, para as vitrines da loja, dos gêneros e da busca. */
export interface GameShowcase extends GameListing {
  publisher: string;
  screenshotUrls: string[];
}

/** Dados extras que só a página do jogo usa (vêm de GET /games/:id). */
export interface GameDetails extends GameShowcase {
  aboutSections: GameAboutSection[];
  platforms: Platform[];
  features: GameFeatureId[];
  accessibilityFeatures: string[];
  languages: LanguageSupport[];
  /** Nula quando o jogo não tem Classificação Indicativa brasileira informada. */
  ageRating: AgeRating | null;
  ageRatingDescriptors: string[];
  minimumRequirements: SystemRequirements;
  recommendedRequirements: SystemRequirements;
}
