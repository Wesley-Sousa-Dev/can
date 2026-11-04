"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { PRIMARY_NAVIGATION_LINKS } from "@/components/layout/navigationLinks";

interface PrimaryNavigationProps {
  layout: "horizontal" | "vertical";
  /** Chamado ao clicar em um link; o menu mobile usa para se fechar. */
  onNavigate?: () => void;
}

export function PrimaryNavigation({ layout, onNavigate }: PrimaryNavigationProps) {
  const currentPathname = usePathname();
  const listLayoutClass =
    layout === "horizontal" ? "flex items-center gap-1" : "flex flex-col gap-1";

  return (
    <nav aria-label="Principal">
      <ul className={listLayoutClass}>
        {PRIMARY_NAVIGATION_LINKS.map((navigationLink) => {
          const isCurrentPage = currentPathname === navigationLink.href;
          return (
            <li key={navigationLink.href}>
              {/* A página atual é marcada com sublinhado, e não só pela cor (WCAG 1.4.1). */}
              <Link
                href={navigationLink.href}
                aria-current={isCurrentPage ? "page" : undefined}
                onClick={onNavigate}
                className={`flex min-h-11 items-center rounded-md px-3 text-medium font-medium uppercase tracking-wide transition-colors hover:bg-card ${
                  isCurrentPage
                    ? "text-title underline decoration-primary-focus decoration-2 underline-offset-8"
                    : "text-subtitle hover:text-title"
                }`}
              >
                {navigationLink.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
