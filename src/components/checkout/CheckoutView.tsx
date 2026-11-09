"use client";

import { ArrowLeft, LockKeyhole, ShoppingCart } from "lucide-react";
import Link from "next/link";
import { useRef, useState, type FormEvent } from "react";
import { flushSync } from "react-dom";

import { CollectionPageState } from "@/components/account/CollectionPageState";
import { CheckoutSteps } from "@/components/checkout/CheckoutSteps";
import { OrderSummary } from "@/components/checkout/OrderSummary";
import { FIRST_PAYMENT_OPTION_ID, PaymentMethodField } from "@/components/checkout/PaymentMethodField";
import { PurchaseConfirmation } from "@/components/checkout/PurchaseConfirmation";
import { ErrorSummary, type ErrorSummaryItem } from "@/components/forms/ErrorSummary";
import { SubmitButton } from "@/components/forms/SubmitButton";
import { useCollectionGames } from "@/hooks/useCollectionGames";
import { withRedirect } from "@/lib/safeRedirect";
import { ApiError } from "@/services/apiClient";
import { placeOrder } from "@/services/checkoutService";
import { cartCollection } from "@/services/userCollections";
import type { Game } from "@/types/game";
import type { Order, PaymentMethod } from "@/types/order";

interface CompletedPurchase {
  order: Order;
  games: Game[];
}

const SUBMIT_BUTTON_ID = "checkout-submit";
const MISSING_PAYMENT_METHOD_MESSAGE = "Escolha uma forma de pagamento para finalizar a compra.";
const ORDER_FAILED_MESSAGE =
  "O pagamento não foi concluído e nada foi cobrado. Confira a forma de pagamento e tente de novo.";

const PAGE_CLASS = "mx-auto flex max-w-6xl flex-col gap-6 px-4 py-6 sm:px-6";

const PRIMARY_LINK_CLASS =
  "inline-flex min-h-11 items-center rounded-md bg-primary px-5 text-medium font-medium text-title transition-colors hover:bg-primary-hover";

const SECONDARY_LINK_CLASS =
  "inline-flex min-h-11 items-center rounded-md border border-border-input px-5 text-medium font-medium text-title transition-colors hover:bg-card";

const BACK_TO_CART_CLASS =
  "inline-flex min-h-11 items-center gap-2 self-start rounded-md px-2 text-medium font-medium text-primary-focus underline underline-offset-4 hover:text-title";

function SignInRequired() {
  const checkoutPath = "/checkout";
  return (
    <div className={PAGE_CLASS}>
      <CheckoutSteps currentStep="payment" />
      <div className="flex max-w-2xl flex-col items-start gap-4">
        <h1 className="font-display text-xx-large text-title sm:text-xxx-large">Entre para finalizar a compra</h1>
        <p className="text-medium text-title">
          O carrinho e os jogos comprados ficam na sua conta. Entre para escolher os jogos e finalizar a
          compra.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link href={withRedirect("/login", checkoutPath)} className={PRIMARY_LINK_CLASS}>
            Entrar
          </Link>
          <Link href={withRedirect("/signup", checkoutPath)} className={SECONDARY_LINK_CLASS}>
            Criar conta
          </Link>
        </div>
        <Link href="/cart" className={BACK_TO_CART_CLASS}>
          <ArrowLeft aria-hidden="true" className="size-5" />
          Voltar ao carrinho
        </Link>
      </div>
    </div>
  );
}

function EmptyCheckout() {
  return (
    <div className={PAGE_CLASS}>
      <CheckoutSteps currentStep="payment" />
      <div className="flex flex-col items-start gap-3 rounded-lg border border-dashed border-border-input p-6">
        <ShoppingCart aria-hidden="true" className="size-8 text-primary-focus" />
        <h1 className="font-display text-xx-large text-title">Não há jogos para comprar</h1>
        <p className="text-medium text-subtitle">Seu carrinho está vazio. Escolha um jogo na loja para continuar.</p>
        <Link href="/" className={PRIMARY_LINK_CLASS}>
          Explorar a loja
        </Link>
      </div>
    </div>
  );
}

// O pedido recusado pela API (ex.: carrinho mudou em outra aba) traz o motivo;
// uma falha de rede usa a mensagem padrão.
function describeOrderFailure(error: unknown): string {
  return error instanceof ApiError && error.status >= 400 && error.status < 500 ? error.message : ORDER_FAILED_MESSAGE;
}

