import Link from "next/link";

import { StoreSearch } from "@/components/store/StoreSearch";

const STORE_SECTION_LINKS = [
  { href: "/#featured", label: "Destaques" },
  { href: "/#special-offers", label: "Ofertas" },
  { href: "/#genres", label: "Gêneros" },
  { href: "/#catalog", label: "Catálogo" },
];

// Barra da loja, como a da Steam: atalhos para as seções e a busca.
export function StoreToolbar() {
  return (
    <div className="flex flex-col gap-3 rounded-lg bg-card p-2 shadow-medium md:flex-row md:items-center md:justify-between">
      <nav aria-label="Seções da loja" className="hidden md:block">
        <ul className="flex">
          {STORE_SECTION_LINKS.map((sectionLink) => (
            <li key={sectionLink.href}>
              <Link
                href={sectionLink.href}
                className="flex min-h-11 items-center rounded-md px-3 text-medium text-subtitle transition-colors hover:bg-panel hover:text-title"
              >
                {sectionLink.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <StoreSearch />
    </div>
  );
}
