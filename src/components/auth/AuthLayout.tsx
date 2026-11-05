import type { ReactNode } from "react";

import { SodaRocketArt } from "@/components/auth/SodaRocketArt";

interface AuthLayoutProps {
  taglineStart: string;
  taglineHighlight: string;
  children: ReactNode;
}

// Moldura das telas de entrar e criar conta: arte à esquerda e formulário à
// direita. No celular, a arte vira uma faixa curta acima do formulário.
export function AuthLayout({ taglineStart, taglineHighlight, children }: AuthLayoutProps) {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="grid overflow-hidden rounded-lg bg-panel shadow-strong lg:grid-cols-2">
        <div className="relative min-h-64 overflow-hidden bg-background-base lg:min-h-160">
          {/* Duas versões da mesma arte: no celular ela cobre a faixa; no desktop
              aparece inteira, porque a coluna fica tão alta quanto o formulário. */}
          <SodaRocketArt idPrefix="art-mobile" fit="cover" className="lg:hidden" />
          <SodaRocketArt idPrefix="art-desktop" fit="contain" className="hidden lg:block" />
          {/* Escurece a base da arte para garantir o contraste do texto por cima dela. */}
          <div
            aria-hidden="true"
            className="absolute inset-x-0 bottom-0 h-3/4 bg-linear-to-t from-background-base from-35% to-transparent lg:h-96 lg:from-50%"
          />
          <p className="absolute inset-x-6 bottom-6 font-display text-x-large uppercase sm:text-xx-large lg:inset-x-10 lg:bottom-10 lg:text-xxxx-large">
            <span className="block text-title">{taglineStart}</span>
            <span className="block text-primary-focus">{taglineHighlight}</span>
          </p>
        </div>

        <div className="flex flex-col justify-center px-6 py-8 sm:px-10 sm:py-12">{children}</div>
      </div>
    </div>
  );
}
