import {
  Cloud,
  Gamepad2,
  Handshake,
  Trophy,
  User,
  Users,
  type LucideIcon,
} from "lucide-react";

import { SidePanel } from "@/components/ui/SidePanel";
import type { GameFeatureId } from "@/types/game";

interface GameFeaturesPanelProps {
  features: GameFeatureId[];
}

const FEATURE_PRESENTATION: Record<GameFeatureId, { label: string; Icon: LucideIcon }> = {
  "single-player": { label: "Um jogador", Icon: User },
  "online-multiplayer": { label: "Multijogador on-line", Icon: Users },
  "co-op": { label: "Cooperativo", Icon: Handshake },
  achievements: { label: "Conquistas", Icon: Trophy },
  "controller-support": { label: "Suporte a controle", Icon: Gamepad2 },
  "cloud-saves": { label: "Salvamento na nuvem", Icon: Cloud },
};

export function GameFeaturesPanel({ features }: GameFeaturesPanelProps) {
  return (
    <SidePanel headingId="features-heading" title="Recursos">
      <ul className="flex flex-col gap-1">
        {features.map((featureId) => {
          const { label, Icon } = FEATURE_PRESENTATION[featureId];
          return (
            <li key={featureId} className="flex items-center gap-3 rounded-md bg-card px-3 py-2 text-medium text-title">
              <Icon aria-hidden="true" className="size-5 shrink-0 text-primary-focus" />
              {label}
            </li>
          );
        })}
      </ul>
    </SidePanel>
  );
}
