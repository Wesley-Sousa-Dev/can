import Link from "next/link";

import { Logo } from "@/components/layout/Logo";
import type { NavigationLink } from "@/components/layout/navigationLinks";

const FOOTER_LINKS: NavigationLink[] = [
  { href: "/", label: "Loja" },
  { href: "/library", label: "Biblioteca" },
  { href: "/wishlist", label: "Lista de desejos" },
  { href: "/cart", label: "Carrinho" },
];

export function SiteFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-16 border-t border-border bg-background-base">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-10 sm:px-6 md:flex-row md:justify-between">
        <div className="max-w-md">
          <Logo />
          <p className="mt-3 text-small text-subtitle">
            A Can é uma loja de jogos fictícia, criada para a disciplina de
            Programação para Interface de Usuário da Unijuí. Jogos, estúdios e
            preços são inventados.
          </p>
        </div>

        <nav aria-label="Rodapé">
          <ul className="flex flex-col gap-1">
            {FOOTER_LINKS.map((footerLink) => (
              <li key={footerLink.href}>
                <Link
                  href={footerLink.href}
                  className="inline-flex min-h-11 items-center text-medium text-subtitle underline-offset-4 transition-colors hover:text-title hover:underline"
                >
                  {footerLink.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <div className="border-t border-border">
        <p className="mx-auto max-w-6xl px-4 py-4 text-small text-subtitle sm:px-6">
          © {currentYear} Can. Projeto acadêmico.
        </p>
      </div>
    </footer>
  );
}
