import type { Metadata } from "next";

import { LibraryView } from "@/components/library/LibraryView";
import { getAllGames } from "@/services/gameService";

export const metadata: Metadata = {
  title: "Biblioteca",
  description: "Todos os seus jogos comprados e gratuitos, prontos para jogar.",
};

export default async function LibraryPage() {
  const games = await getAllGames();
  return <LibraryView games={games} />;
}
