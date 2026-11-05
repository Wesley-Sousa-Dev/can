"use client";

import { ShoppingCart } from "lucide-react";
import Link from "next/link";

import { useGameCollection } from "@/hooks/useGameCollection";
import { cartCollection } from "@/services/userCollections";

export function CartLink() {
  const { gameIds } = useGameCollection(cartCollection);
  const itemCount = gameIds.length;

  return (
    <Link
      href="/cart"
      className="flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-md px-2 text-medium text-subtitle transition-colors hover:bg-card hover:text-title sm:px-3"
    >
      <ShoppingCart aria-hidden="true" className="size-5" />
      {/* No celular só o ícone aparece, mas o nome continua para o leitor de tela. */}
      <span className="sr-only sm:not-sr-only">Carrinho</span>
      {itemCount > 0 && (
        <span className="rounded-full bg-primary px-2 text-small font-medium text-title">
          {itemCount}
          <span className="sr-only"> {itemCount === 1 ? "item" : "itens"}</span>
        </span>
      )}
    </Link>
  );
}
