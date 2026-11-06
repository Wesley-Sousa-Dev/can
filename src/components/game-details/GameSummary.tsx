import Link from "next/link";
import type { ReactNode } from "react";

import { GameCover } from "@/components/game/GameCover";
import { formatReleaseDate } from "@/lib/dates";
import { formatCount, getReviewLabel } from "@/lib/reviews";
import type { GameDetails } from "@/types/game";

interface GameSummaryProps {
  game: GameDetails;
  isReleased: boolean;
}

interface SummaryRowProps {
  term: string;
  children: ReactNode;
}

function SummaryRow({ term, children }: SummaryRowProps) {
  return (
    <div className="flex flex-col gap-x-4 sm:flex-row">
      <dt className="shrink-0 text-small uppercase text-subtitle sm:w-36">{term}</dt>
      <dd className="text-small text-title">{children}</dd>
    </div>
  );
}

// Coluna da direita do topo da página, como na Steam: capa, resumo e ficha técnica.
export function GameSummary({ game, isReleased }: GameSummaryProps) {
  const tagsLabelId = `${game.slug}-tags-label`;

  return (
    <div className="flex flex-col gap-4 rounded-lg bg-panel p-4 shadow-soft">
      {/* No celular a capa repetiria a galeria logo acima, então só aparece no desktop. */}
      <div className="hidden overflow-hidden rounded-md lg:block">
        <GameCover imageUrl={game.coverImageUrl} sizes="33vw" />
      </div>

      <p className="text-medium text-title">{game.shortDescription}</p>

      <dl className="flex flex-col gap-3">
        <SummaryRow term="Análises">
          {game.reviewSummary ? (
            <>
              <span className="font-medium">{getReviewLabel(game.reviewSummary)}</span>{" "}
              <span className="text-subtitle">({formatCount(game.reviewSummary.totalReviews)})</span>
              <span className="block text-subtitle">
                {game.reviewSummary.positivePercent}% das análises são positivas
              </span>
            </>
          ) : (
            <span className="text-subtitle">Disponíveis após o lançamento</span>
          )}
        </SummaryRow>
        <SummaryRow term={isReleased ? "Lançamento" : "Lançamento previsto"}>
          <time dateTime={game.releaseDate}>{formatReleaseDate(game.releaseDate)}</time>
        </SummaryRow>
        <SummaryRow term="Desenvolvedora">{game.developer}</SummaryRow>
        <SummaryRow term="Distribuidora">{game.publisher}</SummaryRow>
        <SummaryRow term="Gêneros">
          <ul className="flex flex-wrap gap-x-3">
            {game.genres.map((genre) => (
              <li key={genre.id}>
                <Link
                  href={`/genres/${genre.id}`}
                  className="inline-flex min-h-6 items-center text-primary-focus underline underline-offset-4 hover:text-title"
                >
                  {genre.name}
                </Link>
              </li>
            ))}
          </ul>
        </SummaryRow>
      </dl>

      <div>
        <p id={tagsLabelId} className="text-small text-subtitle">
          Marcadores populares:
        </p>
        <ul aria-labelledby={tagsLabelId} className="mt-2 flex flex-wrap gap-2">
          {game.tags.map((tag) => (
            <li key={tag} className="rounded-md border border-tag px-2 text-small text-tag">
              {tag}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
