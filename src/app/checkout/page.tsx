import type { Metadata } from "next";

import { CheckoutView } from "@/components/checkout/CheckoutView";
import { getAllGames } from "@/services/gameService";

export const metadata: Metadata = {
  title: "Finalizar compra",
  description: "Escolha a forma de pagamento e conclua a compra dos jogos do seu carrinho.",
};

export default async function CheckoutPage() {
  const games = await getAllGames();
  return <CheckoutView games={games} />;
}
