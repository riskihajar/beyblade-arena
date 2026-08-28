"use client";

import { cn } from "@/lib/utils";
import { ChevronDownIcon } from "lucide-react";
import type * as React from "react";

export interface NativeSelectProps
  extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "size"> {
  size?: "sm" | "default" | "lg";
  unstyled?: boolean;
}

export function NativeSelect({
  className,
  size = "default",
  unstyled = false,
  children,
  ...props
}: NativeSelectProps) {
  return (
    <div
      className={cn(
        !unstyled &&
          "relative inline-flex w-full rounded-lg border border-input bg-background not-dark:bg-clip-padding text-foreground shadow-xs/5 ring-ring/24 transition-shadow before:pointer-events-none before:absolute before:inset-0 before:rounded-[calc(var(--radius-lg)-1px)] not-has-disabled:not-has-focus-visible:not-has-aria-invalid:before:shadow-[0_1px_--theme(--color-black/6%)] has-focus-visible:has-aria-invalid:border-destructive/64 has-focus-visible:has-aria-invalid:ring-destructive/16 has-aria-invalid:border-destructive/36 has-focus-visible:border-ring has-disabled:opacity-64 has-[:disabled,:focus-visible,[aria-invalid]]:shadow-none has-focus-visible:ring-[3px] dark:bg-input/32 dark:has-aria-invalid:ring-destructive/24 dark:not-has-disabled:not-has-focus-visible:not-has-aria-invalid:before:shadow-[0_-1px_--theme(--color-white/6%)]",
        className,
      )}
      data-size={size}
      data-slot="native-select-control"
    >
      <select
        className={cn(
          "w-full appearance-none rounded-[inherit] bg-transparent font-medium text-foreground outline-none placeholder:text-muted-foreground/72 disabled:pointer-events-none",
          size === "sm" &&
            "h-7.5 pl-[calc(--spacing(2.5)-1px)] pr-7 text-xs leading-7.5 sm:h-6.5 sm:leading-6.5",
          size === "lg" &&
            "h-9.5 pl-[calc(--spacing(3.5)-1px)] pr-9 text-base leading-9.5 sm:h-8.5 sm:text-sm sm:leading-8.5",
          size === "default" &&
            "h-8.5 pl-[calc(--spacing(3)-1px)] pr-8 text-sm leading-8.5 sm:h-7.5 sm:leading-7.5",
        )}
        data-slot="native-select"
        {...props}
      >
        {children}
      </select>
      <ChevronDownIcon
        className={cn(
          "pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 opacity-70",
          size === "sm" ? "size-3.5" : "size-4",
        )}
        data-slot="native-select-icon"
      />
    </div>
  );
}
