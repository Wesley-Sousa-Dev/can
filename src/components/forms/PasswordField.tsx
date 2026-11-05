"use client";

import { Eye, EyeOff } from "lucide-react";
import { useState, type ComponentProps } from "react";

import { TextField } from "@/components/forms/TextField";

type PasswordFieldProps = Omit<ComponentProps<typeof TextField>, "type" | "trailingControl">;

// Mostrar a senha ajuda a conferir o que foi digitado sem precisar de um
// segundo campo de "confirmar senha" (WCAG 3.3.7, entrada redundante).
export function PasswordField(props: PasswordFieldProps) {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  return (
    <TextField
      {...props}
      type={isPasswordVisible ? "text" : "password"}
      trailingControl={
        <button
          type="button"
          onClick={() => setIsPasswordVisible((wasVisible) => !wasVisible)}
          aria-pressed={isPasswordVisible}
          aria-label="Mostrar senha"
          className="grid size-11 place-items-center rounded-md text-subtitle transition-colors hover:text-title"
        >
          {isPasswordVisible ? (
            <EyeOff aria-hidden="true" className="size-5" />
          ) : (
            <Eye aria-hidden="true" className="size-5" />
          )}
        </button>
      }
    />
  );
}
