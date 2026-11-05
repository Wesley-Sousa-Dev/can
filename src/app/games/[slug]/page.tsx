import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { AboutSection } from "@/components/game-details/AboutSection";
import { AccessibilityPanel } from "@/components/game-details/AccessibilityPanel";
import { AgeRatingPanel } from "@/components/game-details/AgeRatingPanel";
import { GameFeaturesPanel } from "@/components/game-details/GameFeaturesPanel";
import { GameSummary } from "@/components/game-details/GameSummary";
import { LanguagesPanel } from "@/components/game-details/LanguagesPanel";
import { MediaGallery } from "@/components/game-details/MediaGallery";
import { PurchaseBox, type PurchaseOption } from "@/components/game-details/PurchaseBox";
import { SimilarGamesSection } from "@/components/game-details/SimilarGamesSection";
import { SystemRequirementsSection } from "@/components/game-details/SystemRequirementsSection";
import { StoreToolbar } from "@/components/store/StoreToolbar";
import { Breadcrumb, type BreadcrumbItem } from "@/components/ui/Breadcrumb";
import {
  getAllGameSlugs,
  getGameBySlug,
  getSimilarGames,
  isFreeGame,
  isGameReleased,
} from "@/services/gameService";
import type { GameDetails } from "@/types/game";

// Gera uma página estática para cada jogo no build.
export async function generateStaticParams() {
  const slugs = await getAllGameSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/games/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const game = await getGameBySlug(slug);
  if (!game) {
    return { title: "Jogo não encontrado" };
  }
  return { title: game.title, description: game.shortDescription };
}

function getPurchaseOption(game: GameDetails): PurchaseOption {
  if (!isGameReleased(game)) {
    return "upcoming";
  }
  return isFreeGame(game) ? "free" : "buy";
}

function buildBreadcrumbItems(game: GameDetails): BreadcrumbItem[] {
  const primaryGenre = game.genres[0];
  return [
    { label: "Loja", href: "/" },
    ...(primaryGenre
      ? [{ label: primaryGenre.name, href: `/search?genre=${primaryGenre.id}` }]
      : []),
    { label: game.title },
  ];
}

export default async function GamePage({ params }: PageProps<"/games/[slug]">) {
  const { slug } = await params;
  const game = await getGameBySlug(slug);
  if (!game) {
    notFound();
  }

  const similarGames = await getSimilarGames(game);
  const purchaseOption = getPurchaseOption(game);

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-6 sm:px-6">
      <StoreToolbar />

      <div className="flex flex-col gap-2">
        <Breadcrumb items={buildBreadcrumbItems(game)} />
        <h1 className="font-display text-xx-large text-title md:text-xxx-large">{game.title}</h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <MediaGallery gameTitle={game.title} screenshotUrls={game.screenshotUrls} />
        </div>
        <GameSummary game={game} isReleased={purchaseOption !== "upcoming"} />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="flex flex-col gap-10 lg:col-span-2">
          <PurchaseBox
            gameId={game.id}
            gameTitle={game.title}
            priceInCents={game.priceInCents}
            discountPercent={game.discountPercent}
            platforms={game.platforms}
            releaseDate={game.releaseDate}
            purchaseOption={purchaseOption}
          />
          <AboutSection sections={game.aboutSections} />
          <SystemRequirementsSection
            minimumRequirements={game.minimumRequirements}
            recommendedRequirements={game.recommendedRequirements}
          />
        </div>

        <aside aria-label={`Mais informações sobre ${game.title}`} className="flex flex-col gap-4">
          <GameFeaturesPanel features={game.features} />
          <AccessibilityPanel accessibilityFeatures={game.accessibilityFeatures} />
          <LanguagesPanel gameTitle={game.title} languages={game.languages} />
          <AgeRatingPanel ageRating={game.ageRating} descriptors={game.ageRatingDescriptors} />
        </aside>
      </div>

      {similarGames.length > 0 && <SimilarGamesSection games={similarGames} />}
    </div>
  );
}