export function CheckoutView() {
  const { session, games: cartGames, viewState, retry } = useCollectionGames(cartCollection);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null);
  const [hasTriedToSubmit, setHasTriedToSubmit] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);
  // Jogos sendo comprados. A compra esvazia o carrinho antes da confirmação
  // aparecer; guardar a lista evita que a tela pisque "carrinho vazio" no meio.
  const [gamesBeingPurchased, setGamesBeingPurchased] = useState<Game[] | null>(null);
  const [completedPurchase, setCompletedPurchase] = useState<CompletedPurchase | null>(null);
  const errorSummaryRef = useRef<HTMLDivElement>(null);

  if (completedPurchase && session.status === "signed-in") {
    return (
      <PurchaseConfirmation
        order={completedPurchase.order}
        games={completedPurchase.games}
        nickname={session.user.nickname}
      />
    );
  }

  if (viewState === "signed-out") {
    return <SignInRequired />;
  }

  // O carrinho vem da API depois que a página abre. Durante a compra, a lista
  // guardada em gamesBeingPurchased segura a tela enquanto o carrinho recarrega.
  if (viewState !== "ready" && gamesBeingPurchased === null) {
    return (
      <CollectionPageState
        viewState={viewState}
        title="Finalizar compra"
        loadingText="Carregando seu carrinho..."
        signInText=""
        onRetry={retry}
      />
    );
  }

  const checkoutGames = gamesBeingPurchased ?? cartGames;
  const isSubmitting = gamesBeingPurchased !== null;

  if (checkoutGames.length === 0) {
    return <EmptyCheckout />;
  }

  const paymentMethodError = hasTriedToSubmit && !paymentMethod ? MISSING_PAYMENT_METHOD_MESSAGE : null;
  const errorSummaryItems: ErrorSummaryItem[] = orderError
    ? [{ fieldId: SUBMIT_BUTTON_ID, message: orderError }]
    : paymentMethodError
      ? [{ fieldId: FIRST_PAYMENT_OPTION_ID, message: paymentMethodError }]
      : [];

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting) {
      return;
    }

    if (!paymentMethod) {
      // flushSync coloca o resumo na tela na hora, para ele já poder receber o foco.
      flushSync(() => {
        setOrderError(null);
        setHasTriedToSubmit(true);
      });
      errorSummaryRef.current?.focus();
      return;
    }

    setOrderError(null);
    setGamesBeingPurchased(cartGames);
    try {
      const order = await placeOrder({ gameIds: cartGames.map((game) => game.id), paymentMethod });
      // O conteúdo da página muda por completo, então o título da aba muda junto (WCAG 2.4.2).
      document.title = "Compra concluída | Can";
      setCompletedPurchase({ order, games: cartGames });
    } catch (error) {
      // Uma recusa da API ou uma falha de rede chega aqui. Nada foi cobrado.
      flushSync(() => {
        setGamesBeingPurchased(null);
        setOrderError(describeOrderFailure(error));
      });
      errorSummaryRef.current?.focus();
    }
  }

  return (
    <div className={PAGE_CLASS}>
      <CheckoutSteps currentStep="payment" />
      <h1 className="font-display text-xx-large uppercase text-title sm:text-xxx-large">Finalizar compra</h1>

      {/* O formulário envolve o resumo para o botão de compra ficar logo abaixo do
          total, inclusive no celular, onde o resumo aparece depois das opções. */}
      <form noValidate onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-3 lg:items-start">
        <div className="flex flex-col gap-5 lg:col-span-2">
          <ErrorSummary
            ref={errorSummaryRef}
            title={orderError ? "Não foi possível concluir a compra" : "Falta um passo para finalizar"}
            items={errorSummaryItems}
          />
          <p className="text-small text-subtitle">Campos com * são obrigatórios.</p>
          <PaymentMethodField
            value={paymentMethod}
            error={paymentMethodError}
            onChange={(selectedPaymentMethod) => {
              setPaymentMethod(selectedPaymentMethod);
              setOrderError(null);
            }}
          />
          <p className="flex items-start gap-2 text-small text-subtitle">
            <LockKeyhole aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
            O pagamento é feito no ambiente seguro do nosso parceiro de pagamento. Neste projeto ele é
            simulado: nenhum valor é cobrado de verdade.
          </p>
        </div>

        <div className="lg:sticky lg:top-6">
          <OrderSummary headingId="checkout-summary-heading" games={checkoutGames} showGameList>
            <SubmitButton
              id={SUBMIT_BUTTON_ID}
              variant="cta"
              label="Finalizar compra"
              loadingLabel="Processando pagamento..."
              isLoading={isSubmitting}
            />
            <Link href="/cart" className={BACK_TO_CART_CLASS}>
              <ArrowLeft aria-hidden="true" className="size-5" />
              Voltar ao carrinho
            </Link>
          </OrderSummary>
        </div>
      </form>
    </div>
  );
}
