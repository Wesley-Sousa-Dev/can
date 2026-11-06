import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { GenreCatalog } from "@/components/catalog/GenreCatalog";
import { GenreHero } from "@/components/catalog/GenreHero";
import { GenreNavigation } from "@/components/catalog/GenreNavigation";
import { PopularTitlesSection } from "@/components/catalog/PopularTitlesSection";
import { StoreToolbar } from "@/components/store/StoreToolbar";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { getPopularTitles } from "@/lib/gameCatalog";
import { getGameShowcasesByGenre, getGenreById, getGenres } from "@/services/gameService";

// Gera uma página estática para cada gênero no build.
export async function generateStaticParams() {
  const genres = await getGenres();
  return genres.map((genre) => ({ genreId: genre.id }));
}

export async function generateMetadata({ params }: PageProps<"/genres/[genreId]">): Promise<Metadata> {
  const { genreId } = await params;
  const genre = await getGenreById(genreId);
  if (!genre) {
    return { title: "Gênero não encontrado" };
  }
  return {
    title: `Jogos de ${genre.name}`,
    description: `Os títulos mais populares de ${genre.name} na Can e a lista completa do gênero.`,
  };
}

export default async function GenrePage({ params }: PageProps<"/genres/[genreId]">) {
  const { genreId } = await params;
  const genre = await getGenreById(genreId);
  if (!genre) {
    notFound();
  }

  const [games, genres] = await Promise.all([getGameShowcasesByGenre(genre.id), getGenres()]);
  const popularTitles = getPopularTitles(games);

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-6 sm:px-6">
      <StoreToolbar />
      <div className="flex flex-col gap-3">
        <Breadcrumb
          items={[{ label: "Loja", href: "/" }, { label: "Gêneros", href: "/#genres" }, { label: genre.name }]}
        />
        <GenreNavigation genres={genres} currentGenreId={genre.id} />
      </div>
      <GenreHero
        genre={genre}
        gameCount={games.length}
        backgroundImageUrl={popularTitles[0]?.screenshotUrls[0]}
      />
      {popularTitles.length > 0 && <PopularTitlesSection games={popularTitles} />}
      <GenreCatalog genre={genre} games={games} />
    </div>
  );
}
