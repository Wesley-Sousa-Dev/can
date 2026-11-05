"use client";

import { ChevronLeft, ChevronRight, Expand, X } from "lucide-react";
import Image from "next/image";
import { useId, useRef, useState, type KeyboardEvent, type MouseEvent } from "react";

interface MediaGalleryProps {
  gameTitle: string;
  screenshotUrls: string[];
}

export function MediaGallery({ gameTitle, screenshotUrls }: MediaGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const lightboxRef = useRef<HTMLDialogElement>(null);
  const lightboxTitleId = useId();

  const totalScreenshots = screenshotUrls.length;
  if (totalScreenshots === 0) {
    return null;
  }
  const selectedScreenshotUrl = screenshotUrls[selectedIndex];

  function describeScreenshot(screenshotIndex: number): string {
    return `Captura de tela ${screenshotIndex + 1} de ${totalScreenshots} de ${gameTitle}`;
  }

  function showPreviousScreenshot() {
    setSelectedIndex((currentIndex) => (currentIndex - 1 + totalScreenshots) % totalScreenshots);
  }

  function showNextScreenshot() {
    setSelectedIndex((currentIndex) => (currentIndex + 1) % totalScreenshots);
  }

  // showModal() deixa o resto da página inerte, prende o foco na janela
  // e fecha com Esc. Ao fechar, o navegador devolve o foco ao botão "Ampliar".
  function openLightbox() {
    lightboxRef.current?.showModal();
  }

  function closeLightbox() {
    lightboxRef.current?.close();
  }

  // Clicar no fundo escuro (fora do conteúdo da janela) também fecha.
  function handleLightboxClick(event: MouseEvent<HTMLDialogElement>) {
    if (event.target === event.currentTarget) {
      closeLightbox();
    }
  }

  function handleLightboxKeyDown(event: KeyboardEvent<HTMLDialogElement>) {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      showPreviousScreenshot();
    }
    if (event.key === "ArrowRight") {
      event.preventDefault();
      showNextScreenshot();
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={openLightbox}
        className="group relative block w-full overflow-hidden rounded-lg bg-panel shadow-strong"
      >
        <span className="relative block aspect-video">
          {/* alt vazio porque o nome do botão já descreve a imagem. */}
          <Image
            src={selectedScreenshotUrl}
            alt=""
            fill
            sizes="(min-width: 1024px) 66vw, 100vw"
            loading="eager"
            fetchPriority="high"
            className="object-cover"
          />
        </span>
        <span className="absolute bottom-3 right-3 flex items-center gap-2 rounded-md bg-background-base px-3 py-2 text-small font-medium text-title shadow-medium group-hover:underline">
          <Expand aria-hidden="true" className="size-4" />
          Ampliar
        </span>
        <span className="sr-only">: {describeScreenshot(selectedIndex)}</span>
      </button>

      <div className="mt-3 flex items-center gap-2">
        <button
          type="button"
          onClick={showPreviousScreenshot}
          aria-label="Captura de tela anterior"
          className="grid size-11 shrink-0 place-items-center rounded-full border border-border-input text-title transition-colors hover:bg-card"
        >
          <ChevronLeft aria-hidden="true" className="size-6" />
        </button>

        <ul className="grid flex-1 grid-cols-4 gap-2">
          {screenshotUrls.map((screenshotUrl, screenshotIndex) => {
            const isSelected = screenshotIndex === selectedIndex;
            return (
              <li key={screenshotUrl}>
                <button
                  type="button"
                  onClick={() => setSelectedIndex(screenshotIndex)}
                  aria-label={`Mostrar captura de tela ${screenshotIndex + 1} de ${totalScreenshots}`}
                  aria-current={isSelected ? "true" : undefined}
                  className={`block w-full overflow-hidden rounded-md border-2 transition-colors ${
                    isSelected ? "border-primary-focus" : "border-transparent hover:border-border-input"
                  }`}
                >
                  <span className="relative block aspect-video">
                    <Image src={screenshotUrl} alt="" fill sizes="160px" className="object-cover" />
                  </span>
                </button>
              </li>
            );
          })}
        </ul>

        <button
          type="button"
          onClick={showNextScreenshot}
          aria-label="Próxima captura de tela"
          className="grid size-11 shrink-0 place-items-center rounded-full border border-border-input text-title transition-colors hover:bg-card"
        >
          <ChevronRight aria-hidden="true" className="size-6" />
        </button>
      </div>

      <dialog
        ref={lightboxRef}
        aria-labelledby={lightboxTitleId}
        onClick={handleLightboxClick}
        onKeyDown={handleLightboxKeyDown}
        className="m-auto w-full max-w-5xl overflow-auto rounded-lg bg-panel p-0 text-title shadow-strong backdrop:bg-background-base"
      >
        <div className="flex items-center justify-between gap-4 px-4 py-2">
          <h2 id={lightboxTitleId} className="text-medium font-medium">
            {describeScreenshot(selectedIndex)}
          </h2>
          <button
            type="button"
            onClick={closeLightbox}
            aria-label="Fechar"
            className="grid size-11 shrink-0 place-items-center rounded-full transition-colors hover:bg-card"
          >
            <X aria-hidden="true" className="size-6" />
          </button>
        </div>

        <div className="relative aspect-video">
          {/* Sem lazy loading: é o mesmo arquivo da galeria, já baixado, e assim
              a imagem aparece no instante em que a janela abre. */}
          <Image
            src={selectedScreenshotUrl}
            alt={describeScreenshot(selectedIndex)}
            fill
            sizes="(min-width: 1024px) 1024px, 100vw"
            loading="eager"
            className="object-contain"
          />
        </div>

        <div className="flex items-center justify-between gap-4 px-4 py-2">
          <button
            type="button"
            onClick={showPreviousScreenshot}
            className="flex min-h-11 items-center gap-2 rounded-md px-3 text-medium transition-colors hover:bg-card"
          >
            <ChevronLeft aria-hidden="true" className="size-5" />
            Anterior
          </button>
          {/* A dica só faz sentido onde há teclado físico. */}
          <p className="hidden text-small text-subtitle sm:block">
            Use as setas do teclado para navegar
          </p>
          <button
            type="button"
            onClick={showNextScreenshot}
            className="flex min-h-11 items-center gap-2 rounded-md px-3 text-medium transition-colors hover:bg-card"
          >
            Próxima
            <ChevronRight aria-hidden="true" className="size-5" />
          </button>
        </div>
      </dialog>
    </div>
  );
}
