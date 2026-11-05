"use client";

import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useId, useRef, useState } from "react";

import { SectionHeader } from "@/components/ui/SectionHeader";
import { deleteAccount } from "@/services/authService";

interface DeleteAccountSectionProps {
  userId: string;
  nickname: string;
}

const HEADING_ID = "delete-account-heading";

// Exclusão da conta (equivale a DELETE /users/:id). Uma ação que não dá para
// desfazer sempre pede confirmação em uma janela própria (WCAG 3.3.4).
export function DeleteAccountSection({ userId, nickname }: DeleteAccountSectionProps) {
  const router = useRouter();
  const confirmationDialogRef = useRef<HTMLDialogElement>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const dialogTitleId = useId();
  const dialogDescriptionId = useId();

  // O primeiro botão da janela é "Cancelar": o showModal() foca nele, então
  // um Enter apressado não apaga a conta por engano.
  function openConfirmation() {
    confirmationDialogRef.current?.showModal();
  }

  function closeConfirmation() {
    confirmationDialogRef.current?.close();
  }

  async function confirmDeletion() {
    if (isDeleting) {
      return;
    }
    setIsDeleting(true);
    await deleteAccount(userId);
    closeConfirmation();
    router.push("/");
  }

  return (
    <section aria-labelledby={HEADING_ID}>
      <SectionHeader headingId={HEADING_ID} title="Excluir conta" />
      <div className="flex flex-col items-start gap-4 rounded-lg border border-destructive p-5">
        <p className="text-medium text-title">
          Apaga seu perfil, sua biblioteca, sua lista de desejos e seu carrinho. Não dá para desfazer.
        </p>
        <button
          type="button"
          onClick={openConfirmation}
          className="inline-flex min-h-11 items-center gap-2 rounded-md border border-destructive px-4 text-medium font-medium text-title transition-colors hover:bg-card"
        >
          <Trash2 aria-hidden="true" className="size-5 text-error-text" />
          Excluir minha conta
        </button>
      </div>

      <dialog
        ref={confirmationDialogRef}
        role="alertdialog"
        aria-labelledby={dialogTitleId}
        aria-describedby={dialogDescriptionId}
        className="m-auto w-full max-w-md rounded-lg bg-panel p-6 text-title shadow-strong backdrop:bg-background-base"
      >
        <h2 id={dialogTitleId} className="font-display text-x-large text-title">
          Excluir a conta {nickname}?
        </h2>
        <p id={dialogDescriptionId} className="mt-2 text-medium text-title">
          Seu perfil, sua biblioteca, sua lista de desejos e seu carrinho serão apagados. Essa ação
          não pode ser desfeita.
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={closeConfirmation}
            className="inline-flex min-h-11 items-center justify-center rounded-md border border-border-input px-5 text-medium font-medium text-title transition-colors hover:bg-card"
          >
            Cancelar
          </button>
          {/* Texto escuro sobre o vermelho: texto claro ficaria abaixo de 4,5:1 (ver AGENTS.md). */}
          <button
            type="button"
            onClick={confirmDeletion}
            aria-disabled={isDeleting}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-destructive px-5 text-medium font-medium text-on-accent shadow-soft underline-offset-4 hover:underline aria-disabled:cursor-wait"
          >
            <Trash2 aria-hidden="true" className="size-5" />
            {isDeleting ? "Excluindo..." : "Excluir conta"}
          </button>
        </div>
      </dialog>
    </section>
  );
}
