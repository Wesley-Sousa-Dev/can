import { SectionHeader } from "@/components/ui/SectionHeader";
import type { GameAboutSection } from "@/types/game";

interface AboutSectionProps {
  sections: GameAboutSection[];
}

const HEADING_ID = "about-heading";

export function AboutSection({ sections }: AboutSectionProps) {
  return (
    <section aria-labelledby={HEADING_ID}>
      <SectionHeader headingId={HEADING_ID} title="Sobre este jogo" />
      <div className="flex flex-col gap-5">
        {sections.map((section) => (
          <div key={section.title}>
            <h3 className="text-large font-medium text-title">{section.title}</h3>
            {/* Texto principal de leitura na cor de título: contraste de 17:1 (AAA). */}
            <p className="mt-1 max-w-prose text-medium text-title">{section.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
