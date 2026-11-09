import type { Metadata } from "next";

import { LibraryView } from "@/components/library/LibraryView";

export const metadata: Metadata = {
  title: "Biblioteca",
  description: "Todos os seus jogos comprados e gratuitos, prontos para jogar.",
};

// Os jogos vêm da conta (API) depois que a página abre no navegador.
export default function LibraryPage() {
  return <LibraryView />;
}
