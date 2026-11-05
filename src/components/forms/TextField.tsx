import { CircleAlert } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";

interface TextFieldProps extends Omit<ComponentProps<"input">, "id" | "required"> {
  id: string;
  label: string;
  /** Instrução que aparece antes do erro, como "Mínimo de 8 caracteres". */
  hint?: string;
  error?: string;
  isRequired?: boolean;
  /** Controle extra dentro do campo, como o botão de mostrar senha. */
  trailingControl?: ReactNode;
}

// Rótulo sempre visível acima do campo, nunca só o placeholder (slide 4 da Aula 2).
// A dica e o erro ficam ligados ao campo por aria-describedby: o leitor de
// tela lê os dois ao entrar no campo.
export function TextField({
  id,
  label,
  hint,
  error,
  isRequired = true,
  trailingControl,
  className = "",
  ...inputProps
}: TextFieldProps) {
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <label htmlFor={id} className="text-medium font-medium text-title">
        {label}
        {/* O asterisco é só visual; o atributo required já anuncia "obrigatório". */}
        {isRequired && <span aria-hidden="true"> *</span>}
      </label>
      {hint && (
        <p id={hintId} className="text-small text-subtitle">
          {hint}
        </p>
      )}
      <div className="relative">
        <input
          id={id}
          required={isRequired}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={`min-h-11 w-full rounded-md border bg-background px-3 text-medium text-title placeholder:text-placeholder ${
            trailingControl ? "pr-12" : ""
          } ${error ? "border-destructive" : "border-border-input"}`}
          {...inputProps}
        />
        {trailingControl && (
          <div className="absolute inset-y-0 right-0 flex items-center">{trailingControl}</div>
        )}
      </div>
      {/* O erro usa ícone e texto, além da borda vermelha: não depende só da cor (WCAG 1.4.1). */}
      {error && (
        <p id={errorId} className="flex items-start gap-2 text-small text-error-text">
          <CircleAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}
