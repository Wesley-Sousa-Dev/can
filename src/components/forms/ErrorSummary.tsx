"use client";

import { CircleAlert } from "lucide-react";
import { useId, type MouseEvent, type Ref } from "react";

export interface ErrorSummaryItem {
  fieldId: string;
  message: string;
}

/** Monta a lista do resumo na mesma ordem em que os campos aparecem na tela. */
export function buildErrorSummaryItems<TFieldName extends string>(
  errors: Partial<Record<TFieldName, string>>,
  fieldIds: Record<TFieldName, string>,
): ErrorSummaryItem[] {
  return (Object.keys(fieldIds) as TFieldName[]).flatMap((fieldName) => {
    const message = errors[fieldName];
    return message ? [{ fieldId: fieldIds[fieldName], message }] : [];
  });
}

interface ErrorSummaryProps {
  title: string;
  items: ErrorSummaryItem[];
  /** O formulário move o foco para cá quando o envio falha. */
  ref?: Ref<HTMLDivElement>;
}

// Resumo de erros no topo do formulário, no padrão do gov.uk: ao falhar o
// envio, o foco vem para cá, o leitor de tela lê a lista inteira e cada
// item leva direto ao campo com problema.
export function ErrorSummary({ title, items, ref }: ErrorSummaryProps) {
  const titleId = useId();

  if (items.length === 0) {
    return null;
  }

  // Um link comum só rolaria a página. Aqui o foco vai para o campo,
  // e a pessoa já pode corrigir digitando.
  function focusField(event: MouseEvent<HTMLAnchorElement>, fieldId: string) {
    const field = document.getElementById(fieldId);
    if (!field) {
      return;
    }
    event.preventDefault();
    field.focus();
    field.scrollIntoView({ block: "center" });
  }

  return (
    <div
      ref={ref}
      tabIndex={-1}
      aria-labelledby={titleId}
      role="region"
      className="rounded-md border-2 border-destructive bg-card p-4 focus:outline-none focus-visible:outline-2"
    >
      <h2 id={titleId} className="flex items-center gap-2 text-medium font-medium text-title">
        <CircleAlert aria-hidden="true" className="size-5 shrink-0 text-error-text" />
        {title}
      </h2>
      <ul className="mt-2 flex flex-col gap-1 pl-7">
        {items.map((item) => (
          <li key={item.fieldId}>
            <a
              href={`#${item.fieldId}`}
              onClick={(event) => focusField(event, item.fieldId)}
              className="inline-flex min-h-6 items-center text-small text-error-text underline underline-offset-4 hover:text-title"
            >
              {item.message}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
