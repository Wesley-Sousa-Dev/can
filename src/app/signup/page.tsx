import type { Metadata } from "next";

import { AuthLayout } from "@/components/auth/AuthLayout";
import { SignupForm } from "@/components/auth/SignupForm";

export const metadata: Metadata = {
  title: "Criar conta",
  description: "Crie sua conta Can e comece a montar sua biblioteca de jogos.",
};

export default function SignupPage() {
  return (
    <AuthLayout taglineStart="Agite, abra e" taglineHighlight="comece a jogar!">
      <SignupForm />
    </AuthLayout>
  );
}
