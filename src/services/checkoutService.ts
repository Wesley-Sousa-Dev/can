import { waitForSimulatedNetwork } from "@/services/simulatedNetwork";
import {
  cartCollection,
  libraryCollection,
  wishlistCollection,
} from "@/services/userCollections";
import type { Order, OrderRequest } from "@/types/order";

// Camada de negócio da compra. placeOrder equivale ao POST /orders.
// O pagamento em si acontece fora da Can, no parceiro de pagamento (gateway),
// que não faz parte deste projeto. Por isso, na simulação, ele sempre aprova.

function createOrderId(): string {
  return `CAN-${Date.now().toString(36).toUpperCase()}`;
}

export async function placeOrder({ gameIds, paymentMethod }: OrderRequest): Promise<Order> {
  await waitForSimulatedNetwork();

  // Como na Steam, o jogo comprado vai para a biblioteca e sai da lista de desejos.
  for (const gameId of gameIds) {
    libraryCollection.add(gameId);
    wishlistCollection.remove(gameId);
  }
  cartCollection.clear();

  return {
    id: createOrderId(),
    gameIds,
    paymentMethod,
    createdAt: new Date().toISOString(),
  };
}
