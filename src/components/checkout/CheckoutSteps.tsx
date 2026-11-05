import { Check } from "lucide-react";

export type CheckoutStep = "cart" | "payment" | "confirmation";

const CHECKOUT_STEPS: { id: CheckoutStep; label: string }[] = [
  { id: "cart", label: "Carrinho" },
  { id: "payment", label: "Pagamento" },
  { id: "confirmation", label: "Confirmação" },
];

interface CheckoutStepsProps {
  currentStep: CheckoutStep;
}

// Mostra em que parte da compra a pessoa está (WCAG 2.4.8, nível AAA).
// A etapa atual é marcada com aria-current="step" e não só pela cor.
export function CheckoutSteps({ currentStep }: CheckoutStepsProps) {
  const currentStepIndex = CHECKOUT_STEPS.findIndex((step) => step.id === currentStep);

  return (
    <ol aria-label="Etapas da compra" className="flex flex-wrap items-center gap-x-3 gap-y-2">
      {CHECKOUT_STEPS.map((step, stepIndex) => {
        const isCurrent = stepIndex === currentStepIndex;
        const isCompleted = stepIndex < currentStepIndex;
        return (
          <li
            key={step.id}
            aria-current={isCurrent ? "step" : undefined}
            className="flex items-center gap-2 text-small"
          >
            <span
              aria-hidden="true"
              className={`grid size-7 place-items-center rounded-full font-medium ${
                isCompleted
                  ? "bg-cta text-on-accent"
                  : isCurrent
                    ? "bg-primary text-title"
                    : "border border-border-input text-subtitle"
              }`}
            >
              {isCompleted ? <Check className="size-4" /> : stepIndex + 1}
            </span>
            <span className={isCurrent ? "font-medium text-title" : "text-subtitle"}>
              {step.label}
              {isCompleted && <span className="sr-only"> (concluída)</span>}
            </span>
            {stepIndex < CHECKOUT_STEPS.length - 1 && (
              <span aria-hidden="true" className="hidden h-px w-10 bg-border-input sm:block" />
            )}
          </li>
        );
      })}
    </ol>
  );
}
