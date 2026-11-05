import { ChevronRight } from "lucide-react";
import Link from "next/link";

export interface BreadcrumbItem {
  label: string;
  /** O último item é a página atual e não precisa de link. */
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav aria-label="Trilha de navegação">
      <ol className="flex flex-wrap items-center gap-1 text-small text-subtitle">
        {items.map((item, itemIndex) => {
          const isCurrentPage = itemIndex === items.length - 1;
          return (
            <li key={item.label} className="flex items-center gap-1">
              {itemIndex > 0 && <ChevronRight aria-hidden="true" className="size-4" />}
              {isCurrentPage || !item.href ? (
                <span aria-current={isCurrentPage ? "page" : undefined} className="text-title">
                  {item.label}
                </span>
              ) : (
                // Altura mínima de 24px para o alvo de toque (WCAG 2.5.8).
                <Link
                  href={item.href}
                  className="inline-flex min-h-6 items-center underline-offset-4 hover:text-title hover:underline"
                >
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
