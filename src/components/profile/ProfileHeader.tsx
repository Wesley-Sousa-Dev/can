import { LogOut } from "lucide-react";

import { Avatar } from "@/components/ui/Avatar";
import { formatMemberSince } from "@/lib/userDisplay";
import type { UserProfile } from "@/types/user";

interface ProfileHeaderProps {
  user: UserProfile;
  libraryCount: number;
  wishlistCount: number;
  cartCount: number;
  onSignOut: () => void;
}

interface ProfileStatProps {
  label: string;
  value: number;
}

function ProfileStat({ label, value }: ProfileStatProps) {
  return (
    <div className="px-6 py-4">
      <dt className="text-small uppercase tracking-wide text-subtitle">{label}</dt>
      <dd className="font-display text-xx-large text-title">{value}</dd>
    </div>
  );
}

// Topo do perfil, como o da Steam: faixa colorida, avatar, apelido e números da conta.
export function ProfileHeader({
  user,
  libraryCount,
  wishlistCount,
  cartCount,
  onSignOut,
}: ProfileHeaderProps) {
  return (
    <section aria-labelledby="profile-heading" className="overflow-hidden rounded-lg bg-panel shadow-strong">
      <div aria-hidden="true" className="h-28 bg-linear-to-r from-primary-hover via-primary to-tag sm:h-36" />

      <div className="flex flex-col gap-4 px-6 pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:gap-5">
          <Avatar fullName={user.fullName} size="large" className="-mt-12 ring-4 ring-panel" />
          <div>
            <h1 id="profile-heading" className="font-display text-xxx-large text-title">
              {user.nickname}
            </h1>
            <p className="text-medium text-title">{user.fullName}</p>
            <p className="text-small text-subtitle">Membro desde {formatMemberSince(user.createdAt)}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onSignOut}
          className="inline-flex min-h-11 items-center justify-center gap-2 self-start rounded-md border border-border-input px-4 text-medium font-medium text-title transition-colors hover:bg-card sm:self-auto"
        >
          <LogOut aria-hidden="true" className="size-5" />
          Sair
        </button>
      </div>

      <dl className="grid grid-cols-1 border-t border-border sm:grid-cols-3">
        <ProfileStat label="Jogos na biblioteca" value={libraryCount} />
        <ProfileStat label="Lista de desejos" value={wishlistCount} />
        <ProfileStat label="No carrinho" value={cartCount} />
      </dl>
    </section>
  );
}
