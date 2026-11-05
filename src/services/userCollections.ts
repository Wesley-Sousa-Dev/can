import { createStoredGameCollection } from "@/data/storedGameCollection";

// Coleções do usuário: carrinho, lista de desejos e biblioteca.
// Por enquanto ficam no navegador. Quando a API ficar pronta, "add" vira um
// POST, "remove" vira um DELETE e "move" (posição na lista de desejos) vira
// um PATCH nos endpoints de cada coleção.
export const cartCollection = createStoredGameCollection("can:cart");
export const wishlistCollection = createStoredGameCollection("can:wishlist");
export const libraryCollection = createStoredGameCollection("can:library");
