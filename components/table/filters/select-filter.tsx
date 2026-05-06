"use client";

import { parseAsString, useQueryState } from "nuqs";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { FilterRendererProps, SelectOption } from "@/@types";

const ALL = "all";

export function SelectFilter({ column, meta }: FilterRendererProps) {
  const options: SelectOption[] = meta.filterOptions ?? meta.options ?? [];
  const [value, setValue] = useQueryState(column.id, parseAsString);

  return (
    <Select
      value={value && value !== ALL ? value : ALL}
      onValueChange={(next) => setValue(next === ALL ? null : next)}
    >
      <SelectTrigger
        size="sm"
        onClick={(e) => e.stopPropagation()}
        className="h-7 w-full text-xs"
      >
        <SelectValue placeholder="All" />
      </SelectTrigger>
      <SelectContent position="popper" className="max-h-72">
        <SelectItem value={ALL}>All</SelectItem>
        {options.map((opt) => (
          <SelectItem key={opt.value} value={opt.value}>
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
