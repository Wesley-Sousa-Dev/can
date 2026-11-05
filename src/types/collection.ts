/** Um jogo dentro de uma coleção do usuário: carrinho, lista de desejos ou biblioteca. */
export interface GameCollectionEntry {
  gameId: string;
  /** Momento em que o jogo entrou na coleção, em ISO 8601 com horário. */
  addedAt: string;
  /** Só na biblioteca: a última vez que o jogo foi aberto. Fica vazio se nunca foi. */
  lastPlayedAt?: string;
}

/** O que pode mudar em um item depois que ele entra na coleção. */
export type GameCollectionEntryChanges = Pick<GameCollectionEntry, "lastPlayedAt">;
