"use client";

import { CloudOff } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";

interface ErrorPageProps {
  error: Error & { digest?: string };
  retry: () => void;
}

// Aparece quando uma página não consegue os jogos da API (servidor fora do ar
// ou sem internet). Explica o que houve e oferece tentar de novo, em vez de
// uma tela quebrada.
export default function ErrorPage({ error, retry }: ErrorPageProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex max-w-2xl flex-col items-start gap-4 px-4 py-16 sm:px-6">
      <CloudOff aria-hidden="true" className="size-12 text-error-text" />
      <h1 className="font-display text-xx-large text-title">Não foi possível carregar a loja</h1>
      <p className="text-medium text-title">
        O servidor da Can não respondeu agora. Confira sua conexão e tente de novo em instantes.
      </p>
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={retry}
          className="inline-flex min-h-11 items-center rounded-md bg-primary px-5 text-medium font-medium text-title transition-colors hover:bg-primary-hover"
        >
          Tentar de novo
        </button>
        <Link
          href="/"
          className="inline-flex min-h-11 items-center rounded-md border border-border-input px-5 text-medium font-medium text-title transition-colors hover:bg-card"
        >
          Voltar para a loja
        </Link>
      </div>
    </div>
  );
}
