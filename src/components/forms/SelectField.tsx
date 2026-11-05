import { ChevronDown } from "lucide-react";

export interface SelectOption<TValue extends string> {
  value: TValue;
  label: string;
}

interface SelectFieldProps<TValue extends string> {
  id: string;
  label: string;
  value: TValue;
  options: SelectOption<TValue>[];
  onChange: (value: TValue) => void;
  className?: string;
}

// Seletor nativo com rótulo visível. O <select> nativo já funciona com
// teclado, leitor de tela e toque; só a seta é desenhada por cima.
export function SelectField<TValue extends string>({
  id,
  label,
  value,
  options,
  onChange,
  className = "",
}: SelectFieldProps<TValue>) {
  // Procurar a opção devolve o valor já com o tipo certo, sem conversão forçada.
  function handleChange(selectedValue: string) {
    const selectedOption = options.find((option) => option.value === selectedValue);
    if (selectedOption) {
      onChange(selectedOption.value);
    }
  }

  return (
    <div className={`flex min-w-0 flex-col gap-1 ${className}`}>
      <label htmlFor={id} className="text-small text-subtitle">
        {label}
      </label>
      <div className="relative">
        <select
          id={id}
          value={value}
          onChange={(event) => handleChange(event.target.value)}
          className="min-h-11 w-full appearance-none rounded-md border border-border-input bg-card pr-10 pl-3 text-medium text-title"
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 right-3 size-5 -translate-y-1/2 text-subtitle"
        />
      </div>
    </div>
  );
}
