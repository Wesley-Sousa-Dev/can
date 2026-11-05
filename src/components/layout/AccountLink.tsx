"use client";

import Link from "next/link";

import { Avatar } from "@/components/ui/Avatar";
import { useSession } from "@/hooks/useSession";

interface AccountLinkProps {
  className?: string;
  /** Chamado ao clicar; o menu mobile usa para se fechar. */
  onNavigate?: () => void;
}

const SIGN_IN_CLASS =
  "min-h-11 items-center justify-center rounded-md bg-primary px-4 text-medium font-medium text-title transition-colors hover:bg-primary-hover";

const PROFILE_CLASS =
  "min-h-11 items-center gap-2 rounded-md px-2 text-medium font-medium text-title transition-colors hover:bg-card";

// "Entrar" para visitantes; avatar e apelido para quem já entrou na conta.
// Enquanto a sessão carrega, mostra "Entrar", que é o caso mais comum.
export function AccountLink({ className = "", onNavigate }: AccountLinkProps) {
  const session = useSession();

  if (session.status !== "signed-in") {
    return (
      <Link href="/login" onClick={onNavigate} className={`${SIGN_IN_CLASS} ${className}`}>
        Entrar
      </Link>
    );
  }

  return (
    <Link href="/profile" onClick={onNavigate} className={`${PROFILE_CLASS} ${className}`}>
      <Avatar fullName={session.user.fullName} size="small" />
      {session.user.nickname}
      <span className="sr-only">: meu perfil</span>
    </Link>
  );
}
