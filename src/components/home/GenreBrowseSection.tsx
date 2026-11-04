import {
  Castle,
  Compass,
  Gauge,
  Ghost,
  Plane,
  Puzzle,
  Swords,
  WandSparkles,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";

import { SectionHeader } from "@/components/ui/SectionHeader";
import type { Genre, GenreId } from "@/types/game";

interface GenreBrowseSectionProps {
  genres: Genre[];
}

const HEADING_ID = "genres-heading";

const GENRE_ICONS: Record<GenreId, LucideIcon> = {
  action: Swords,
  adventure: Compass,
  rpg: WandSparkles,
  strategy: Castle,
  racing: Gauge,
  simulation: Plane,
  puzzle: Puzzle,
  horror: Ghost,
};

export function GenreBrowseSection({ genres }: GenreBrowseSectionProps) {
  return (
    <section id="genres" aria-labelledby={HEADING_ID}>
      <SectionHeader headingId={HEADING_ID} title="Navegue por gênero" />

      <ul className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {genres.map((genre) => {
          const GenreIcon = GENRE_ICONS[genre.id];
          return (
            <li key={genre.id}>
              <Link
                href={`/search?genre=${genre.id}`}
                className="flex min-h-28 flex-col justify-between gap-4 rounded-lg bg-linear-to-br from-primary-hover to-card p-4 shadow-soft transition-shadow hover:from-primary hover:shadow-medium"
              >
                <GenreIcon aria-hidden="true" className="size-8 text-title" />
                <span className="font-display text-x-large text-title">{genre.name}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
