import {
  calculateDiscountedPriceInCents,
  formatPriceInCents,
} from "@/lib/pricing";

interface PriceTagProps {
  priceInCents: number;
  discountPercent: number;
  className?: string;
}

export function PriceTag({
  priceInCents,
  discountPercent,
  className = "",
}: PriceTagProps) {
  if (priceInCents === 0) {
    return (
      <p className={`text-medium font-medium text-title ${className}`}>
        Gratuito
      </p>
    );
  }

  const formattedFullPrice = formatPriceInCents(priceInCents);

  if (discountPercent === 0) {
    return (
      <p className={`text-medium font-medium text-title ${className}`}>
        {formattedFullPrice}
      </p>
    );
  }

  const formattedDiscountedPrice = formatPriceInCents(
    calculateDiscountedPriceInCents(priceInCents, discountPercent),
  );

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Leitores de tela não anunciam o riscado do <del>, então a frase
          completa fica só para eles e a versão visual é escondida deles. */}
      <p className="sr-only">
        Desconto de {discountPercent}%: de {formattedFullPrice} por{" "}
        {formattedDiscountedPrice}.
      </p>
      <span
        aria-hidden="true"
        className="rounded-md bg-cta px-2 py-1 text-medium font-medium text-on-accent"
      >
        -{discountPercent}%
      </span>
      <span aria-hidden="true" className="flex flex-col items-end">
        <del className="text-small text-subtitle">{formattedFullPrice}</del>
        <span className="text-medium font-medium text-title">
          {formattedDiscountedPrice}
        </span>
      </span>
    </div>
  );
}
