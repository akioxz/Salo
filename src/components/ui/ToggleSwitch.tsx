"use client";

import type { ComponentPropsWithRef } from "react";
import { cn } from "../../lib/cn";

type ToggleSwitchProps = Omit<
  ComponentPropsWithRef<"button">,
  "children" | "onChange" | "role" | "aria-checked" | "type" | "aria-label" | "aria-labelledby"
> & {
  /** Accessible name describing the setting controlled by this switch. */
  label: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
};

/** Controlled switch. The parent owns checked state; disabled switches emit no changes. */
export function ToggleSwitch({
  label,
  checked,
  onCheckedChange,
  disabled,
  className,
  onClick,
  ...props
}: ToggleSwitchProps) {
  return (
    <button
      {...props}
      type="button"
      role="switch"
      aria-label={label}
      aria-checked={checked}
      disabled={disabled}
      onClick={(event) => {
        if (disabled) return;
        onClick?.(event);
        if (!event.defaultPrevented) onCheckedChange(!checked);
      }}
      className={cn(
        "inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-full",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "flex h-6 w-11 items-center rounded-full p-0.5 transition-colors motion-reduce:transition-none",
          checked ? "bg-amber-500" : "bg-zinc-400 dark:bg-zinc-600",
        )}
      >
        <span
          className={cn(
            "h-5 w-5 rounded-full bg-white shadow-sm transition-transform motion-reduce:transition-none",
            checked ? "translate-x-5" : "translate-x-0",
          )}
        />
      </span>
    </button>
  );
}
