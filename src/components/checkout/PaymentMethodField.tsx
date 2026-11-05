"use client";

import { CircleAlert } from "lucide-react";
import { useId } from "react";

import { PAYMENT_METHOD_OPTIONS } from "@/components/checkout/paymentMethods";
import type { PaymentMethod } from "@/types/order";

interface PaymentMethodFieldProps {
  value: PaymentMethod | null;
  error: string | null;
  onChange: (paymentMethod: PaymentMethod) => void;
}

export function getPaymentOptionId(paymentMethod: PaymentMethod): string {
  return `payment-${paymentMethod}`;
}

/** O resumo de erros leva o foco para a primeira opção. */
export const FIRST_PAYMENT_OPTION_ID = getPaymentOptionId(PAYMENT_METHOD_OPTIONS[0].value);

// Grupo de rádios nativos em forma de cartões: as setas do teclado já trocam
// a opção, e o cartão inteiro é clicável porque fica dentro do <label>.
export function PaymentMethodField({ value, error, onChange }: PaymentMethodFieldProps) {
  const legendId = useId();
  const errorId = useId();

  return (
    // role="radiogroup" permite marcar o grupo com aria-invalid, que o papel
    // padrão do fieldset (group) não aceita.
    <fieldset
      role="radiogroup"
      aria-labelledby={legendId}
      aria-invalid={error ? true : undefined}
      aria-describedby={error ? errorId : undefined}
    >
      <legend id={legendId} className="text-large font-medium text-title">
        Forma de pagamento
        <span aria-hidden="true" className="text-error-text">
          {" "}
          *
        </span>
      </legend>
      <p className="text-small text-subtitle">Escolha como você quer pagar.</p>

      {error && (
        <p id={errorId} className="mt-2 flex items-start gap-2 text-small text-error-text">
          <CircleAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
          {error}
        </p>
      )}

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {PAYMENT_METHOD_OPTIONS.map(({ value: optionValue, label, description, Icon }) => {
          const optionId = getPaymentOptionId(optionValue);
          return (
            <label
              key={optionValue}
              className={`flex cursor-pointer items-start gap-3 rounded-lg border-2 bg-panel p-4 transition-colors hover:bg-card has-checked:border-primary-focus has-checked:bg-card has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-primary-focus ${
                error ? "border-destructive" : "border-border-input"
              }`}
            >
              {/* O nome da opção vem só do título; a descrição entra como detalhe. */}
              <input
                type="radio"
                id={optionId}
                name="payment-method"
                value={optionValue}
                checked={value === optionValue}
                onChange={() => onChange(optionValue)}
                required
                aria-labelledby={`${optionId}-label`}
                aria-describedby={`${optionId}-description`}
                className="mt-0.5 size-5 shrink-0 accent-primary focus-visible:outline-none"
              />
              <Icon aria-hidden="true" className="size-6 shrink-0 text-primary-focus" />
              <span className="flex flex-col">
                <span id={`${optionId}-label`} className="text-medium font-medium text-title">
                  {label}
                </span>
                <span id={`${optionId}-description`} className="text-small text-subtitle">
                  {description}
                </span>
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
