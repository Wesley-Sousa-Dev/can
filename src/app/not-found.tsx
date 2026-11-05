import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Página não encontrada",
};

// Mostrada para qualquer endereço inexistente e quando um jogo não é encontrado.
// Explica o que houve e oferece um caminho de volta, em vez de um beco sem saída.
export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col items-start gap-4 px-4 py-16 sm:px-6">
      <p className="font-display text-xxxx-large text-subtitle">404</p>
      <h1 className="font-display text-xx-large text-title">Página não encontrada</h1>
      <p className="text-medium text-title">
        O endereço pode estar errado ou esta página ainda não existe. Confira o que foi
        digitado ou volte para a loja.
      </p>
      <Link
        href="/"
        className="inline-flex min-h-11 items-center rounded-md bg-primary px-5 text-medium font-medium text-title transition-colors hover:bg-primary-hover"
      >
        Voltar para a loja
      </Link>
    </div>
  );
}
