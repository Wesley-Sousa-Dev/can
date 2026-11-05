import { LoaderCircle } from "lucide-react";

interface SubmitButtonProps {
  label: string;
  loadingLabel: string;
  isLoading: boolean;
}

// Durante o envio o botão continua focável (aria-disabled em vez de disabled):
// um botão desabilitado perde o foco, e o teclado voltaria ao início da página.
export function SubmitButton({ label, loadingLabel, isLoading }: SubmitButtonProps) {
  return (
    <button
      type="submit"
      aria-disabled={isLoading}
      className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-md bg-primary px-5 text-medium font-medium text-title shadow-soft transition-colors hover:bg-primary-hover aria-disabled:cursor-wait"
    >
      {isLoading && <LoaderCircle aria-hidden="true" className="size-5 motion-safe:animate-spin" />}
      {isLoading ? loadingLabel : label}
    </button>
  );
}
