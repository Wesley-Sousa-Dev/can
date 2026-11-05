import { createStoredIdList } from "@/data/storedIdList";

// Coleções do usuário: carrinho, lista de desejos e biblioteca.
// Por enquanto ficam no navegador. Quando a API ficar pronta, "add" vira um
// POST e "remove" vira um DELETE nos endpoints de cada coleção.
export const cartCollection = createStoredIdList("can:cart");
export const wishlistCollection = createStoredIdList("can:wishlist");
export const libraryCollection = createStoredIdList("can:library");
