export interface NavigationLink {
  href: string;
  label: string;
}

export const PRIMARY_NAVIGATION_LINKS: NavigationLink[] = [
  { href: "/", label: "Loja" },
  { href: "/library", label: "Biblioteca" },
  { href: "/wishlist", label: "Lista de desejos" },
];
