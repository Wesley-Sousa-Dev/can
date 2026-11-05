import type { Metadata } from "next";

import { CartView } from "@/components/cart/CartView";
import { getAllGames } from "@/services/gameService";

export const metadata: Metadata = {
  title: "Carrinho",
  description: "Confira os jogos no seu carrinho e o total antes de finalizar a compra.",
};

export default async function CartPage() {
  const games = await getAllGames();
  return <CartView games={games} />;
}
