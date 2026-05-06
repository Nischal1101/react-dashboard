"use client";

import { Input } from "@/components/ui/input";
import type { FilterRendererProps } from "@/@types";

export function TextFilter({ value, onChange }: FilterRendererProps) {
  return (
    <Input
      className="h-7 w-full text-xs"
      placeholder="Filter…"
      value={(value as string | undefined) ?? ""}
      onClick={(e) => e.stopPropagation()}
      onChange={(e) => onChange(e.target.value || undefined)}
    />
  );
}
