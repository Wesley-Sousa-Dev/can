"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useId, useRef, useState, type FocusEvent, type PointerEvent } from "react";

import { GameCover } from "@/components/game/GameCover";
import { PriceTag } from "@/components/game/PriceTag";
import { formatShortDate } from "@/lib/dates";
import { formatCount, getReviewLabel } from "@/lib/reviews";
import { formatConjunctionList } from "@/lib/text";
import type { GameShowcase } from "@/types/game";

/** Quanto da grade a cápsula ocupa no desktop: metade, um terço ou um quarto. */
export type GameCapsuleSize = "large" | "medium" | "small";

interface GameCapsuleProps {
  game: GameShowcase;
  size: GameCapsuleSize;
}

interface CapsuleSizeSettings {
  titleClassName: string;
  /** Como o nome e o preço se arrumam na faixa de baixo da cápsula. */
  footerClassName: string;
  priceClassName: string;
  /** Larguras de cada imagem, no formato do atributo "sizes" do next/image. */
  coverSizes: string;
  screenshotSizes: string;
  expandedCoverSizes: string;
}

// Nome e preço dividem a mesma linha e só quebram quando não cabem.
const SIDE_BY_SIDE_FOOTER = "flex-wrap items-center justify-between gap-x-3 gap-y-1";

// A versão ampliada só existe no desktop, então abaixo dele as imagens dela
// pedem 1px e o navegador não baixa uma versão grande à toa.
const CAPSULE_SIZE_SETTINGS: Record<GameCapsuleSize, CapsuleSizeSettings> = {
  large: {
    titleClassName: "text-large",
    footerClassName: SIDE_BY_SIDE_FOOTER,
    priceClassName: "",
    coverSizes: "(min-width: 640px) 50vw, 100vw",
    screenshotSizes: "(min-width: 1024px) 55vw, 1px",
    expandedCoverSizes: "(min-width: 1024px) 22vw, 1px",
  },
  medium: {
    titleClassName: "text-medium",
    footerClassName: SIDE_BY_SIDE_FOOTER,
    priceClassName: "",
    coverSizes: "(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw",
    screenshotSizes: "(min-width: 1024px) 38vw, 1px",
    expandedCoverSizes: "(min-width: 1024px) 15vw, 1px",
  },
  // Em colunas estreitas, alguns nomes cabem ao lado do preço e outros não, e
  // a grade ficava desalinhada. A partir de duas colunas, o nome fica sempre em cima.
  small: {
    titleClassName: "text-medium",
    footerClassName: `${SIDE_BY_SIDE_FOOTER} sm:flex-col sm:flex-nowrap sm:items-stretch`,
    priceClassName: "sm:self-end",
    coverSizes: "(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw",
    screenshotSizes: "(min-width: 1024px) 30vw, 1px",
    expandedCoverSizes: "(min-width: 1024px) 12vw, 1px",
  },
};

// Um pequeno atraso evita que a cápsula cresça quando o mouse só passa por cima.
const EXPAND_DELAY_MS = 300;
const COLLAPSE_DELAY_MS = 150;
const TAGS_SHOWN = 4;

// Frase com o que a versão ampliada mostra, para o leitor de tela ouvir as
// mesmas informações sem precisar do mouse.
function describeExpandedContent(game: GameShowcase): string {
  const sentences = [`Marcadores: ${formatConjunctionList(game.tags.slice(0, TAGS_SHOWN))}.`];
  if (game.reviewSummary) {
    sentences.push(
      `Análises: ${getReviewLabel(game.reviewSummary)}, ${formatCount(game.reviewSummary.totalReviews)}.`,
    );
  }
  sentences.push(`Lançamento: ${formatShortDate(game.releaseDate)}.`);
  return sentences.join(" ");
}

