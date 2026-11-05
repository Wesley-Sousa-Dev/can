"use client";

import { useState, type ChangeEvent } from "react";

type FieldValidator<TValues> = (value: string, allValues: TValues) => string | null;

export type FieldValidators<TValues extends Record<string, string>> = {
  [FieldName in keyof TValues]: FieldValidator<TValues>;
};

export type FieldErrors<TValues> = Partial<Record<keyof TValues, string>>;

// Estado e validação de formulários. O momento de mostrar cada erro segue
// o que é menos frustrante para quem preenche:
// - antes do primeiro envio, só valida ao sair de um campo que já tem algo digitado;
// - depois de tentar enviar, revalida a cada tecla, e o erro some assim que o campo fica certo.
export function useValidatedForm<TValues extends Record<string, string>>(
  initialValues: TValues,
  validators: FieldValidators<TValues>,
) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState<FieldErrors<TValues>>({});
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);

  function findFieldError(fieldName: keyof TValues, valuesToCheck: TValues): string | undefined {
    return validators[fieldName](valuesToCheck[fieldName], valuesToCheck) ?? undefined;
  }

  function setFieldError(fieldName: keyof TValues, message: string | undefined) {
    setErrors((currentErrors) => ({ ...currentErrors, [fieldName]: message }));
  }

  function changeField(fieldName: keyof TValues, newValue: string) {
    const nextValues = { ...values, [fieldName]: newValue };
    setValues(nextValues);
    if (hasAttemptedSubmit || errors[fieldName]) {
      setFieldError(fieldName, findFieldError(fieldName, nextValues));
    }
  }

  function blurField(fieldName: keyof TValues) {
    if (hasAttemptedSubmit || values[fieldName] !== "") {
      setFieldError(fieldName, findFieldError(fieldName, values));
    }
  }

  /** Valida tudo e devolve os erros encontrados (objeto vazio quando está tudo certo). */
  function validateAllFields(): FieldErrors<TValues> {
    setHasAttemptedSubmit(true);
    const foundErrors: FieldErrors<TValues> = {};
    for (const fieldName of Object.keys(validators) as (keyof TValues)[]) {
      const message = findFieldError(fieldName, values);
      if (message) {
        foundErrors[fieldName] = message;
      }
    }
    setErrors(foundErrors);
    return foundErrors;
  }

  /** Liga um campo ao formulário: valor, eventos e mensagem de erro. */
  function registerField(fieldName: keyof TValues) {
    return {
      name: String(fieldName),
      value: values[fieldName],
      error: errors[fieldName],
      onChange: (event: ChangeEvent<HTMLInputElement>) => changeField(fieldName, event.target.value),
      onBlur: () => blurField(fieldName),
    };
  }

  return { values, errors, registerField, validateAllFields, setFieldError };
}
