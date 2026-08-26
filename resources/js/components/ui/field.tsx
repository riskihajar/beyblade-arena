"use client";

import { Field as FieldPrimitive } from "@base-ui/react/field";
import type * as React from "react";

import { cn } from "@/lib/utils";

function Field({ className, ...props }: FieldPrimitive.Root.Props) {
  return (
    <FieldPrimitive.Root
      className={cn("flex flex-col items-start gap-2", className)}
      data-slot="field"
      {...props}
    />
  );
}

function FieldLabel({ className, ...props }: FieldPrimitive.Label.Props) {
  return (
    <FieldPrimitive.Label
      className={cn(
        "inline-flex items-center gap-2 font-medium text-base/4.5 sm:text-sm/4",
        className,
      )}
      data-slot="field-label"
      {...props}
    />
  );
}

function FieldItem({ className, ...props }: FieldPrimitive.Item.Props) {
  return (
    <FieldPrimitive.Item
      className={cn("flex", className)}
      data-slot="field-item"
      {...props}
    />
  );
}

function FieldDescription({
  className,
  ...props
}: FieldPrimitive.Description.Props) {
  return (
    <FieldPrimitive.Description
      className={cn("text-muted-foreground text-xs", className)}
      data-slot="field-description"
      {...props}
    />
  );
}

export interface FieldErrorProps extends React.HTMLAttributes<HTMLParagraphElement> {
  error?: string;
  message?: string;
}

function FieldError({ className, error, message, children, ...props }: FieldErrorProps) {
  const content = error ?? message ?? children;
  if (!content) return null;

  return (
    <p
      className={cn("text-xs text-destructive-foreground", className)}
      data-slot="field-error"
      {...props}
    >
      {content}
    </p>
  );
}

const FieldControl = FieldPrimitive.Control;
const FieldValidity = FieldPrimitive.Validity;

export {
  Field,
  FieldLabel,
  FieldDescription,
  FieldError,
  FieldControl,
  FieldItem,
  FieldValidity,
};