// Cápsula de jogo como a da Steam: capa, nome e preço. Ao passar o mouse ou
// focar pelo teclado, ela cresce no lugar e mostra uma captura de tela, os
// marcadores, as análises e a data de lançamento.
// Segue a WCAG 1.4.13: o mouse pode passear pela versão ampliada, o Esc a
// fecha e ela só some quando o mouse ou o foco saem.
export function GameCapsule({ game, size }: GameCapsuleProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const timerRef = useRef<number | null>(null);
  const descriptionId = useId();
  const sizeSettings = CAPSULE_SIZE_SETTINGS[size];

  function clearTimer() {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }

  function expand() {
    clearTimer();
    setIsExpanded(true);
  }

  function collapse() {
    clearTimer();
    setIsExpanded(false);
  }

  function schedule(action: () => void, delayMs: number) {
    clearTimer();
    timerRef.current = window.setTimeout(action, delayMs);
  }

  // Só o mouse amplia: no toque, o primeiro toque já abre o jogo.
  function handlePointerEnter(event: PointerEvent<HTMLDivElement>) {
    if (event.pointerType === "mouse") {
      schedule(expand, EXPAND_DELAY_MS);
    }
  }

  function handlePointerLeave(event: PointerEvent<HTMLDivElement>) {
    if (event.pointerType === "mouse") {
      schedule(collapse, COLLAPSE_DELAY_MS);
    }
  }

  // Pelo teclado, a cápsula cresce junto com o foco visível.
  function handleFocus(event: FocusEvent<HTMLAnchorElement>) {
    if (event.currentTarget.matches(":focus-visible")) {
      expand();
    }
  }

  useEffect(() => {
    if (!isExpanded) {
      return;
    }
    function collapseOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsExpanded(false);
      }
    }
    document.addEventListener("keydown", collapseOnEscape);
    return () => document.removeEventListener("keydown", collapseOnEscape);
  }, [isExpanded]);

  // Cancela um atraso pendente se a cápsula sair da tela antes dele terminar.
  useEffect(() => {
    const timers = timerRef;
    return () => {
      if (timers.current !== null) {
        window.clearTimeout(timers.current);
      }
    };
  }, []);

  return (
    <div onPointerEnter={handlePointerEnter} onPointerLeave={handlePointerLeave} className="h-full">
      {/* A versão ampliada fica dentro do link: assim, quem recebe o foco é o
          próprio cartão ampliado, e nada cobre o elemento focado (WCAG 2.4.11). */}
      <Link
        href={`/games/${game.slug}`}
        aria-describedby={descriptionId}
        onFocus={handleFocus}
        onBlur={collapse}
        className="group relative flex h-full flex-col rounded-lg bg-background-base shadow-medium transition-shadow hover:shadow-strong"
      >
        <div className="overflow-hidden rounded-t-lg">
          <GameCover imageUrl={game.coverImageUrl} sizes={sizeSettings.coverSizes} />
        </div>
        <div className={`mt-auto flex px-3 py-2 ${sizeSettings.footerClassName}`}>
          <span className={`font-medium text-title ${sizeSettings.titleClassName}`}>{game.title}</span>
          <PriceTag
            priceInCents={game.priceInCents}
            discountPercent={game.discountPercent}
            className={sizeSettings.priceClassName}
          />
        </div>

        {/* Só visual: o leitor de tela já recebe o mesmo conteúdo pela descrição do link.
            No celular não aparece, porque não existe "passar o mouse". */}
        <div
          aria-hidden="true"
          className={`absolute -inset-x-6 -top-6 z-30 hidden flex-col overflow-hidden rounded-lg bg-panel shadow-strong transition duration-200 group-focus-visible:outline-2 group-focus-visible:outline-offset-2 group-focus-visible:outline-primary-focus lg:flex ${
            isExpanded ? "visible scale-100 opacity-100" : "invisible scale-95 opacity-0"
          }`}
        >
          <div className="relative">
            {game.screenshotUrls[0] && (
              <div className="relative aspect-video bg-card">
                <Image
                  src={game.screenshotUrls[0]}
                  alt=""
                  fill
                  sizes={sizeSettings.screenshotSizes}
                  className="object-cover"
                />
              </div>
            )}
            {/* Faixa do preço, com a capa sobreposta no canto, como na Steam. O
                preço fica nos 3/5 da direita para nunca passar por baixo da capa. */}
            <div className="flex min-h-12 items-center justify-end bg-background-base px-3 py-2">
              <div className="flex w-3/5 justify-end">
                <PriceTag priceInCents={game.priceInCents} discountPercent={game.discountPercent} />
              </div>
            </div>
            <div className="absolute bottom-0 left-0 w-2/5 overflow-hidden rounded-tr-md shadow-strong">
              <GameCover imageUrl={game.coverImageUrl} sizes={sizeSettings.expandedCoverSizes} />
            </div>
          </div>

          <div className="flex flex-col gap-2 p-3">
            <span className="text-large font-medium text-title">{game.title}</span>
            <ul className="flex flex-wrap gap-1">
              {game.tags.slice(0, TAGS_SHOWN).map((tag) => (
                <li key={tag} className="rounded-md border border-tag px-2 text-small text-tag">
                  {tag}
                </li>
              ))}
            </ul>
            {game.reviewSummary && (
              <span className="text-small text-subtitle">
                <span className="font-medium text-title">{getReviewLabel(game.reviewSummary)}</span> (
                {formatCount(game.reviewSummary.totalReviews)} análises)
              </span>
            )}
            <span className="text-small text-subtitle">
              Lançamento: <time dateTime={game.releaseDate}>{formatShortDate(game.releaseDate)}</time>
            </span>
          </div>
        </div>
      </Link>

      <span id={descriptionId} hidden>
        {describeExpandedContent(game)}
      </span>
    </div>
  );
}
