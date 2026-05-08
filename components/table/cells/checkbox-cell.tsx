"use client";

import { useEffect, useRef } from "react";

import { cn } from "@/lib/utils";
import type { TEditableCellRenderProps } from "@/@types";

export function CheckboxCell({
  value,
  error,
  autoFocus,
  onChange,
  onCommit,
  onCancel,
}: TEditableCellRenderProps<unknown, boolean>) {
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (autoFocus && ref.current) {
      ref.current.focus();
    }
  }, [autoFocus]);

  return (
    <input
      ref={ref}
      type="checkbox"
      role="switch"
      checked={Boolean(value)}
      aria-invalid={Boolean(error)}
      className={cn(
        "size-4 cursor-pointer rounded border border-input accent-primary",
        "focus-visible:ring-3 focus-visible:ring-ring/50 outline-none",
      )}
      onChange={(e) => onChange(e.target.checked)}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          onCommit();
        } else if (e.key === "Escape") {
          e.preventDefault();
          onCancel();
        }
      }}
    />
  );
}
