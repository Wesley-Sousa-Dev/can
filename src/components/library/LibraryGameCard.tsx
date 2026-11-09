"use client";

import { Play } from "lucide-react";
import Link from "next/link";
import { useRef } from "react";
import { flushSync } from "react-dom";

import { GameCover } from "@/components/game/GameCover";
import { formatRelativeLocalDate, formatShortLocalDate } from "@/lib/dates";
import { isNewInLibrary, type LibraryItem } from "@/lib/library";

export type LibraryLayout = "grid" | "list";

interface LibraryGameCardProps {
  item: LibraryItem;
  layout: LibraryLayout;
  onPlay: () => void;
}

const PLAY_BUTTON_CLASS =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-cta px-4 text-medium font-medium text-on-accent shadow-soft underline-offset-4 transition-shadow hover:underline hover:shadow-strong";

function NewBadge() {
  return (
    <span className="rounded-md bg-tag px-2 text-small font-medium text-on-accent">
      Novo<span className="sr-only"> na biblioteca</span>
    </span>
  );
}

function describeLastPlayed(item: LibraryItem): string {
  return item.lastPlayedAt
    ? `Última vez: ${formatRelativeLocalDate(item.lastPlayedAt)}`
    : `Adicionado: ${formatRelativeLocalDate(item.addedAt)}`;
}

// Card de um jogo da biblioteca, em grade (como a da Steam) ou em lista.
export function LibraryGameCard({ item, layout, onPlay }: LibraryGameCardProps) {
  const { game } = item;
  const playButtonRef = useRef<HTMLButtonElement>(null);
  const titleId = `library-title-${game.id}`;
  const gamePageUrl = `/games/${game.id}`;
  const isNew = isNewInLibrary(item);

  // Na ordem por atividade, o jogo aberto sobe para o topo. Mover a linha tira
  // o foco dela, então o foco volta para o mesmo botão logo depois.
  function handlePlay() {
    flushSync(onPlay);
    playButtonRef.current?.focus();
  }

  const coverLink = (
    // A capa repete o link do título, então fica fora do teclado e do leitor de tela.
    <Link
      href={gamePageUrl}
      tabIndex={-1}
      aria-hidden="true"
      className={`group block shrink-0 overflow-hidden ${layout === "list" ? "w-24 rounded-md sm:w-40" : ""}`}
    >
      <GameCover
        imageUrl={game.coverImageUrl}
        sizes={layout === "list" ? "160px" : "(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"}
      />
    </Link>
  );

  const title = (
    <h3 className="text-medium font-medium text-title">
      <Link id={titleId} href={gamePageUrl} className="underline-offset-4 hover:text-primary-focus hover:underline">
        {game.title}
      </Link>
    </h3>
  );

  const playButton = (
    <button ref={playButtonRef} type="button" onClick={handlePlay} className={PLAY_BUTTON_CLASS}>
      <Play aria-hidden="true" className="size-5 fill-current" />
      Jogar<span className="sr-only"> {game.title}</span>
    </button>
  );

  if (layout === "list") {
    return (
      <article aria-labelledby={titleId} className="flex items-center gap-3 rounded-lg bg-card p-2 shadow-soft sm:gap-4 sm:pr-4">
        {coverLink}
        <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <div className="flex min-w-0 flex-col gap-1">
            <div className="flex flex-wrap items-center gap-2">
              {title}
              {isNew && <NewBadge />}
            </div>
            <p className="text-small text-subtitle">
              Na biblioteca desde {formatShortLocalDate(item.addedAt)}
              {item.lastPlayedAt && <> · Última vez: {formatRelativeLocalDate(item.lastPlayedAt)}</>}
            </p>
          </div>
          <div className="shrink-0 self-start sm:self-auto">{playButton}</div>
        </div>
      </article>
    );
  }

  return (
    <article aria-labelledby={titleId} className="flex h-full flex-col overflow-hidden rounded-lg bg-card shadow-soft">
      {coverLink}
      <div className="flex flex-1 flex-col gap-2 p-3">
        {title}
        <div className="flex flex-wrap items-center gap-2">
          {isNew && <NewBadge />}
          <p className="text-small text-subtitle">{describeLastPlayed(item)}</p>
        </div>
        <div className="mt-auto flex flex-col pt-1">{playButton}</div>
      </div>
    </article>
  );
}
