import { Accessibility } from "lucide-react";

import { SidePanel } from "@/components/ui/SidePanel";

interface AccessibilityPanelProps {
  accessibilityFeatures: string[];
}

export function AccessibilityPanel({ accessibilityFeatures }: AccessibilityPanelProps) {
  return (
    <SidePanel headingId="accessibility-heading" title="Recursos de acessibilidade">
      {accessibilityFeatures.length === 0 ? (
        <p className="text-medium text-subtitle">A desenvolvedora não informou recursos.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {accessibilityFeatures.map((feature) => (
            <li key={feature} className="flex items-start gap-3 text-medium text-title">
              <Accessibility aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-primary-focus" />
              {feature}
            </li>
          ))}
        </ul>
      )}
    </SidePanel>
  );
}
