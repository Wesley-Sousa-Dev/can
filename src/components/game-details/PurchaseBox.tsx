"use client";

import { Check, Heart, Plus, ShoppingCart } from "lucide-react";
import Link from "next/link";
import { useId, useRef, useState } from "react";
import { flushSync } from "react-dom";

import { PriceTag } from "@/components/game/PriceTag";
import { useGameCollection } from "@/hooks/useGameCollection";
import { formatReleaseDate } from "@/lib/dates";
import type { PurchaseOption } from "@/lib/gameAvailability";
import { formatConjunctionList } from "@/lib/text";
import {
  cartCollection,
  libraryCollection,
  wishlistCollection,
} from "@/services/userCollections";
import type { Platform } from "@/types/game";

interface PurchaseBoxProps {
  gameId: string;
  gameTitle: string;
  priceInCents: number;
  discountPercent: number;
  platforms: Platform[];
  releaseDate: string;
  purchaseOption: PurchaseOption;
}

const PLATFORM_NAMES: Record<Platform, string> = {
  windows: "Windows",
  macos: "macOS",
  linux: "Linux",
};

const CTA_BUTTON_CLASS =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-cta px-5 text-medium font-medium text-on-accent shadow-soft underline-offset-4 transition-shadow hover:underline hover:shadow-strong";

const DONE_LINK_CLASS =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-cta px-5 text-medium font-medium text-title underline-offset-4 transition-colors hover:bg-card hover:underline";

export function PurchaseBox({
  gameId,
  gameTitle,
  priceInCents,
  discountPercent,
  platforms,
  releaseDate,
  purchaseOption,
}: PurchaseBoxProps) {
  const cart = useGameCollection(cartCollection);
  const wishlist = useGameCollection(wishlistCollection);
  const library = useGameCollection(libraryCollection);
  const [statusMessage, setStatusMessage] = useState("");
  const completedActionLinkRef = useRef<HTMLAnchorElement>(null);
  const headingId = useId();

  const isInCart = cart.hasGame(gameId);
  const isInLibrary = library.hasGame(gameId);
  const isWishlisted = wishlist.hasGame(gameId);
  const platformNames = formatConjunctionList(platforms.map((platform) => PLATFORM_NAMES[platform]));

  const headingByOption: Record<PurchaseOption, string> = {
    buy: `Comprar ${gameTitle}`,
    free: `Jogar ${gameTitle}`,
    upcoming: `${gameTitle} chega em breve`,
  };
  // Um jogo pago já comprado não deve continuar dizendo "Comprar".
  const heading =
    purchaseOption === "buy" && isInLibrary ? `Você já tem ${gameTitle}` : headingByOption[purchaseOption];

  // O botão some e dá lugar a um link. Sem isso, o foco do teclado iria para
  // o início da página. O flushSync aplica a mudança na hora para o link
  // novo já existir e receber o foco.
  function runAndFocusCompletedAction(action: () => void) {
    flushSync(action);
    completedActionLinkRef.current?.focus();
  }

  function addToCart() {
    runAndFocusCompletedAction(() => {
      cart.addGame(gameId);
      setStatusMessage(`${gameTitle} foi adicionado ao carrinho.`);
    });
  }

  function addToLibrary() {
    runAndFocusCompletedAction(() => {
      library.addGame(gameId);
      setStatusMessage(`${gameTitle} foi adicionado à sua biblioteca.`);
    });
  }

  function toggleWishlist() {
    if (isWishlisted) {
      wishlist.removeGame(gameId);
      setStatusMessage(`${gameTitle} foi removido da lista de desejos.`);
    } else {
      wishlist.addGame(gameId);
      setStatusMessage(`${gameTitle} foi adicionado à lista de desejos.`);
    }
  }

  function renderMainAction() {
    if (purchaseOption === "upcoming") {
      return null;
    }

    // Jogo já comprado (ou gratuito já adicionado): não faz sentido comprar de novo.
    if (isInLibrary) {
      return (
        <Link ref={completedActionLinkRef} href="/library" className={DONE_LINK_CLASS}>
          <Check aria-hidden="true" className="size-5 text-cta" />
          Na biblioteca: ver biblioteca
        </Link>
      );
    }

    if (purchaseOption === "free") {
      return (
        <button type="button" onClick={addToLibrary} className={CTA_BUTTON_CLASS}>
          <Plus aria-hidden="true" className="size-5" />
          Adicionar à biblioteca
        </button>
      );
    }

    return isInCart ? (
      <Link ref={completedActionLinkRef} href="/cart" className={DONE_LINK_CLASS}>
        <Check aria-hidden="true" className="size-5 text-cta" />
        No carrinho: ver carrinho
      </Link>
    ) : (
      <button type="button" onClick={addToCart} className={CTA_BUTTON_CLASS}>
        <ShoppingCart aria-hidden="true" className="size-5" />
        Adicionar ao carrinho
      </button>
    );
  }

  return (
    <section aria-labelledby={headingId} className="rounded-lg bg-panel p-5 shadow-medium">
      <h2 id={headingId} className="font-display text-x-large text-title">
        {heading}
      </h2>
      <p className="mt-1 text-small text-subtitle">Disponível para {platformNames}</p>
      {purchaseOption === "upcoming" && (
        <p className="mt-1 text-medium text-title">
          Lançamento previsto para{" "}
          <time dateTime={releaseDate}>{formatReleaseDate(releaseDate)}</time>. Adicione à
          lista de desejos para acompanhar.
        </p>
      )}

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end">
        {purchaseOption !== "upcoming" && !isInLibrary && (
          <PriceTag
            priceInCents={priceInCents}
            discountPercent={discountPercent}
            className="self-end sm:mr-2 sm:self-auto"
          />
        )}
        {renderMainAction()}
        {/* Botão de alternância: aria-pressed informa se o jogo já está na lista. */}
        <button
          type="button"
          onClick={toggleWishlist}
          aria-pressed={isWishlisted}
          className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-md border px-5 text-medium font-medium text-title transition-colors hover:bg-card ${
            isWishlisted ? "border-primary-focus bg-card" : "border-border-input"
          }`}
        >
          <Heart
            aria-hidden="true"
            className={`size-5 ${isWishlisted ? "fill-primary-focus text-primary-focus" : ""}`}
          />
          Lista de desejos
        </button>
      </div>

      {/* Mensagem de status: o leitor de tela anuncia sem tirar o foco do lugar (WCAG 4.1.3).
          Ela fica sempre no HTML, mesmo vazia, porque uma região que só aparece
          junto com o texto pode não ser anunciada. */}
      <p role="status" className="mt-3 text-small text-subtitle">
        {statusMessage}
      </p>
    </section>
  );
}
