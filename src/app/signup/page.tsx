import type { Metadata } from "next";

import { AuthLayout } from "@/components/auth/AuthLayout";
import { SignupForm } from "@/components/auth/SignupForm";
import { getSafeRedirectPath } from "@/lib/safeRedirect";

export const metadata: Metadata = {
  title: "Criar conta",
  description: "Crie sua conta Can e comece a montar sua biblioteca de jogos.",
};

export default async function SignupPage({ searchParams }: PageProps<"/signup">) {
  // "?redirectTo=/checkout" chega da compra: depois do cadastro, a pessoa volta para lá.
  const { redirectTo } = await searchParams;

  return (
    <AuthLayout taglineStart="Agite, abra e" taglineHighlight="comece a jogar!">
      <SignupForm redirectTo={getSafeRedirectPath(redirectTo)} />
    </AuthLayout>
  );
}
