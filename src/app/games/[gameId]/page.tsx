import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connection } from "next/server";

import { AboutSection } from "@/components/game-details/AboutSection";
import { AccessibilityPanel } from "@/components/game-details/AccessibilityPanel";
import { AgeRatingPanel } from "@/components/game-details/AgeRatingPanel";
import { GameFeaturesPanel } from "@/components/game-details/GameFeaturesPanel";
import { GameSummary } from "@/components/game-details/GameSummary";
import { LanguagesPanel } from "@/components/game-details/LanguagesPanel";
import { MediaGallery } from "@/components/game-details/MediaGallery";
import { PurchaseBox } from "@/components/game-details/PurchaseBox";
import { SimilarGamesSection } from "@/components/game-details/SimilarGamesSection";
import {
  hasAnyRequirement,
  SystemRequirementsSection,
} from "@/components/game-details/SystemRequirementsSection";
import { StoreToolbar } from "@/components/store/StoreToolbar";
import { Breadcrumb, type BreadcrumbItem } from "@/components/ui/Breadcrumb";
import { getPurchaseOption } from "@/lib/gameAvailability";
import { selectSimilarGames } from "@/lib/gameCatalog";
import { getGameDetails, getStoreCatalog } from "@/services/gameService";
import type { GameDetails } from "@/types/game";

export async function generateMetadata({ params }: PageProps<"/games/[gameId]">): Promise<Metadata> {
  const { gameId } = await params;
  const game = await getGameDetails(gameId);
  if (!game) {
    return { title: "Jogo não encontrado" };
  }
  return { title: game.title, description: game.shortDescription };
}

function buildBreadcrumbItems(game: GameDetails): BreadcrumbItem[] {
  const primaryGenre = game.genres[0];
  return [
    { label: "Loja", href: "/" },
    ...(primaryGenre ? [{ label: primaryGenre.name, href: `/genres/${primaryGenre.id}` }] : []),
    { label: game.title },
  ];
}

export default async function GamePage({ params }: PageProps<"/games/[gameId]">) {
  // Os dados vêm da API a cada visita (com cache de alguns minutos), e não no build.
  await connection();
  const { gameId } = await params;
  // As ofertas da loja servem para sugerir jogos parecidos no fim da página.
  const [game, catalog] = await Promise.all([getGameDetails(gameId), getStoreCatalog()]);
  if (!game) {
    notFound();
  }

  const similarGames = selectSimilarGames(game, catalog);
  const purchaseOption = getPurchaseOption(game);
  const hasRequirements =
    hasAnyRequirement(game.minimumRequirements) || hasAnyRequirement(game.recommendedRequirements);

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-6 sm:px-6">
      <StoreToolbar />

      <div className="flex flex-col gap-2">
        <Breadcrumb items={buildBreadcrumbItems(game)} />
        <h1 className="font-display text-xx-large text-title wrap-break-word md:text-xxx-large">{game.title}</h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="min-w-0 lg:col-span-2">
          <MediaGallery gameTitle={game.title} screenshotUrls={game.screenshotUrls} />
        </div>
        <GameSummary game={game} />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* min-w-0 deixa a coluna encolher: sem ele, uma palavra longa da descrição da Steam
            (como um link) alargaria a grade além da tela do celular. */}
        <div className="flex min-w-0 flex-col gap-10 lg:col-span-2">
          <PurchaseBox game={game} purchaseOption={purchaseOption} />
          {game.aboutSections.length > 0 && <AboutSection sections={game.aboutSections} />}
          {hasRequirements && (
            <SystemRequirementsSection
              minimumRequirements={game.minimumRequirements}
              recommendedRequirements={game.recommendedRequirements}
            />
          )}
        </div>

        <aside aria-label={`Mais informações sobre ${game.title}`} className="flex min-w-0 flex-col gap-4">
          {game.features.length > 0 && <GameFeaturesPanel features={game.features} />}
          <AccessibilityPanel accessibilityFeatures={game.accessibilityFeatures} />
          {game.languages.length > 0 && <LanguagesPanel gameTitle={game.title} languages={game.languages} />}
          {game.ageRating && <AgeRatingPanel ageRating={game.ageRating} descriptors={game.ageRatingDescriptors} />}
        </aside>
      </div>

      {similarGames.length > 0 && <SimilarGamesSection games={similarGames} />}
    </div>
  );
}
