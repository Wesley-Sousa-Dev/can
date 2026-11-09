import type { Metadata } from "next";

import { ProfileView } from "@/components/profile/ProfileView";

export const metadata: Metadata = {
  title: "Meu perfil",
  description: "Sua biblioteca, sua lista de desejos e os dados da sua conta Can.",
};

export default async function ProfilePage({ searchParams }: PageProps<"/profile">) {
  // "?welcome=true" chega do cadastro e mostra a mensagem de boas-vindas.
  const { welcome } = await searchParams;
  return <ProfileView isNewAccount={welcome === "true"} />;
}
