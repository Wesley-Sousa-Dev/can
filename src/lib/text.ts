const conjunctionFormatter = new Intl.ListFormat("pt-BR", {
  style: "long",
  type: "conjunction",
});

/** Junta itens como em uma frase: ["A", "B", "C"] vira "A, B e C". */
export function formatConjunctionList(items: string[]): string {
  return conjunctionFormatter.format(items);
}
