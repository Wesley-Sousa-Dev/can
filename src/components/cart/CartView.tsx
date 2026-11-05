"use client";

import { ArrowLeft, ShoppingCart } from "lucide-react";
import Link from "next/link";
import { useRef, useState } from "react";
import { flushSync } from "react-dom";

import { CartItemRow, getCartTitleLinkId } from "@/components/cart/CartItemRow";
import { CheckoutSteps } from "@/components/checkout/CheckoutSteps";
import { OrderSummary } from "@/components/checkout/OrderSummary";
import { useGameCollection } from "@/hooks/useGameCollection";
import { useSession } from "@/hooks/useSession";
import { formatGameCount } from "@/lib/text";
import { cartCollection } from "@/services/userCollections";
import type { Game } from "@/types/game";

interface CartViewProps {
  games: Game[];
}

const CTA_LINK_CLASS =
  "inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-md bg-cta px-5 text-medium font-medium text-on-accent shadow-soft underline-offset-4 transition-shadow hover:underline hover:shadow-strong";

const SECONDARY_ACTION_CLASS =
  "inline-flex min-h-11 items-center gap-2 rounded-md px-2 text-medium font-medium text-primary-focus underline underline-offset-4 hover:text-title";

export function CartView({ games }: CartViewProps) {
  const session = useSession();
  const cart = useGameCollection(cartCollection);
  const [statusMessage, setStatusMessage] = useState("");
  const emptyCartHeadingRef = useRef<HTMLHeadingElement>(null);

  // O carrinho mora no navegador: no HTML do servidor ele ainda não existe.
  // Sem esta espera, a tela piscaria "carrinho vazio" antes de carregar.
  if (session.status === "loading") {
    return (
      <p aria-busy="true" className="mx-auto max-w-6xl px-4 py-16 text-medium text-subtitle sm:px-6">
        Carregando carrinho...
      </p>
    );
  }

  const gamesById = new Map(games.map((game) => [game.id, game]));
  const cartGames = cart.gameIds.flatMap((gameId) => gamesById.get(gameId) ?? []);

  // Depois de remover, o foco vai para o jogo seguinte (ou o anterior, se era
  // o último). Com o carrinho vazio, vai para a mensagem de carrinho vazio.
  function removeGame(game: Game) {
    const gameIndex = cartGames.findIndex((cartGame) => cartGame.id === game.id);
    const nextFocusedGame = cartGames[gameIndex + 1] ?? cartGames[gameIndex - 1];
    flushSync(() => {
      cart.removeGame(game.id);
      setStatusMessage(`${game.title} foi removido do carrinho.`);
    });
    if (nextFocusedGame) {
      document.getElementById(getCartTitleLinkId(nextFocusedGame.id))?.focus();
    } else {
      emptyCartHeadingRef.current?.focus();
    }
  }

  function removeAllGames() {
    flushSync(() => {
      cartCollection.clear();
      setStatusMessage("Todos os jogos foram removidos do carrinho.");
    });
    emptyCartHeadingRef.current?.focus();
  }

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-6 sm:px-6">
      <CheckoutSteps currentStep="cart" />
      <h1 className="font-display text-xx-large uppercase text-title sm:text-xxx-large">Seu carrinho</h1>

      {/* Confirmações das ações. Fica sempre no HTML, mesmo vazia, para ser anunciada (WCAG 4.1.3). */}
      <p role="status" className="-mt-3 min-h-6 text-small text-title">
        {statusMessage}
      </p>

      {cartGames.length === 0 ? (
        <div className="flex flex-col items-start gap-3 rounded-lg border border-dashed border-border-input p-6">
          <ShoppingCart aria-hidden="true" className="size-8 text-primary-focus" />
          <h2 ref={emptyCartHeadingRef} tabIndex={-1} className="font-display text-x-large text-title">
            Seu carrinho está vazio
          </h2>
          <p className="text-medium text-subtitle">
            Adicione jogos pela página de cada um ou pela sua lista de desejos.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/"
              className="inline-flex min-h-11 items-center rounded-md bg-primary px-4 text-medium font-medium text-title transition-colors hover:bg-primary-hover"
            >
              Explorar a loja
            </Link>
            <Link
              href="/wishlist"
              className="inline-flex min-h-11 items-center rounded-md border border-border-input px-4 text-medium font-medium text-title transition-colors hover:bg-card"
            >
              Ver lista de desejos
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3 lg:items-start">
          <section aria-label="Jogos no carrinho" className="flex flex-col gap-3 lg:col-span-2">
            <p className="text-small font-medium uppercase tracking-wide text-subtitle">
              {formatGameCount(cartGames.length)}
            </p>
            <ul className="flex flex-col gap-3">
              {cartGames.map((game) => (
                <li key={game.id}>
                  <CartItemRow game={game} onRemove={() => removeGame(game)} />
                </li>
              ))}
            </ul>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <Link href="/" className={SECONDARY_ACTION_CLASS}>
                <ArrowLeft aria-hidden="true" className="size-5" />
                Continuar comprando
              </Link>
              <button type="button" onClick={removeAllGames} className={SECONDARY_ACTION_CLASS}>
                Remover todos os jogos
              </button>
            </div>
          </section>

          {/* No desktop, o resumo acompanha a rolagem para o botão de compra estar sempre à mão. */}
          <div className="lg:sticky lg:top-6">
            <OrderSummary headingId="cart-summary-heading" games={cartGames}>
              <Link href="/checkout" className={CTA_LINK_CLASS}>
                Finalizar compra
              </Link>
              {session.status === "signed-out" && (
                <p className="text-small text-subtitle">
                  Você vai precisar entrar na sua conta para concluir a compra.
                </p>
              )}
            </OrderSummary>
          </div>
        </div>
      )}
    </div>
  );
}
