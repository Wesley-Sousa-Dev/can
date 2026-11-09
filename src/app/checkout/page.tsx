import type { Metadata } from "next";

import { CheckoutView } from "@/components/checkout/CheckoutView";

export const metadata: Metadata = {
  title: "Finalizar compra",
  description: "Escolha a forma de pagamento e conclua a compra dos jogos do seu carrinho.",
};

// Os jogos vêm da conta (API) depois que a página abre no navegador.
export default function CheckoutPage() {
  return <CheckoutView />;
}
