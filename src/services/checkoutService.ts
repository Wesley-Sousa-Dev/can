import { readSessionToken } from "@/data/sessionToken";
import { requestApi } from "@/services/apiClient";
import { reloadUserCollections } from "@/services/userCollections";
import type { Order, OrderRequest } from "@/types/order";

// Camada de negócio da compra. placeOrder equivale ao POST /orders.
// O pagamento em si acontece fora da Can, no parceiro de pagamento (gateway),
// que não faz parte deste projeto. Por isso a API sempre aprova o pedido: ela
// põe os jogos na biblioteca, tira da lista de desejos e esvazia o carrinho.

interface ApiOrder extends OrderRequest {
  id: string;
  createdAt: string;
  /** Total em reais (não em centavos). */
  total: number;
}

/** Rejeita com ApiError quando a API recusa o pedido (ex.: carrinho desatualizado). */
export async function placeOrder(orderRequest: OrderRequest): Promise<Order> {
  const apiOrder = await requestApi<ApiOrder>("/orders", {
    method: "POST",
    body: orderRequest,
    token: readSessionToken(),
  });
  // A API mexeu nas três coleções: a tela passa a mostrar o que ficou salvo lá.
  await reloadUserCollections();
  return {
    id: apiOrder.id,
    gameIds: apiOrder.gameIds,
    paymentMethod: apiOrder.paymentMethod,
    createdAt: apiOrder.createdAt,
    totalInCents: Math.round(apiOrder.total * 100),
  };
}
