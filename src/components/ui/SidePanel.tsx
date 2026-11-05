import type { ReactNode } from "react";

interface SidePanelProps {
  headingId: string;
  title: string;
  children: ReactNode;
}

// Caixa da barra lateral da página do jogo, como os blocos da direita na Steam.
export function SidePanel({ headingId, title, children }: SidePanelProps) {
  return (
    <section aria-labelledby={headingId} className="rounded-lg bg-panel p-4 shadow-soft">
      <h2
        id={headingId}
        className="mb-3 text-medium font-medium uppercase tracking-wide text-subtitle"
      >
        {title}
      </h2>
      {children}
    </section>
  );
}
