import { connection } from "next/server";

import { CatalogTabs, type CatalogTab } from "@/components/home/CatalogTabs";
import { FeaturedCarousel } from "@/components/home/FeaturedCarousel";
import { GenreBrowseSection } from "@/components/home/GenreBrowseSection";
import { SpecialOffersSection } from "@/components/home/SpecialOffersSection";
import { StoreToolbar } from "@/components/store/StoreToolbar";
import {
  selectBudgetGames,
  selectFeaturedGames,
  selectMidRangeGames,
  selectRecommendedGames,
  selectSpecialOffers,
} from "@/lib/gameCatalog";
import { getGenres, getStoreCatalog } from "@/services/gameService";

export default async function HomePage() {
  // Os dados vêm da API a cada visita (com cache de alguns minutos), e não no build.
  await connection();
  // Uma chamada só (GET /games) alimenta todas as vitrines da página.
  const [catalog, genres] = await Promise.all([getStoreCatalog(), getGenres()]);
  const featuredGames = selectFeaturedGames(catalog);
  const specialOffers = selectSpecialOffers(catalog, featuredGames);

  const catalogTabs: CatalogTab[] = [
    {
      id: "recommended",
      label: "Recomendados",
      games: selectRecommendedGames(catalog, featuredGames),
      emptyMessage: "Nenhuma oferta recomendada no momento.",
    },
    {
      id: "budget",
      label: "Até R$ 20",
      games: selectBudgetGames(catalog),
      emptyMessage: "Nenhuma oferta até R$ 20 no momento.",
    },
    {
      id: "mid-range",
      label: "De R$ 20 a R$ 50",
      games: selectMidRangeGames(catalog),
      emptyMessage: "Nenhuma oferta entre R$ 20 e R$ 50 no momento.",
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
