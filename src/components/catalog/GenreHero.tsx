import Image from "next/image";

import { formatGameCount } from "@/lib/text";
import type { Genre } from "@/types/game";

interface GenreHeroProps {
  genre: Genre;
  gameCount: number;
  /** Captura de tela do jogo mais popular do gênero, usada de fundo. */
  backgroundImageUrl?: string;
}

// Topo da página de gênero, com o nome bem grande, como o "RPGS" da Steam.
export function GenreHero({ genre, gameCount, backgroundImageUrl }: GenreHeroProps) {
  return (
    <div className="relative isolate overflow-hidden rounded-lg bg-panel shadow-strong">
      {backgroundImageUrl && (
        <Image
          src={backgroundImageUrl}
          alt=""
          fill
          sizes="(min-width: 1152px) 1104px, 100vw"
          loading="eager"
          className="-z-20 object-cover opacity-30 blur-xs"
        />
      )}
      {/* Escurece a imagem por inteiro para o texto ter contraste em qualquer ponto. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-linear-to-t from-background-base to-background-base/50"
      />
      <div className="flex min-h-48 flex-col items-center justify-center gap-2 px-6 py-10 text-center sm:min-h-64">
        <p className="text-small font-medium uppercase tracking-widest text-subtitle">Gênero</p>
        <h1 className="font-display text-xxx-large uppercase text-title wrap-break-word sm:text-xxxx-large">
          {genre.name}
        </h1>
        <p className="text-medium text-title">{formatGameCount(gameCount)} na loja</p>
      </div>
    </div>
  );
}
