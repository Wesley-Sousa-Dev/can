"use client";

import { Pencil } from "lucide-react";
import { useRef, useState, type FormEvent } from "react";
import { flushSync } from "react-dom";

import { buildErrorSummaryItems, ErrorSummary } from "@/components/forms/ErrorSummary";
import { SubmitButton } from "@/components/forms/SubmitButton";
import { TextField } from "@/components/forms/TextField";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { useValidatedForm } from "@/hooks/useValidatedForm";
import {
  EMAIL_TAKEN_MESSAGE,
  NICKNAME_TAKEN_MESSAGE,
  validateAddress,
  validateEmail,
  validateFullName,
  validateNickname,
} from "@/lib/accountValidation";
import { formatLongDate } from "@/lib/dates";
import { updateProfile } from "@/services/authService";
import type { UserProfile } from "@/types/user";

const HEADING_ID = "account-heading";

const FIELD_IDS = {
  fullName: "profile-full-name",
  nickname: "profile-nickname",
  email: "profile-email",
  address: "profile-address",
};

interface AccountDetailsProps {
  user: UserProfile;
}

interface EditAccountFormProps {
  user: UserProfile;
  onCancel: () => void;
  onSaved: () => void;
}

function AccountDetailsList({ user }: AccountDetailsProps) {
  const rows = [
    { term: "Nome completo", value: user.fullName },
    { term: "Apelido", value: user.nickname },
    { term: "E-mail", value: user.email },
    { term: "Data de nascimento", value: formatLongDate(user.birthDate) },
    { term: "Endereço", value: user.address },
  ];

  return (
    <dl className="grid gap-4 sm:grid-cols-2">
      {rows.map((row) => (
        <div key={row.term}>
          <dt className="text-small text-subtitle">{row.term}</dt>
          <dd className="break-words text-medium text-title">{row.value}</dd>
        </div>
      ))}
    </dl>
  );
}

function EditAccountForm({ user, onCancel, onSaved }: EditAccountFormProps) {
  const { values, errors, registerField, validateAllFields, setFieldError } = useValidatedForm(
    { fullName: user.fullName, nickname: user.nickname, email: user.email, address: user.address },
    {
      fullName: validateFullName,
      nickname: validateNickname,
      email: validateEmail,
      address: validateAddress,
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
    const result = await updateProfile(user.id, values);
    if (result.isSuccess) {
      onSaved();
      return;
    }

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
    <form noValidate onSubmit={handleSubmit} aria-labelledby={HEADING_ID} className="flex flex-col gap-4">
      <ErrorSummary ref={errorSummaryRef} title="Corrija os campos abaixo para salvar" items={summaryItems} />
      <TextField id={FIELD_IDS.fullName} label="Nome completo" autoComplete="name" {...registerField("fullName")} />
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          id={FIELD_IDS.nickname}
          label="Apelido"
          hint="De 3 a 20 caracteres."
          autoComplete="username"
          autoCapitalize="none"
          spellCheck={false}
          {...registerField("nickname")}
        />
        <TextField
          id={FIELD_IDS.email}
          label="E-mail"
          type="email"
          inputMode="email"
          autoComplete="email"
          autoCapitalize="none"
          spellCheck={false}
          {...registerField("email")}
        />
      </div>
      <TextField id={FIELD_IDS.address} label="Endereço" autoComplete="street-address" {...registerField("address")} />
      <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex min-h-11 items-center justify-center rounded-md border border-border-input px-5 text-medium font-medium text-title transition-colors hover:bg-card"
        >
          Cancelar
        </button>
        <div className="sm:w-56">
          <SubmitButton label="Salvar alterações" loadingLabel="Salvando..." isLoading={isSubmitting} />
        </div>
      </div>
    </form>
  );
}

// Dados da conta com edição no próprio lugar (equivale a PATCH /users/:id).
export function AccountDetails({ user }: AccountDetailsProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const editButtonRef = useRef<HTMLButtonElement>(null);

  // Ao trocar entre ver e editar, o foco vai para onde a pessoa vai agir em
  // seguida, em vez de se perder quando o botão some da tela.
  function startEditing() {
    flushSync(() => {
      setIsEditing(true);
      setStatusMessage("");
    });
    document.getElementById(FIELD_IDS.fullName)?.focus();
  }

  function finishEditing(message: string) {
    flushSync(() => {
      setIsEditing(false);
      setStatusMessage(message);
    });
    editButtonRef.current?.focus();
  }

  return (
    <section aria-labelledby={HEADING_ID}>
      <div className="flex flex-wrap items-start justify-between gap-x-4">
        <SectionHeader headingId={HEADING_ID} title="Dados da conta" />
        {!isEditing && (
          <button
            ref={editButtonRef}
            type="button"
            onClick={startEditing}
            className="mb-5 inline-flex min-h-11 items-center gap-2 rounded-md border border-border-input px-4 text-medium font-medium text-title transition-colors hover:bg-card"
          >
            <Pencil aria-hidden="true" className="size-5" />
            Editar dados
          </button>
        )}
      </div>

      <div className="rounded-lg bg-panel p-5 shadow-soft">
        {isEditing ? (
          <EditAccountForm
            user={user}
            onCancel={() => finishEditing("")}
            onSaved={() => finishEditing("Seus dados foram atualizados.")}
          />
        ) : (
          <AccountDetailsList user={user} />
        )}
      </div>

      {/* Sempre no HTML, mesmo vazia, para o leitor de tela anunciar a confirmação. */}
      <p role="status" className="mt-3 text-small text-subtitle">
        {statusMessage}
      </p>
    </section>
  );
}
