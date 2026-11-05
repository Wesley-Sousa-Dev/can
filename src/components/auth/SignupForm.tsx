"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState, type FormEvent, type ReactNode } from "react";
import { flushSync } from "react-dom";

import { buildErrorSummaryItems, ErrorSummary } from "@/components/forms/ErrorSummary";
import { PasswordField } from "@/components/forms/PasswordField";
import { SubmitButton } from "@/components/forms/SubmitButton";
import { TextField } from "@/components/forms/TextField";
import { useValidatedForm } from "@/hooks/useValidatedForm";
import {
  EMAIL_TAKEN_MESSAGE,
  NICKNAME_TAKEN_MESSAGE,
  validateAddress,
  validateBirthDate,
  validateEmail,
  validateFullName,
  validateNewPassword,
  validateNickname,
} from "@/lib/accountValidation";
import { withRedirect } from "@/lib/safeRedirect";
import { registerAccount } from "@/services/authService";

const FIELD_IDS = {
  fullName: "signup-full-name",
  nickname: "signup-nickname",
  birthDate: "signup-birth-date",
  address: "signup-address",
  email: "signup-email",
  password: "signup-password",
};

interface FieldGroupProps {
  legend: string;
  children: ReactNode;
}

// Campos agrupados por assunto, com título, como no formulário bom do slide 4 da Aula 2.
function FieldGroup({ legend, children }: FieldGroupProps) {
  return (
    <fieldset className="flex flex-col gap-4">
      <legend className="mb-3 w-full border-b border-border pb-2 text-small font-medium uppercase tracking-wide text-subtitle">
        {legend}
      </legend>
      {children}
    </fieldset>
  );
}

interface SignupFormProps {
  /** Página para onde a pessoa vai depois de criar a conta. Sem ela, vai para o perfil. */
  redirectTo?: string;
}

export function SignupForm({ redirectTo }: SignupFormProps) {
  const router = useRouter();
  const { values, errors, registerField, validateAllFields, setFieldError } = useValidatedForm(
    { fullName: "", nickname: "", birthDate: "", address: "", email: "", password: "" },
    {
      fullName: validateFullName,
      nickname: validateNickname,
      // Embrulhada para não repassar os outros valores como "data de hoje".
      birthDate: (birthDate) => validateBirthDate(birthDate),
      address: validateAddress,
      email: validateEmail,
      password: validateNewPassword,
    },
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const errorSummaryRef = useRef<HTMLDivElement>(null);
  const summaryItems = buildErrorSummaryItems(errors, FIELD_IDS);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting) {
      return;
    }

    const foundErrors = flushSync(() => validateAllFields());
    if (Object.keys(foundErrors).length > 0) {
      errorSummaryRef.current?.focus();
      return;
    }

    setIsSubmitting(true);
    const result = await registerAccount(values);
    if (result.isSuccess) {
      router.push(redirectTo ?? "/profile?welcome=true");
      return;
    }

    // Apelido ou e-mail repetido só é descoberto no servidor: o erro volta para o campo certo.
    flushSync(() => {
      setIsSubmitting(false);
      if (result.errorCode === "nickname-taken") {
        setFieldError("nickname", NICKNAME_TAKEN_MESSAGE);
      }
      if (result.errorCode === "email-taken") {
        setFieldError("email", EMAIL_TAKEN_MESSAGE);
      }
    });
    errorSummaryRef.current?.focus();
  }

  return (
    <div className="mx-auto w-full max-w-md">
      <h1 className="font-display text-xxx-large uppercase text-title">Criar conta</h1>
      <p className="mt-2 text-medium text-subtitle">
        Leva menos de um minuto. Depois é só escolher o primeiro jogo.
      </p>

      <form noValidate onSubmit={handleSubmit} className="mt-6 flex flex-col gap-6">
        <ErrorSummary
          ref={errorSummaryRef}
          title={
            summaryItems.length === 1
              ? "Corrija 1 campo para criar a conta"
              : `Corrija ${summaryItems.length} campos para criar a conta`
          }
          items={summaryItems}
        />
        <p className="text-small text-subtitle">Todos os campos são obrigatórios.</p>

        <FieldGroup legend="Sobre você">
          <TextField
            id={FIELD_IDS.fullName}
            label="Nome completo"
            autoComplete="name"
            placeholder="Ex.: Maria da Silva"
            {...registerField("fullName")}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField
              id={FIELD_IDS.nickname}
              label="Apelido"
              hint="De 3 a 20 caracteres. Aparece no seu perfil."
              autoComplete="username"
              autoCapitalize="none"
              spellCheck={false}
              placeholder="Ex.: maria_gamer"
              {...registerField("nickname")}
            />
            <TextField
              id={FIELD_IDS.birthDate}
              label="Data de nascimento"
              hint="É preciso ter pelo menos 13 anos."
              type="date"
              autoComplete="bday"
              min="1900-01-01"
              {...registerField("birthDate")}
            />
          </div>
        </FieldGroup>

        <FieldGroup legend="Contato">
          <TextField
            id={FIELD_IDS.address}
            label="Endereço"
            autoComplete="street-address"
            placeholder="Ex.: Rua das Flores, 123, Ijuí - RS"
            {...registerField("address")}
          />
          <TextField
            id={FIELD_IDS.email}
            label="E-mail"
            type="email"
            inputMode="email"
            autoComplete="email"
            autoCapitalize="none"
            spellCheck={false}
            placeholder="Ex.: maria@exemplo.com"
            {...registerField("email")}
          />
        </FieldGroup>

        <FieldGroup legend="Acesso">
          <PasswordField
            id={FIELD_IDS.password}
            label="Senha"
            hint="Mínimo de 8 caracteres, com letras e números."
            autoComplete="new-password"
            {...registerField("password")}
          />
        </FieldGroup>

        <SubmitButton label="Criar conta" loadingLabel="Criando conta..." isLoading={isSubmitting} />
      </form>

      <p className="mt-6 text-medium text-subtitle">
        Já tem uma conta?{" "}
        <Link href={withRedirect("/login", redirectTo)} className="font-medium text-primary-focus underline underline-offset-4 hover:text-title">
          Entrar
        </Link>
      </p>
    </div>
  );
}
