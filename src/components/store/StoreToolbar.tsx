import { Search } from "lucide-react";
import Link from "next/link";

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

      <form role="search" action="/search" className="flex md:w-80">
        <label htmlFor="store-search" className="sr-only">
          Buscar jogos na loja
        </label>
        <input
          id="store-search"
          name="q"
          type="search"
          placeholder="Buscar jogos"
          autoComplete="off"
          className="min-h-11 w-full min-w-0 rounded-l-md border border-border-input bg-background px-3 text-medium text-title placeholder:text-placeholder"
        />
        <button
          type="submit"
          aria-label="Buscar"
          className="grid min-h-11 min-w-11 place-items-center rounded-r-md bg-primary text-title transition-colors hover:bg-primary-hover"
        >
          <Search aria-hidden="true" className="size-5" />
        </button>
      </form>
    </div>
  );
}
