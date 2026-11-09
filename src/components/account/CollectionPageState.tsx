"use client";

import { CloudOff, LogIn } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import type { CollectionViewState } from "@/hooks/useCollectionGames";
import { withRedirect } from "@/lib/safeRedirect";

interface CollectionPageStateProps {
  viewState: Exclude<CollectionViewState, "ready">;
  /** Título da página, o mesmo que ela mostra quando está pronta. */
  title: string;
  loadingText: string;
  /** Por que entrar na conta, ex.: "Entre para ver os jogos do seu carrinho." */
  signInText: string;
  onRetry: () => void;
}

const PRIMARY_ACTION_CLASS =
  "inline-flex min-h-11 items-center gap-2 rounded-md bg-primary px-4 text-medium font-medium text-title transition-colors hover:bg-primary-hover";

const SECONDARY_ACTION_CLASS =
  "inline-flex min-h-11 items-center rounded-md border border-border-input px-4 text-medium font-medium text-title transition-colors hover:bg-card";

const STATE_BOX_CLASS = "flex flex-col items-start gap-3 rounded-lg border border-dashed border-border-input p-6";

// Telas de carrinho, lista de desejos e biblioteca antes de terem o que mostrar:
// carregando, sem ninguém conectado ou sem resposta da API.
export function CollectionPageState({ viewState, title, loadingText, signInText, onRetry }: CollectionPageStateProps) {
  const pathname = usePathname();

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-6 sm:px-6">
      <h1 className="font-display text-xx-large uppercase text-title sm:text-xxx-large">{title}</h1>

      {viewState === "loading" && (
        <p aria-busy="true" role="status" className="text-medium text-subtitle">
          {loadingText}
        </p>
      )}

      {viewState === "signed-out" && (
        <div className={STATE_BOX_CLASS}>
          <LogIn aria-hidden="true" className="size-8 text-primary-focus" />
          <h2 className="font-display text-x-large text-title">Entre na sua conta</h2>
          <p className="text-medium text-subtitle">{signInText}</p>
          <div className="flex flex-wrap gap-3">
            {/* Depois de entrar ou criar a conta, a pessoa volta para esta página. */}
            <Link href={withRedirect("/login", pathname)} className={PRIMARY_ACTION_CLASS}>
              Entrar
            </Link>
            <Link href={withRedirect("/signup", pathname)} className={SECONDARY_ACTION_CLASS}>
              Criar conta
            </Link>
          </div>
        </div>
      )}

      {viewState === "error" && (
        <div role="alert" className={STATE_BOX_CLASS}>
          <CloudOff aria-hidden="true" className="size-8 text-error-text" />
          <h2 className="font-display text-x-large text-title">Não foi possível carregar</h2>
          <p className="text-medium text-subtitle">
            O servidor da Can não respondeu. Confira sua conexão e tente de novo.
          </p>
          <button type="button" onClick={onRetry} className={PRIMARY_ACTION_CLASS}>
            Tentar de novo
          </button>
        </div>
      )}
    </div>
  );
}
