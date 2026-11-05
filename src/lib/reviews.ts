import type { ReviewSummary } from "@/types/game";

// Faixas inspiradas nas da Steam: o rótulo depende do percentual positivo
// e, no topo da escala, também do volume de análises.
const MINIMUM_REVIEWS_FOR_TOP_LABEL = 500;

export function getReviewLabel({ positivePercent, totalReviews }: ReviewSummary): string {
  if (positivePercent >= 95 && totalReviews >= MINIMUM_REVIEWS_FOR_TOP_LABEL) {
    return "Extremamente positivas";
  }
  if (positivePercent >= 80) {
    return "Muito positivas";
  }
  if (positivePercent >= 70) {
    return "Ligeiramente positivas";
  }
  if (positivePercent >= 40) {
    return "Mistas";
  }
  if (positivePercent >= 20) {
    return "Ligeiramente negativas";
  }
  return "Negativas";
}

const countFormatter = new Intl.NumberFormat("pt-BR");

export function formatCount(count: number): string {
  return countFormatter.format(count);
}
