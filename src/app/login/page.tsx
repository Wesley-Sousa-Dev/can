import type { Metadata } from "next";

import { AuthLayout } from "@/components/auth/AuthLayout";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "Entrar",
  description: "Entre na sua conta Can para acessar sua biblioteca e sua lista de desejos.",
};

export default function LoginPage() {
  return (
    <AuthLayout taglineStart="Abra uma lata de" taglineHighlight="aventura!">
      <LoginForm />
    </AuthLayout>
  );
}
