import type { Metadata } from "next";

import { ProfileView } from "@/components/profile/ProfileView";
import { getAllGames } from "@/services/gameService";

export const metadata: Metadata = {
  title: "Meu perfil",
  description: "Sua biblioteca, sua lista de desejos e os dados da sua conta Can.",
};

export default async function ProfilePage({ searchParams }: PageProps<"/profile">) {
  // "?welcome=true" chega do cadastro e mostra a mensagem de boas-vindas.
  const { welcome } = await searchParams;
  const games = await getAllGames();

  return <ProfileView games={games} isNewAccount={welcome === "true"} />;
}
