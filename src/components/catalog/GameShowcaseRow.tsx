import Image from "next/image";
import Link from "next/link";

import { GameCover } from "@/components/game/GameCover";
import { PriceTag } from "@/components/game/PriceTag";
import type { GameShowcase } from "@/types/game";

interface GameShowcaseRowProps {
  game: GameShowcase;
}

const THUMBNAILS_SHOWN = 3;
// A Steam manda de 10 a 15 marcadores por jogo; como na lista dela, só os primeiros aparecem.
const TAGS_SHOWN = 6;

// Linha detalhada da lista de um gênero, como a da Steam: capa, descrição,
// ficha, capturas de tela e uma faixa com o preço.
export function GameShowcaseRow({ game }: GameShowcaseRowProps) {
  const titleId = `showcase-title-${game.id}`;
  const gamePageUrl = `/games/${game.id}`;
  const thumbnailUrls = game.screenshotUrls.slice(0, THUMBNAILS_SHOWN);

  return (
    <article aria-labelledby={titleId} className="overflow-hidden rounded-lg bg-card shadow-medium">
      <div className="grid gap-4 p-4 md:grid-cols-[13rem_1fr]">
        <div className="flex flex-col gap-2 self-start">
          {/* A capa repete o link do título, então fica fora do teclado e do leitor de tela. */}
          <Link href={gamePageUrl} tabIndex={-1} aria-hidden="true" className="group block overflow-hidden rounded-md">
            <GameCover imageUrl={game.coverImageUrl} sizes="(min-width: 768px) 208px, 90vw" />
          </Link>
          {/* Capturas de tela decorativas: a página do jogo tem a galeria completa. */}
          {thumbnailUrls.length > 0 && (
            <div aria-hidden="true" className="hidden grid-cols-3 gap-2 md:grid">
              {thumbnailUrls.map((thumbnailUrl) => (
                <div key={thumbnailUrl} className="relative aspect-video overflow-hidden rounded-sm bg-panel">
                  <Image src={thumbnailUrl} alt="" fill sizes="64px" className="object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex min-w-0 flex-col gap-3">
          <h3 className="font-display text-x-large text-title">
            <Link id={titleId} href={gamePageUrl} className="underline-offset-4 hover:text-primary-focus hover:underline">
              {game.title}
            </Link>
          </h3>
          <p className="text-medium text-title">{game.shortDescription}</p>

          <dl className="grid gap-x-3 gap-y-1 text-small sm:grid-cols-[auto_1fr]">
            <dt className="uppercase text-subtitle">Marcadores</dt>
            <dd>
              <ul className="flex flex-wrap gap-1">
                {game.tags.slice(0, TAGS_SHOWN).map((tag) => (
                  <li key={tag} className="rounded-md border border-tag px-2 text-tag">
                    {tag}
                  </li>
                ))}
              </ul>
            </dd>
            <dt className="uppercase text-subtitle">Desenvolvido por</dt>
            <dd className="text-title">{game.developer || "Não informado"}</dd>
            <dt className="uppercase text-subtitle">Distribuído por</dt>
            <dd className="text-title">{game.publisher || "Não informado"}</dd>
          </dl>
        </div>
      </div>

      <div className="flex min-h-14 items-center justify-end gap-3 bg-background-base px-4 py-2">
        <PriceTag price={game} />
      </div>
    </article>
  );
}
