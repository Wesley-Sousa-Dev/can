import type { Metadata } from "next";

import { CartView } from "@/components/cart/CartView";

export const metadata: Metadata = {
  title: "Carrinho",
  description: "Confira os jogos no seu carrinho e o total antes de finalizar a compra.",
};

// Os jogos vêm da conta (API) depois que a página abre no navegador.
export default function CartPage() {
  return <CartView />;
}
