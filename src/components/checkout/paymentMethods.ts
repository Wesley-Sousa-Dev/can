import { Barcode, CreditCard, Landmark, QrCode, WalletCards, type LucideIcon } from "lucide-react";

import type { PaymentMethod } from "@/types/order";

export interface PaymentMethodOption {
  value: PaymentMethod;
  label: string;
  description: string;
  Icon: LucideIcon;
}

export const PAYMENT_METHOD_OPTIONS: PaymentMethodOption[] = [
  {
    value: "credit-card",
    label: "Cartão de crédito",
    description: "Aprovação na hora.",
    Icon: CreditCard,
  },
  {
    value: "debit-card",
    label: "Cartão de débito",
    description: "O valor sai direto da sua conta.",
    Icon: WalletCards,
  },
  {
    value: "boleto",
    label: "Boleto bancário",
    description: "Pague no app do banco ou em uma lotérica.",
    Icon: Barcode,
  },
  {
    value: "pix",
    label: "Pix",
    description: "Pague com QR Code ou com o código copia e cola.",
    Icon: QrCode,
  },
  {
    value: "bank-deposit",
    label: "Depósito bancário",
    description: "Transferência ou depósito na conta da Can.",
    Icon: Landmark,
  },
];

export function getPaymentMethodLabel(paymentMethod: PaymentMethod): string {
  return PAYMENT_METHOD_OPTIONS.find((option) => option.value === paymentMethod)?.label ?? "";
}
