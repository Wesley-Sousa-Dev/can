const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

export function calculateDiscountedPriceInCents(
  priceInCents: number,
  discountPercent: number,
): number {
  return Math.round((priceInCents * (100 - discountPercent)) / 100);
}

export function formatPriceInCents(priceInCents: number): string {
  return currencyFormatter.format(priceInCents / 100);
}
