"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState, type FormEvent } from "react";
import { flushSync } from "react-dom";

import { buildErrorSummaryItems, ErrorSummary } from "@/components/forms/ErrorSummary";
import { PasswordField } from "@/components/forms/PasswordField";
import { SubmitButton } from "@/components/forms/SubmitButton";
import { TextField } from "@/components/forms/TextField";
import { useSession } from "@/hooks/useSession";
import { useValidatedForm } from "@/hooks/useValidatedForm";
import { validateLoginIdentifier, validateLoginPassword } from "@/lib/accountValidation";
import { withRedirect } from "@/lib/safeRedirect";
import { signIn } from "@/services/authService";

const FIELD_IDS = {
  identifier: "login-identifier",
  password: "login-password",
};

const INVALID_CREDENTIALS_MESSAGE =
  "Apelido, e-mail ou senha incorretos. Confira os dados e tente de novo.";

interface LoginFormProps {
  /** Página para onde a pessoa volta depois de entrar. Sem ela, vai para o perfil. */
  redirectTo?: string;
}

export function LoginForm({ redirectTo }: LoginFormProps) {
  const router = useRouter();
  const session = useSession();
  const { values, errors, registerField, validateAllFields } = useValidatedForm(
    { identifier: "", password: "" },
    { identifier: validateLoginIdentifier, password: validateLoginPassword },
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [signInError, setSignInError] = useState<string | null>(null);
  const errorSummaryRef = useRef<HTMLDivElement>(null);

  // O erro de credenciais não pertence a um campo só, então aparece sozinho no resumo.
  const summaryItems = signInError
    ? [{ fieldId: FIELD_IDS.identifier, message: signInError }]
    : buildErrorSummaryItems(errors, FIELD_IDS);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting) {
      return;
    }

    // flushSync coloca o resumo na tela na hora, para ele já poder receber o foco.
    const foundErrors = flushSync(() => {
      setSignInError(null);
      return validateAllFields();
    });
    if (Object.keys(foundErrors).length > 0) {
      errorSummaryRef.current?.focus();
      return;
    }

    setIsSubmitting(true);
    const result = await signIn(values.identifier, values.password);
    if (result.isSuccess) {
      router.push(redirectTo ?? "/profile");
      return;
    }

    flushSync(() => {
      setIsSubmitting(false);
      setSignInError(INVALID_CREDENTIALS_MESSAGE);
    });
    errorSummaryRef.current?.focus();
  }

  return (
    <div className="mx-auto w-full max-w-md">
      <h1 className="font-display text-xxx-large uppercase text-title">Entrar</h1>
      <p className="mt-2 text-medium text-subtitle">
        Que bom ver você de novo. Entre para acessar sua biblioteca e sua lista de desejos.
      </p>

      {session.status === "signed-in" && (
        <p className="mt-4 rounded-md bg-card p-3 text-small text-title">
          Você já entrou como <strong className="font-medium">{session.user.nickname}</strong>.{" "}
          <Link href="/profile" className="text-primary-focus underline underline-offset-4 hover:text-title">
            Ir para o perfil
          </Link>
        </p>
      )}

      <form noValidate onSubmit={handleSubmit} className="mt-6 flex flex-col gap-5">
        <ErrorSummary
          ref={errorSummaryRef}
          title={signInError ? "Não foi possível entrar" : "Corrija os campos abaixo para entrar"}
          items={summaryItems}
        />
        <p className="text-small text-subtitle">Campos com * são obrigatórios.</p>
        <TextField
          id={FIELD_IDS.identifier}
          label="Apelido ou e-mail"
          autoComplete="username"
          autoCapitalize="none"
          spellCheck={false}
          placeholder="Ex.: maria_gamer"
          {...registerField("identifier")}
        />
        <PasswordField
          id={FIELD_IDS.password}
          label="Senha"
          autoComplete="current-password"
          {...registerField("password")}
        />
        <SubmitButton label="Entrar" loadingLabel="Entrando..." isLoading={isSubmitting} />
      </form>

      <p className="mt-6 text-medium text-subtitle">
        Ainda não tem conta?{" "}
        <Link href={withRedirect("/signup", redirectTo)} className="font-medium text-primary-focus underline underline-offset-4 hover:text-title">
          Criar conta
        </Link>
      </p>

      {/* Atalho para quem for avaliar o projeto testar sem precisar se cadastrar. */}
      <p className="mt-4 rounded-md border border-border p-3 text-small text-subtitle">
        Para testar, use o apelido <strong className="font-medium text-title">demo</strong> e a
        senha <strong className="font-medium text-title">Can12345</strong>.
      </p>
    </div>
  );
}
