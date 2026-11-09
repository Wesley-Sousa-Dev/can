import type { Metadata } from "next";

import { WishlistView } from "@/components/wishlist/WishlistView";

export const metadata: Metadata = {
  title: "Lista de desejos",
  description: "Os jogos que você quer comprar, na ordem que você escolher, com busca e filtros.",
};

// Os jogos vêm da conta (API) depois que a página abre no navegador.
export default function WishlistPage() {
  return <WishlistView />;
}
