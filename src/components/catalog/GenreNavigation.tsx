import Link from "next/link";

import type { Genre, GenreId } from "@/types/game";

interface GenreNavigationProps {
  genres: Genre[];
  currentGenreId: GenreId;
}

// Faixa com todos os gêneros, como a do topo das páginas de categoria da Steam.
export function GenreNavigation({ genres, currentGenreId }: GenreNavigationProps) {
  return (
    <nav aria-label="Gêneros">
      <ul className="flex flex-wrap gap-x-1">
        {genres.map((genre) => {
          const isCurrentPage = genre.id === currentGenreId;
          return (
            <li key={genre.id}>
              {/* A página atual é marcada com sublinhado, e não só pela cor (WCAG 1.4.1). */}
              <Link
                href={`/genres/${genre.id}`}
                aria-current={isCurrentPage ? "page" : undefined}
                className={`flex min-h-11 items-center rounded-md px-3 text-small font-medium uppercase tracking-wide transition-colors hover:bg-card ${
                  isCurrentPage
                    ? "text-title underline decoration-primary-focus decoration-2 underline-offset-8"
                    : "text-subtitle hover:text-title"
                }`}
              >
                {genre.name}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
