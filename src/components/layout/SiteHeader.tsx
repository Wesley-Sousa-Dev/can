import { ShoppingCart } from "lucide-react";
import Link from "next/link";

import { Logo } from "@/components/layout/Logo";
import { MobileMenu } from "@/components/layout/MobileMenu";
import { PrimaryNavigation } from "@/components/layout/PrimaryNavigation";

export function SiteHeader() {
  return (
    <header className="relative border-b border-border bg-panel">
      <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-2 sm:px-6 lg:gap-8">
        <Link href="/" className="flex min-h-11 items-center rounded-md">
          <Logo />
          <span className="sr-only">, página inicial</span>
        </Link>

        <div className="hidden md:block">
          <PrimaryNavigation layout="horizontal" />
        </div>

        <div className="ml-auto flex items-center gap-2">
          <Link
            href="/cart"
            className="flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-md px-2 text-medium text-subtitle transition-colors hover:bg-card hover:text-title sm:px-3"
          >
            <ShoppingCart aria-hidden="true" className="size-5" />
            {/* No celular só o ícone aparece, mas o nome continua para o leitor de tela. */}
            <span className="sr-only sm:not-sr-only">Carrinho</span>
          </Link>
          <Link
            href="/login"
            className="hidden min-h-11 items-center rounded-md bg-primary px-4 text-medium font-medium text-title transition-colors hover:bg-primary-hover md:flex"
          >
            Entrar
          </Link>
          <MobileMenu />
        </div>
      </div>
    </header>
  );
}
