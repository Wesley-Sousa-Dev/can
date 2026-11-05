import type { Metadata } from "next";

import { WishlistView } from "@/components/wishlist/WishlistView";
import { getGameListings } from "@/services/gameService";

export const metadata: Metadata = {
  title: "Lista de desejos",
  description: "Os jogos que você quer comprar, na ordem que você escolher, com busca e filtros.",
};

export default async function WishlistPage() {
  const games = await getGameListings();
  return <WishlistView games={games} />;
}
