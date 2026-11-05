const conjunctionFormatter = new Intl.ListFormat("pt-BR", {
  style: "long",
  type: "conjunction",
});

/** Junta itens como em uma frase: ["A", "B", "C"] vira "A, B e C". */
export function formatConjunctionList(items: string[]): string {
  return conjunctionFormatter.format(items);
}

/** 1 vira "1 jogo"; 3 vira "3 jogos". */
export function formatGameCount(count: number): string {
  return count === 1 ? "1 jogo" : `${count} jogos`;
}
