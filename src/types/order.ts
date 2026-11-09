export type PaymentMethod = "credit-card" | "debit-card" | "boleto" | "pix" | "bank-deposit";

/** Corpo do pedido enviado ao finalizar a compra (POST /orders). */
export interface OrderRequest {
  gameIds: string[];
  paymentMethod: PaymentMethod;
}

/** Pedido criado pela API, já com o pagamento aprovado pelo parceiro. */
export interface Order extends OrderRequest {
  /** Código curto para a pessoa citar no suporte, como "CAN-M3X9K2". */
  id: string;
  createdAt: string;
  /** Total cobrado, calculado pela API com os preços guardados no carrinho. */
  totalInCents: number;
}
