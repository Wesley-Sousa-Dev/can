"use client";

import { Sparkles } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { AccountDetails } from "@/components/profile/AccountDetails";
import { DeleteAccountSection } from "@/components/profile/DeleteAccountSection";
import { GameShelf } from "@/components/profile/GameShelf";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { useGameCollection } from "@/hooks/useGameCollection";
import { useSession } from "@/hooks/useSession";
import { signOut } from "@/services/authService";
import {
  cartCollection,
  libraryCollection,
  wishlistCollection,
} from "@/services/userCollections";
import type { Game } from "@/types/game";

interface ProfileViewProps {
  games: Game[];
  isNewAccount: boolean;
}

// Função fora do componente: o React só chama um ref estável ao montar o
// elemento, então o foco vai para a mensagem uma vez, sem roubar o foco depois.
function focusOnMount(element: HTMLElement | null) {
  element?.focus();
}

function WelcomeMessage({ nickname }: { nickname: string }) {
  return (
    <div
      ref={focusOnMount}
      tabIndex={-1}
      className="flex items-start gap-3 rounded-lg border border-cta bg-card p-4 focus:outline-none focus-visible:outline-2"
    >
      <Sparkles aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-cta" />
      <p className="text-medium text-title">
        Conta criada! Boas-vindas à Can, <strong className="font-medium">{nickname}</strong>.{" "}
        <Link href="/" className="text-primary-focus underline underline-offset-4 hover:text-title">
          Que tal escolher seu primeiro jogo?
        </Link>
      </p>
    </div>
  );
}

function SignedOutNotice() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col items-start gap-4 px-4 py-16 sm:px-6">
      <h1 className="font-display text-xx-large text-title">Entre para ver seu perfil</h1>
      <p className="text-medium text-title">
        O perfil mostra sua biblioteca, sua lista de desejos e os dados da sua conta.
      </p>
      <div className="flex flex-wrap gap-3">
        <Link
          href="/login"
          className="inline-flex min-h-11 items-center rounded-md bg-primary px-5 text-medium font-medium text-title transition-colors hover:bg-primary-hover"
        >
          Entrar
        </Link>
        <Link
          href="/signup"
          className="inline-flex min-h-11 items-center rounded-md border border-border-input px-5 text-medium font-medium text-title transition-colors hover:bg-card"
        >
          Criar conta
        </Link>
      </div>
    </div>
  );
}

export function ProfileView({ games, isNewAccount }: ProfileViewProps) {
  const router = useRouter();
  const session = useSession();
  const library = useGameCollection(libraryCollection);
  const wishlist = useGameCollection(wishlistCollection);
  const cart = useGameCollection(cartCollection);

  // A sessão mora no navegador: no HTML do servidor ainda não se sabe quem está conectado.
  if (session.status === "loading") {
    return (
      <p aria-busy="true" className="mx-auto max-w-6xl px-4 py-16 text-medium text-subtitle sm:px-6">
        Carregando perfil...
      </p>
    );
  }

  if (session.status === "signed-out") {
    return <SignedOutNotice />;
  }

  const { user } = session;
  const gamesById = new Map(games.map((game) => [game.id, game]));
  const findGames = (gameIds: readonly string[]) => gameIds.flatMap((gameId) => gamesById.get(gameId) ?? []);

  function handleSignOut() {
    signOut();
    router.push("/");
  }

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-10 px-4 py-6 sm:px-6">
      {isNewAccount && <WelcomeMessage nickname={user.nickname} />}
      <ProfileHeader
        user={user}
        libraryCount={library.gameIds.length}
        wishlistCount={wishlist.gameIds.length}
        cartCount={cart.gameIds.length}
        onSignOut={handleSignOut}
      />
      <GameShelf
        headingId="library-heading"
        title="Biblioteca"
        games={findGames(library.gameIds)}
        emptyMessage="Sua biblioteca está vazia. Jogos gratuitos e compras aparecem aqui."
      />
      <GameShelf
        headingId="wishlist-heading"
        title="Lista de desejos"
        games={findGames(wishlist.gameIds)}
        emptyMessage="Nenhum jogo na lista de desejos ainda. Use o botão de coração na página de um jogo."
      />
      <AccountDetails user={user} />
      <DeleteAccountSection userId={user.id} nickname={user.nickname} />
    </div>
  );
}
