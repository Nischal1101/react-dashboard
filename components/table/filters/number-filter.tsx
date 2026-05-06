"use client";

import { Input } from "@/components/ui/input";
import type { FilterRendererProps } from "@/@types";

export function NumberFilter({ value, onChange }: FilterRendererProps) {
  const current =
    typeof value === "number" || typeof value === "string" ? String(value) : "";

  return (
    <Input
      type="number"
      inputMode="decimal"
      className="h-7 w-full text-xs"
      placeholder="Filter…"
      value={current}
      onClick={(e) => e.stopPropagation()}
      onChange={(e) => {
        const next = e.target.value;
        onChange(next === "" ? undefined : Number(next));
      }}
    />
  );
}
