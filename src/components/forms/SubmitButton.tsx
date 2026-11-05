import { LoaderCircle } from "lucide-react";

interface SubmitButtonProps {
  label: string;
  loadingLabel: string;
  isLoading: boolean;
  /** "cta" (verde) é para a ação de compra; o resto usa a cor principal. */
  variant?: "primary" | "cta";
  /** Permite que um link do resumo de erros leve o foco até o botão. */
  id?: string;
}

const VARIANT_CLASSES: Record<NonNullable<SubmitButtonProps["variant"]>, string> = {
  primary: "bg-primary text-title hover:bg-primary-hover",
  cta: "bg-cta text-on-accent underline-offset-4 hover:underline hover:shadow-strong",
};

// Durante o envio o botão continua focável (aria-disabled em vez de disabled):
// um botão desabilitado perde o foco, e o teclado voltaria ao início da página.
export function SubmitButton({ label, loadingLabel, isLoading, variant = "primary", id }: SubmitButtonProps) {
  return (
    <button
      id={id}
      type="submit"
      aria-disabled={isLoading}
      className={`inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-md px-5 text-medium font-medium shadow-soft transition-colors aria-disabled:cursor-wait ${VARIANT_CLASSES[variant]}`}
    >
      {isLoading && <LoaderCircle aria-hidden="true" className="size-5 motion-safe:animate-spin" />}
      {isLoading ? loadingLabel : label}
    </button>
  );
}
