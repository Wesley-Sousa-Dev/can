"use client";

import { Check, Heart, LogIn, ShoppingCart } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useId, useRef, useState } from "react";
import { flushSync } from "react-dom";

import { PriceTag } from "@/components/game/PriceTag";
import { useGameCollection } from "@/hooks/useGameCollection";
import { useSession } from "@/hooks/useSession";
import type { PurchaseOption } from "@/lib/gameAvailability";
import { withRedirect } from "@/lib/safeRedirect";
import { formatConjunctionList } from "@/lib/text";
import { ApiError } from "@/services/apiClient";
import { cartCollection, libraryCollection, wishlistCollection } from "@/services/userCollections";
import type { Game, Platform } from "@/types/game";

interface PurchaseBoxProps {
  game: Game & { platforms: Platform[] };
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

const SECONDARY_BUTTON_CLASS =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border px-5 text-medium font-medium text-title transition-colors hover:bg-card";

function describeFailure(error: unknown): string {
  return error instanceof ApiError ? error.message : "Algo deu errado. Tente de novo.";
}

export function PurchaseBox({ game, purchaseOption }: PurchaseBoxProps) {
  const pathname = usePathname();
  const session = useSession();
  const cart = useGameCollection(cartCollection);
  const wishlist = useGameCollection(wishlistCollection);
  const library = useGameCollection(libraryCollection);
  const [statusMessage, setStatusMessage] = useState("");
  const completedActionLinkRef = useRef<HTMLAnchorElement>(null);
  const headingId = useId();

  const isSignedIn = session.status === "signed-in";
  const isInCart = cart.hasGame(game.id);
  const isInLibrary = library.hasGame(game.id);
  const isWishlisted = wishlist.hasGame(game.id);
  const canBuy = purchaseOption === "buy" || purchaseOption === "free";
  const platformNames = formatConjunctionList(game.platforms.map((platform) => PLATFORM_NAMES[platform]));

  const headingByOption: Record<PurchaseOption, string> = {
    buy: `Comprar ${game.title}`,
    free: `Obter ${game.title}`,
    unavailable: `${game.title} está sem preço no momento`,
  };
  // Um jogo já comprado não deve continuar dizendo "Comprar".
  const heading = isInLibrary ? `Você já tem ${game.title}` : headingByOption[purchaseOption];

  // O botão some e dá lugar a um link. Sem isso, o foco do teclado iria para
  // o início da página. O flushSync aplica a mudança na hora para o link
  // novo já existir e receber o foco. Se a API recusar, o botão volta.
  function addToCart() {
    // A coleção muda na hora (antes da resposta da API), então o flushSync já mostra o link.
    const request = flushSync(() => {
      setStatusMessage(`${game.title} foi adicionado ao carrinho.`);
      return cart.addGame(game);
    });
    completedActionLinkRef.current?.focus();
    request.catch((error: unknown) => {
      setStatusMessage(`Não foi possível adicionar ${game.title} ao carrinho. ${describeFailure(error)}`);
    });
  }

  function toggleWishlist() {
    const request = isWishlisted ? wishlist.removeGame(game.id) : wishlist.addGame(game);
    setStatusMessage(
      isWishlisted
        ? `${game.title} foi removido da lista de desejos.`
        : `${game.title} foi adicionado à lista de desejos.`,
    );
    request.catch((error: unknown) => {
      setStatusMessage(`Não foi possível atualizar a lista de desejos. ${describeFailure(error)}`);
    });
  }

  function renderSignedInActions() {
    // Jogo já comprado: não faz sentido comprar de novo.
    if (isInLibrary) {
      return (
        <Link ref={completedActionLinkRef} href="/library" className={DONE_LINK_CLASS}>
          <Check aria-hidden="true" className="size-5 text-cta" />
          Na biblioteca: ver biblioteca
        </Link>
      );
    }
    return (
      <>
        {canBuy &&
          (isInCart ? (
            <Link ref={completedActionLinkRef} href="/cart" className={DONE_LINK_CLASS}>
              <Check aria-hidden="true" className="size-5 text-cta" />
              No carrinho: ver carrinho
            </Link>
          ) : (
            <button type="button" onClick={addToCart} className={CTA_BUTTON_CLASS}>
              <ShoppingCart aria-hidden="true" className="size-5" />
              Adicionar ao carrinho
            </button>
          ))}
        {/* Botão de alternância: aria-pressed informa se o jogo já está na lista. */}
        <button
          type="button"
          onClick={toggleWishlist}
          aria-pressed={isWishlisted}
          className={`${SECONDARY_BUTTON_CLASS} ${isWishlisted ? "border-primary-focus bg-card" : "border-border-input"}`}
        >
          <Heart aria-hidden="true" className={`size-5 ${isWishlisted ? "fill-primary-focus text-primary-focus" : ""}`} />
          Lista de desejos
        </button>
      </>
    );
  }

  return (
    <section aria-labelledby={headingId} className="rounded-lg bg-panel p-5 shadow-medium">
      <h2 id={headingId} className="font-display text-x-large text-title wrap-break-word">
        {heading}
      </h2>
      {game.platforms.length > 0 && (
        <p className="mt-1 text-small text-subtitle">Disponível para {platformNames}</p>
      )}
      {purchaseOption === "unavailable" && (
        <p className="mt-1 text-medium text-title">
          A loja não informou o preço em reais deste jogo, então ele ainda não pode ser comprado.
        </p>
      )}

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end">
        {canBuy && !isInLibrary && <PriceTag price={game} className="self-end sm:mr-2 sm:self-auto" />}
        {isSignedIn ? (
          renderSignedInActions()
        ) : (
          // Carrinho e lista de desejos ficam na conta. Depois de entrar, a pessoa volta para cá.
          <Link
            href={withRedirect("/login", pathname)}
            aria-busy={session.status === "loading"}
            className={canBuy ? CTA_BUTTON_CLASS : `${SECONDARY_BUTTON_CLASS} border-border-input`}
          >
            <LogIn aria-hidden="true" className="size-5" />
            {canBuy ? "Entre para comprar" : "Entre para salvar na lista de desejos"}
          </Link>
        )}
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
