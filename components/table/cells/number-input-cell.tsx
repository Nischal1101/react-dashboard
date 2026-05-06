"use client";

import { useEffect, useRef } from "react";

import { Input } from "@/components/ui/input";
import type { EditableCellRenderProps } from "@/@types";

export function NumberInputCell({
  value,
  meta,
  error,
  autoFocus,
  onChange,
  onCommit,
  onCancel,
}: EditableCellRenderProps<unknown, number | null>) {
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (autoFocus && ref.current) {
      ref.current.focus();
      ref.current.select();
    }
  }, [autoFocus]);

  return (
    <Input
      ref={ref}
      type="number"
      inputMode="decimal"
      value={value ?? ""}
      placeholder={meta.placeholder}
      min={meta.min}
      max={meta.max}
      step={meta.step}
      aria-invalid={Boolean(error)}
      title={error ?? undefined}
      onChange={(e) => {
        const v = e.target.value;
        onChange(v === "" ? null : Number(v));
      }}
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
