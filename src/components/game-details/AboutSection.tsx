import { SectionHeader } from "@/components/ui/SectionHeader";
import type { GameAboutSection } from "@/types/game";

interface AboutSectionProps {
  sections: GameAboutSection[];
}

const HEADING_ID = "about-heading";

// A descrição da Steam chega como texto corrido, com linhas em branco entre os parágrafos.
function splitIntoParagraphs(text: string): string[] {
  return text
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}

export function AboutSection({ sections }: AboutSectionProps) {
  // Com uma seção só, o subtítulo repetiria o título "Sobre este jogo".
  const showsSectionTitles = sections.length > 1;

  return (
    <section aria-labelledby={HEADING_ID}>
      <SectionHeader headingId={HEADING_ID} title="Sobre este jogo" />
      <div className="flex flex-col gap-5">
        {sections.map((section) => (
          <div key={section.title} className="flex max-w-prose flex-col gap-3">
            {showsSectionTitles && <h3 className="text-large font-medium text-title">{section.title}</h3>}
            {/* Texto principal de leitura na cor de título: contraste de 17:1 (AAA). */}
            {splitIntoParagraphs(section.text).map((paragraph, paragraphIndex) => (
              <p key={paragraphIndex} className="whitespace-pre-line text-medium text-title wrap-break-word">
                {paragraph}
              </p>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}
