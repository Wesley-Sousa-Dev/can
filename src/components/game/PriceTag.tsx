import { formatPriceInCents } from "@/lib/pricing";
import type { Game } from "@/types/game";

interface PriceTagProps {
  price: Pick<Game, "priceInCents" | "currentPriceInCents" | "discountPercent">;
  className?: string;
}

export function PriceTag({ price, className = "" }: PriceTagProps) {
  const { priceInCents, currentPriceInCents, discountPercent } = price;

  if (priceInCents === null || currentPriceInCents === null) {
    return <p className={`text-small text-subtitle ${className}`}>Preço indisponível</p>;
  }

  if (currentPriceInCents === 0) {
    return <p className={`text-medium font-medium text-title ${className}`}>Gratuito</p>;
  }

  const formattedCurrentPrice = formatPriceInCents(currentPriceInCents);

  if (discountPercent === 0 || currentPriceInCents >= priceInCents) {
    return <p className={`text-medium font-medium text-title ${className}`}>{formattedCurrentPrice}</p>;
  }

  const formattedFullPrice = formatPriceInCents(priceInCents);

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Leitores de tela não anunciam o riscado do <del>, então a frase
          completa fica só para eles e a versão visual é escondida deles. */}
      <p className="sr-only">
        Desconto de {discountPercent}%: de {formattedFullPrice} por {formattedCurrentPrice}.
      </p>
      <span aria-hidden="true" className="rounded-md bg-cta px-2 py-1 text-medium font-medium text-on-accent">
        -{discountPercent}%
      </span>
      <span aria-hidden="true" className="flex flex-col items-end">
        <del className="text-small text-subtitle">{formattedFullPrice}</del>
        <span className="text-medium font-medium text-title">{formattedCurrentPrice}</span>
      </span>
    </div>
  );
}
