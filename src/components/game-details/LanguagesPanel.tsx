import { Check } from "lucide-react";

import { SidePanel } from "@/components/ui/SidePanel";
import type { LanguageSupport } from "@/types/game";

interface LanguagesPanelProps {
  gameTitle: string;
  languages: LanguageSupport[];
}

interface SupportMarkProps {
  isSupported: boolean;
}

// O ícone é só visual. O texto "Sim" ou "Não" é o que o leitor de tela lê na célula.
function SupportMark({ isSupported }: SupportMarkProps) {
  return isSupported ? (
    <>
      <Check aria-hidden="true" className="mx-auto size-5 text-primary-focus" />
      <span className="sr-only">Sim</span>
    </>
  ) : (
    <>
      <span aria-hidden="true" className="text-subtitle">
        —
      </span>
      <span className="sr-only">Não</span>
    </>
  );
}

export function LanguagesPanel({ gameTitle, languages }: LanguagesPanelProps) {
  return (
    <SidePanel headingId="languages-heading" title="Idiomas">
      {/* Tabela de verdade, com cabeçalhos de linha e coluna, para o leitor de tela
          anunciar "Português, Dublagem: Sim" ao navegar pelas células. */}
      <table className="w-full text-small">
        <caption className="sr-only">Idiomas disponíveis em {gameTitle}</caption>
        <thead>
          <tr className="border-b border-border text-subtitle">
            <th scope="col" className="py-2 pr-2 text-left font-normal">
              Idioma
            </th>
            <th scope="col" className="px-1 py-2 text-center font-normal">
              Interface
            </th>
            <th scope="col" className="px-1 py-2 text-center font-normal">
              Dublagem
            </th>
            <th scope="col" className="py-2 pl-1 text-center font-normal">
              Legendas
            </th>
          </tr>
        </thead>
        <tbody>
          {languages.map((languageSupport) => (
            <tr key={languageSupport.language} className="border-b border-border last:border-b-0">
              <th scope="row" className="py-2 pr-2 text-left font-normal text-title">
                {languageSupport.language}
              </th>
              <td className="px-1 py-2 text-center">
                <SupportMark isSupported={languageSupport.hasInterface} />
              </td>
              <td className="px-1 py-2 text-center">
                <SupportMark isSupported={languageSupport.hasAudio} />
              </td>
              <td className="py-2 pl-1 text-center">
                <SupportMark isSupported={languageSupport.hasSubtitles} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </SidePanel>
  );
}
