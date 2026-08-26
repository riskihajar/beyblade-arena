"use client";

import { Input, type InputProps } from "@/components/ui/input";
import { Textarea, type TextareaProps } from "@/components/ui/textarea";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import * as React from "react";

type FormInputProps<T extends "input" | "textarea"> = {
  name: string;
  label: string;
  type?: "text" | "email" | "password" | "search" | "tel" | "url" | "number" | "date" | "time" | "datetime-local";
  component?: T;
  errors?: Record<string, string>;
  className?: string;
} & (
  T extends "textarea"
    ? Omit<TextareaProps, "name" | "size" | "unstyled">
    : Omit<InputProps, "name" | "size" | "unstyled">
);

function FormInputInner<T extends "input" | "textarea">(
  {
    name,
    label,
    type = "text",
    component = "input" as T,
    errors,
    className,
    required,
    placeholder,
    defaultValue,
    disabled,
    autoFocus,
    autoComplete,
    id,
    ...props
  }: FormInputProps<T>,
  ref: React.ForwardedRef<T extends "input" ? HTMLInputElement : HTMLTextAreaElement>,
) {
  const error = errors?.[name];
  const hasError = !!error;
  const inputId = id || name;
  const errorId = `${inputId}-error`;

  return (
    <Field
      name={name}
      data-invalid={hasError || undefined}
      className={className}
    >
      <FieldLabel htmlFor={inputId}>
        {label}
        {required && <span className="text-destructive-foreground ml-1">*</span>}
      </FieldLabel>
      
      {component === "textarea" ? (
        <Textarea
          ref={ref as React.ForwardedRef<HTMLTextAreaElement>}
          id={inputId}
          name={name}
          placeholder={placeholder}
          defaultValue={defaultValue as string}
          required={required}
          disabled={disabled}
          autoFocus={autoFocus}
          aria-invalid={hasError || undefined}
          aria-describedby={error ? errorId : undefined}
          {...(props as Omit<TextareaProps, "name" | "size" | "unstyled">)}
        />
      ) : (
        <Input
          ref={ref as React.ForwardedRef<HTMLInputElement>}
          id={inputId}
          name={name}
          type={type}
          placeholder={placeholder}
          defaultValue={defaultValue as string}
          required={required}
          disabled={disabled}
          autoFocus={autoFocus}
          autoComplete={autoComplete}
          aria-invalid={hasError || undefined}
          aria-describedby={error ? errorId : undefined}
          {...(props as Omit<InputProps, "name" | "size" | "unstyled">)}
        />
      )}
      
      {error && (
        <FieldError id={errorId}>
          {error}
        </FieldError>
      )}
    </Field>
  );
}

export const FormInput = React.forwardRef(
  function FormInput<T extends "input" | "textarea">(
    props: FormInputProps<T>,
    ref: React.ForwardedRef<T extends "input" ? HTMLInputElement : HTMLTextAreaElement>,
  ) {
    return FormInputInner(props, ref);
  },
) as {
  <T extends "input" | "textarea" = "input">(
    props: FormInputProps<T> & React.RefAttributes<T extends "input" ? HTMLInputElement : HTMLTextAreaElement>,
  ): React.ReactElement;
} & {
  (props: FormInputProps<"input"> & React.RefAttributes<HTMLInputElement>): React.ReactElement;
  (props: FormInputProps<"textarea"> & React.RefAttributes<HTMLTextAreaElement>): React.ReactElement;
};
