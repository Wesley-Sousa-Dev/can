import { SidePanel } from "@/components/ui/SidePanel";
import { describeAgeRating } from "@/lib/ageRating";
import type { AgeRating } from "@/types/game";

interface AgeRatingPanelProps {
  ageRating: AgeRating;
  descriptors: string[];
}

// As cores oficiais da Classificação Indicativa (verde, azul, amarelo...) não
// estão no manual, então o selo usa só o texto e a borda, sem depender de cor.
export function AgeRatingPanel({ ageRating, descriptors }: AgeRatingPanelProps) {
  return (
    <SidePanel headingId="age-rating-heading" title="Classificação indicativa">
      <div className="flex items-start gap-4">
        <span
          aria-hidden="true"
          className="grid size-16 shrink-0 place-items-center rounded-md border-2 border-title font-display text-xx-large text-title"
        >
          {ageRating}
        </span>
        <div>
          <p className="text-medium font-medium text-title">{describeAgeRating(ageRating)}</p>
          {descriptors.length > 0 && (
            <p className="mt-1 text-small text-subtitle">{descriptors.join(", ")}</p>
          )}
        </div>
      </div>
    </SidePanel>
  );
}
