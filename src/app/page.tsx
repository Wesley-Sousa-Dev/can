import { CatalogTabs, type CatalogTab } from "@/components/home/CatalogTabs";
import { FeaturedCarousel } from "@/components/home/FeaturedCarousel";
import { GenreBrowseSection } from "@/components/home/GenreBrowseSection";
import { SpecialOffersSection } from "@/components/home/SpecialOffersSection";
import { StoreToolbar } from "@/components/store/StoreToolbar";
import {
  getFeaturedGames,
  getFreeToPlayGames,
  getGenres,
  getNewReleases,
  getSpecialOffers,
  getTopSellers,
  getUpcomingGames,
} from "@/services/gameService";

export default async function HomePage() {
  const [
    featuredGames,
    specialOffers,
    genres,
    newReleases,
    topSellers,
    upcomingGames,
    freeToPlayGames,
  ] = await Promise.all([
    getFeaturedGames(),
    getSpecialOffers(),
    getGenres(),
    getNewReleases(),
    getTopSellers(),
    getUpcomingGames(),
    getFreeToPlayGames(),
  ]);

  const catalogTabs: CatalogTab[] = [
    {
      id: "new-releases",
      label: "Novidades",
      games: newReleases,
      emptyMessage: "Nenhum lançamento recente.",
    },
    {
      id: "top-sellers",
      label: "Mais vendidos",
      games: topSellers,
      emptyMessage: "Ainda não há vendas registradas.",
    },
    {
      id: "upcoming",
      label: "Em breve",
      games: upcomingGames,
      emptyMessage: "Nenhum lançamento anunciado.",
      showReleaseDate: true,
    },
    {
      id: "free-to-play",
      label: "Gratuitos",
      games: freeToPlayGames,
      emptyMessage: "Nenhum jogo gratuito no momento.",
    },
  ];

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-12 px-4 py-6 sm:px-6">
      <h1 className="sr-only">Loja Can</h1>
      <StoreToolbar />
      <FeaturedCarousel games={featuredGames} />
      <SpecialOffersSection games={specialOffers} />
      <GenreBrowseSection genres={genres} />
      <CatalogTabs tabs={catalogTabs} />
    </div>
  );
}
