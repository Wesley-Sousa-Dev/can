import type { Metadata } from "next";

import { AuthLayout } from "@/components/auth/AuthLayout";
import { LoginForm } from "@/components/auth/LoginForm";
import { getSafeRedirectPath } from "@/lib/safeRedirect";

export const metadata: Metadata = {
  title: "Entrar",
  description: "Entre na sua conta Can para acessar sua biblioteca e sua lista de desejos.",
};

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  // "?redirectTo=/checkout" chega da compra: depois de entrar, a pessoa volta para lá.
  const { redirectTo } = await searchParams;

  return (
    <AuthLayout taglineStart="Abra uma lata de" taglineHighlight="aventura!">
      <LoginForm redirectTo={getSafeRedirectPath(redirectTo)} />
    </AuthLayout>
  );
}
