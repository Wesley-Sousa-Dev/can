interface SkipLinkProps {
  targetId: string;
}

// Primeiro item do Tab: deixa quem usa teclado pular o cabeçalho (WCAG 2.4.1).
export function SkipLink({ targetId }: SkipLinkProps) {
  return (
    <a
      href={`#${targetId}`}
      className="sr-only rounded-md bg-primary px-4 py-3 text-medium font-medium text-title focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50"
    >
      Pular para o conteúdo principal
    </a>
  );
}
