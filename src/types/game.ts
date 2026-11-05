export type GenreId =
  | "action"
  | "adventure"
  | "rpg"
  | "strategy"
  | "racing"
  | "simulation"
  | "puzzle"
  | "horror";

export interface Genre {
  id: GenreId;
  name: string;
}

export interface Game {
  id: string;
  slug: string;
  title: string;
  shortDescription: string;
  developer: string;
  /** Data de lançamento no formato ISO (AAAA-MM-DD). */
  releaseDate: string;
  genres: Genre[];
  /** Preço cheio em centavos, para evitar erros de arredondamento com decimais. */
  priceInCents: number;
  /** Desconto de 0 a 100. Zero significa que o jogo está sem promoção. */
  discountPercent: number;
  coverImageUrl: string;
  unitsSold: number;
  isFeatured: boolean;
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

export interface SystemRequirements {
  operatingSystem: string;
  processor: string;
  memory: string;
  graphics: string;
  storage: string;
}

export interface ReviewSummary {
  positivePercent: number;
  totalReviews: number;
}

/** Dados extras que só a página do jogo usa (equivale a GET /games/:slug). */
export interface GameDetails extends Game {
  publisher: string;
  screenshotUrls: string[];
  aboutSections: GameAboutSection[];
  tags: string[];
  platforms: Platform[];
  features: GameFeatureId[];
  accessibilityFeatures: string[];
  languages: LanguageSupport[];
  ageRating: AgeRating;
  ageRatingDescriptors: string[];
  /** Nulo enquanto o jogo não foi lançado. */
  reviewSummary: ReviewSummary | null;
  minimumRequirements: SystemRequirements;
  recommendedRequirements: SystemRequirements;
}
