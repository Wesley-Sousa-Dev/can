import { GENRES, isGenreId } from "@/data/genres";
import type { ApiGame, ApiGameDetails } from "@/types/api";
import type {
  AgeRating,
  GameDetails,
  GameFeatureId,
  GameShowcase,
  Genre,
  Platform,
} from "@/types/game";

// Traduz o formato da Can Games API para os tipos que a interface usa.
// Tudo o que a API pode mandar incompleto é tratado aqui, para os
// componentes não precisarem desconfiar dos dados.

const PLATFORMS: readonly Platform[] = ["windows", "macos", "linux"];
const GAME_FEATURES: readonly GameFeatureId[] = [
  "single-player",
  "online-multiplayer",
  "co-op",
  "achievements",
  "controller-support",
  "cloud-saves",
];
const AGE_RATINGS: readonly AgeRating[] = ["L", "10", "12", "14", "16", "18"];

function includesValue<TValue extends string>(values: readonly TValue[], value: string): value is TValue {
  return (values as readonly string[]).includes(value);
}

// A API pode repetir um gênero com nomes diferentes ("Action" e "Ação"); os
// nomes exibidos são sempre os da Can.
function toGenres(apiGame: ApiGame): Genre[] {
  const genreIds = new Set(apiGame.genres.map((genre) => genre.id).filter(isGenreId));
  return [...genreIds].map((genreId) => GENRES[genreId]);
}

// O priceInCents da API já vem com desconto. O preço cheio sai de price.original,
// que só vale quando a moeda é o real.
function toFullPriceInCents(apiGame: ApiGame): number | null {
  if (apiGame.priceInCents === null) {
    return null;
  }
  const { original, currency } = apiGame.price;
  if (apiGame.discountPercent > 0 && currency === "BRL" && original !== null) {
    return Math.max(Math.round(original * 100), apiGame.priceInCents);
  }
  return apiGame.priceInCents;
}

export function toGameShowcase(apiGame: ApiGame): GameShowcase {
  const fullPriceInCents = toFullPriceInCents(apiGame);
  return {
    id: apiGame.id,
    title: apiGame.title,
    shortDescription: apiGame.shortDescription,
    developer: apiGame.developer,
    genres: toGenres(apiGame),
    priceInCents: fullPriceInCents,
    currentPriceInCents: apiGame.priceInCents,
    // Sem preço em reais, um desconto sozinho não significa nada para quem compra.
    discountPercent: fullPriceInCents === null ? 0 : apiGame.discountPercent,
    coverImageUrl: apiGame.coverImageUrl,
    tags: apiGame.tags,
    publisher: apiGame.publisher,
    screenshotUrls: apiGame.screenshotUrls,
  };
}

export function toGameDetails(apiGame: ApiGameDetails): GameDetails {
  return {
    ...toGameShowcase(apiGame),
    aboutSections: apiGame.aboutSections.filter((section) => section.text.trim() !== ""),
    platforms: apiGame.platforms.filter((platform) => includesValue(PLATFORMS, platform)),
    features: apiGame.features.filter((feature) => includesValue(GAME_FEATURES, feature)),
    accessibilityFeatures: apiGame.accessibilityFeatures,
    languages: apiGame.languages,
    ageRating:
      apiGame.ageRating !== null && includesValue(AGE_RATINGS, apiGame.ageRating) ? apiGame.ageRating : null,
    ageRatingDescriptors: apiGame.ageRatingDescriptors,
    minimumRequirements: apiGame.minimumRequirements,
    recommendedRequirements: apiGame.recommendedRequirements,
  };
}
