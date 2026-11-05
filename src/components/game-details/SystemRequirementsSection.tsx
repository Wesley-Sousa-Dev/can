import { SectionHeader } from "@/components/ui/SectionHeader";
import type { SystemRequirements } from "@/types/game";

interface SystemRequirementsSectionProps {
  minimumRequirements: SystemRequirements;
  recommendedRequirements: SystemRequirements;
}

interface RequirementsListProps {
  title: string;
  requirements: SystemRequirements;
}

const HEADING_ID = "requirements-heading";

const REQUIREMENT_LABELS: { key: keyof SystemRequirements; label: string }[] = [
  { key: "operatingSystem", label: "Sistema operacional" },
  { key: "processor", label: "Processador" },
  { key: "memory", label: "Memória" },
  { key: "graphics", label: "Placa de vídeo" },
  { key: "storage", label: "Armazenamento" },
];

function RequirementsList({ title, requirements }: RequirementsListProps) {
  return (
    <div className="rounded-lg bg-panel p-4 shadow-soft">
      <h3 className="text-medium font-medium uppercase tracking-wide text-subtitle">{title}</h3>
      <dl className="mt-3 flex flex-col gap-3">
        {REQUIREMENT_LABELS.map(({ key, label }) => (
          <div key={key}>
            <dt className="text-small text-subtitle">{label}</dt>
            <dd className="text-medium text-title">{requirements[key]}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

export function SystemRequirementsSection({
  minimumRequirements,
  recommendedRequirements,
}: SystemRequirementsSectionProps) {
  return (
    <section aria-labelledby={HEADING_ID}>
      <SectionHeader headingId={HEADING_ID} title="Requisitos de sistema" />
      <div className="grid gap-4 md:grid-cols-2">
        <RequirementsList title="Mínimos" requirements={minimumRequirements} />
        <RequirementsList title="Recomendados" requirements={recommendedRequirements} />
      </div>
    </section>
  );
}
