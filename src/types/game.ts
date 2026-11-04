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
