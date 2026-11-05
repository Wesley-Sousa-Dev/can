import { CircleCheckBig } from "lucide-react";
import Link from "next/link";

import { CheckoutSteps } from "@/components/checkout/CheckoutSteps";
import { getPaymentMethodLabel } from "@/components/checkout/paymentMethods";
import { GameCover } from "@/components/game/GameCover";
import { calculatePriceTotals, formatPriceInCents } from "@/lib/pricing";
import type { Game } from "@/types/game";
import type { Order } from "@/types/order";

interface PurchaseConfirmationProps {
  order: Order;
  games: Game[];
  nickname: string;
}

// Função fora do componente: o React só chama um ref estável ao montar o
// elemento, então o foco vem para o título uma vez, logo depois da compra.
function focusOnMount(element: HTMLElement | null) {
  element?.focus();
}

interface OrderDetailProps {
  term: string;
  value: string;
}

function OrderDetail({ term, value }: OrderDetailProps) {
  return (
    <div>
      <dt className="text-small uppercase tracking-wide text-subtitle">{term}</dt>
      <dd className="text-medium font-medium text-title">{value}</dd>
    </div>
  );
}

export function PurchaseConfirmation({ order, games, nickname }: PurchaseConfirmationProps) {
  const { totalInCents } = calculatePriceTotals(games);

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-6 sm:px-6">
      <CheckoutSteps currentStep="confirmation" />

      <section className="flex flex-col items-start gap-5 rounded-lg bg-panel p-6 shadow-strong sm:p-8">
        <CircleCheckBig aria-hidden="true" className="size-12 text-cta" />
        <div className="flex flex-col gap-2">
          <h1
            ref={focusOnMount}
            tabIndex={-1}
            className="font-display text-xx-large text-title wrap-break-word sm:text-xxx-large"
          >
            Obrigado pela compra, {nickname}!
          </h1>
          <p className="text-medium text-title">
            Pagamento aprovado. Pode abrir a lata: os jogos já estão na sua biblioteca.
          </p>
        </div>

        <dl className="grid w-full gap-4 rounded-md bg-card p-4 sm:grid-cols-3">
          <OrderDetail term="Pedido" value={order.id} />
          <OrderDetail term="Pagamento" value={getPaymentMethodLabel(order.paymentMethod)} />
          <OrderDetail term="Total" value={formatPriceInCents(totalInCents)} />
        </dl>

        <div className="w-full">
          <h2 className="text-large font-medium text-title">Jogos adicionados à biblioteca</h2>
          <ul className="mt-3 grid gap-3 sm:grid-cols-2">
            {games.map((game) => (
              <li key={game.id} className="flex items-center gap-3 rounded-md bg-card p-2">
                <div className="w-24 shrink-0 overflow-hidden rounded-sm">
                  <GameCover imageUrl={game.coverImageUrl} sizes="96px" />
                </div>
                <span className="text-medium font-medium text-title">{game.title}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            href="/library"
            className="inline-flex min-h-11 items-center rounded-md bg-primary px-5 text-medium font-medium text-title transition-colors hover:bg-primary-hover"
          >
            Ir para a biblioteca
          </Link>
          <Link
            href="/"
            className="inline-flex min-h-11 items-center rounded-md border border-border-input px-5 text-medium font-medium text-title transition-colors hover:bg-card"
          >
            Continuar comprando
          </Link>
        </div>
      </section>
    </div>
  );
}
