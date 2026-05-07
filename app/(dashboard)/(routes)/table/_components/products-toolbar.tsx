"use client";

import { useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Combobox } from "@/components/ui/combobox";
import { useDebouncedValue } from "@/hooks/use-debounced-value";

import { useFetchProductFilterOptions } from "./actions";

interface ProductsToolbarProps {
  q: string;
  category: string;
  brand: string;
  onChange: (next: { q?: string; category?: string; brand?: string }) => void;
}

export function ProductsToolbar({
  q,
  category,
  brand,
  onChange,
}: ProductsToolbarProps) {
  const [searchInput, setSearchInput] = useState(q);
  const debouncedSearch = useDebouncedValue(searchInput, 300);

  useEffect(() => {
    if (debouncedSearch !== q) {
      onChange({ q: debouncedSearch });
    }
  }, [debouncedSearch, q, onChange]);

  const { data: filterOptions } = useFetchProductFilterOptions();

  const categoryOptions = useMemo(
    () =>
      (filterOptions?.categories ?? []).map((value) => ({
        value,
        label: value,
      })),
    [filterOptions?.categories],
  );
  const brandOptions = useMemo(
    () =>
      (filterOptions?.brands ?? []).map((value) => ({
        value,
        label: value,
      })),
    [filterOptions?.brands],
  );

  const hasActive = Boolean(q || category || brand);

  const handleClear = () => {
    setSearchInput("");
    onChange({ q: "", category: "", brand: "" });
  };

  return (
    <div className="flex flex-wrap items-center gap-2 py-2">
      <div className="relative w-full sm:w-72">
        <Input
          type="text"
          aria-label="Search products"
          placeholder="Search products..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="h-8 pr-8"
        />
        {searchInput && (
          <Button
            type="button"
            variant="ghost"
            onClick={() => setSearchInput("")}
            aria-label="Clear search"
            className="text-muted-foreground hover:text-foreground absolute top-1/2 right-2 -translate-y-1/2"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      <Combobox
        options={categoryOptions}
        value={category}
        onValueChange={(value) => onChange({ category: value })}
        placeholder="Category"
        searchPlaceholder="Search category…"
        ariaLabel="Filter by category"
        triggerClassName="w-40"
      />

      <Combobox
        options={brandOptions}
        value={brand}
        onValueChange={(value) => onChange({ brand: value })}
        placeholder="Brand"
        searchPlaceholder="Search brand…"
        ariaLabel="Filter by brand"
        triggerClassName="w-40"
      />

      {hasActive && (
        <Button variant="ghost" size="sm" className="h-8" onClick={handleClear}>
          <X className="mr-1 h-4 w-4" />
          Clear
        </Button>
      )}
    </div>
  );
}
