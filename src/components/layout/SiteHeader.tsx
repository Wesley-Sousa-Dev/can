import Link from "next/link";

import { CartLink } from "@/components/layout/CartLink";
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
          <CartLink />
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
