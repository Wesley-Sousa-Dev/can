import { Search } from "lucide-react";
import type { Ref } from "react";

interface SearchFieldProps {
  id: string;
  label: string;
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
  /** Permite devolver o foco ao campo, por exemplo depois de limpar a busca. */
  ref?: Ref<HTMLInputElement>;
  className?: string;
}

// Campo de busca que filtra enquanto a pessoa digita. O rótulo fica visível,
// e o placeholder só dá exemplos do que dá para buscar.
export function SearchField({ id, label, value, placeholder, onChange, ref, className = "" }: SearchFieldProps) {
  return (
    <div className={`flex min-w-0 flex-col gap-1 ${className}`}>
      <label htmlFor={id} className="text-small text-subtitle">
        {label}
      </label>
      <div className="relative">
        <Search
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 left-3 size-5 -translate-y-1/2 text-placeholder"
        />
        <input
          ref={ref}
          id={id}
          type="search"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          autoComplete="off"
          spellCheck={false}
          className="min-h-11 w-full rounded-md border border-border-input bg-background pr-3 pl-10 text-medium text-title placeholder:text-placeholder"
        />
      </div>
    </div>
  );
}
