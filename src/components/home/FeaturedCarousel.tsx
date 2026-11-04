"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { GameCover } from "@/components/game/GameCover";
import { PriceTag } from "@/components/game/PriceTag";
import { SectionHeader } from "@/components/ui/SectionHeader";
import type { Game } from "@/types/game";

interface FeaturedCarouselProps {
  games: Game[];
}

const HEADING_ID = "featured-heading";

// Carrossel no padrão do W3C (APG). Ele não avança sozinho: rotação
// automática atrapalha quem lê devagar e exigiria um botão de pausa (WCAG 2.2.2).
export function FeaturedCarousel({ games }: FeaturedCarouselProps) {
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);

  if (games.length === 0) {
    return null;
  }

  const totalSlides = games.length;
  const activeGame = games[activeSlideIndex];
  // O primeiro destaque é a maior imagem visível ao abrir a página.
  const isInitialSlide = activeSlideIndex === 0;

  function showPreviousSlide() {
    setActiveSlideIndex((currentIndex) => (currentIndex - 1 + totalSlides) % totalSlides);
  }

  function showNextSlide() {
    setActiveSlideIndex((currentIndex) => (currentIndex + 1) % totalSlides);
  }

  return (
    <section id="featured" aria-labelledby={HEADING_ID} aria-roledescription="carrossel">
      <SectionHeader headingId={HEADING_ID} title="Destaques e recomendados" />

      {/* aria-live faz o leitor de tela anunciar o novo destaque a cada troca. */}
      <div aria-live="polite">
        <div
          key={activeGame.id}
          role="group"
          aria-roledescription="destaque"
          aria-label={`${activeSlideIndex + 1} de ${totalSlides}`}
          className="group relative grid overflow-hidden rounded-lg bg-panel shadow-strong motion-safe:animate-fade-in lg:grid-cols-3 has-[a:focus-visible]:outline-2 has-[a:focus-visible]:outline-offset-2 has-[a:focus-visible]:outline-primary-focus"
        >
          <div className="lg:col-span-2">
            <GameCover
              imageUrl={activeGame.coverImageUrl}
              sizes="(min-width: 1024px) 66vw, 100vw"
              isAboveTheFold={isInitialSlide}
            />
          </div>

          <div className="flex flex-col gap-4 p-5 lg:p-6">
            <h3 className="font-display text-x-large text-title lg:text-xx-large">
              <Link
                href={`/games/${activeGame.slug}`}
                className="after:absolute after:inset-0 group-hover:text-primary-focus focus-visible:outline-none"
              >
                {activeGame.title}
              </Link>
            </h3>
            <p className="text-medium text-subtitle">{activeGame.shortDescription}</p>
            <ul aria-label="Gêneros" className="flex flex-wrap gap-2">
              {activeGame.genres.map((genre) => (
                <li
                  key={genre.id}
                  className="rounded-md border border-tag px-2 text-small text-tag"
                >
                  {genre.name}
                </li>
              ))}
            </ul>
            <PriceTag
              priceInCents={activeGame.priceInCents}
              discountPercent={activeGame.discountPercent}
              className="mt-auto self-end"
            />
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-center gap-2">
        <button
          type="button"
          onClick={showPreviousSlide}
          aria-label="Destaque anterior"
          className="grid size-11 place-items-center rounded-full border border-border-input text-title transition-colors hover:bg-card"
        >
          <ChevronLeft aria-hidden="true" className="size-6" />
        </button>

        <div role="group" aria-label="Escolher destaque" className="flex">
          {games.map((game, slideIndex) => {
            const isActiveSlide = slideIndex === activeSlideIndex;
            return (
              // Área de toque de 44px (WCAG 2.5.5); o indicador visual é menor.
              <button
                key={game.id}
                type="button"
                onClick={() => setActiveSlideIndex(slideIndex)}
                aria-label={`Destaque ${slideIndex + 1}: ${game.title}`}
                aria-current={isActiveSlide ? "true" : undefined}
                className="grid h-11 w-8 place-items-center"
              >
                <span
                  aria-hidden="true"
                  className={`h-2 rounded-full transition-all ${
                    isActiveSlide ? "w-6 bg-primary-focus" : "w-2 bg-border-input"
                  }`}
                />
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={showNextSlide}
          aria-label="Próximo destaque"
          className="grid size-11 place-items-center rounded-full border border-border-input text-title transition-colors hover:bg-card"
        >
          <ChevronRight aria-hidden="true" className="size-6" />
        </button>
      </div>
    </section>
  );
}
