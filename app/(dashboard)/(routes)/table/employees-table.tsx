"use client";

import { useCallback, useMemo, useState } from "react";
import { parseAsInteger, parseAsString, useQueryStates } from "nuqs";
import type { ColumnFiltersState } from "@tanstack/react-table";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { DataTable } from "@/components/table/data-table";
import { DataTablePagination } from "@/components/table/data-table-pagination";
import type { Product, SelectOption } from "@/@types";

import {
  useDeleteProduct,
  useFetchProductFilterOptions,
  useFetchProducts,
  useUpdateProduct,
} from "./actions";
import { createColumns } from "./columns";

function toTitleCase(value: string) {
  return value
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function toOptions(values: string[] | undefined): SelectOption[] {
  return (values ?? []).map((value) => ({
    value,
    label: toTitleCase(value),
  }));
}

export function EmployeesTable() {
  const [{ page, pageSize, category, brand }, setQuery] = useQueryStates({
    page: parseAsInteger.withDefault(1),
    pageSize: parseAsInteger.withDefault(10),
    category: parseAsString,
    brand: parseAsString,
  });

  const { data, isLoading, isFetching } = useFetchProducts({
    limit: pageSize,
    skip: (page - 1) * pageSize,
  });

  const { data: filterOptions } = useFetchProductFilterOptions();

  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();

  const [pendingDelete, setPendingDelete] = useState<Product | null>(null);

  const columns = useMemo(
    () =>
      createColumns({
        categories: toOptions(filterOptions?.categories),
        brands: toOptions(filterOptions?.brands),
      }),
    [filterOptions],
  );

  const columnFilters = useMemo<ColumnFiltersState>(() => {
    const list: ColumnFiltersState = [];
    if (category && category !== "all")
      list.push({ id: "category", value: category });
    if (brand && brand !== "all") list.push({ id: "brand", value: brand });
    return list;
  }, [category, brand]);

  const handleColumnFiltersChange = useCallback(
    (
      updater:
        | ColumnFiltersState
        | ((prev: ColumnFiltersState) => ColumnFiltersState),
    ) => {
      const next =
        typeof updater === "function" ? updater(columnFilters) : updater;
      const nextCategory = next.find((f) => f.id === "category")?.value;
      const nextBrand = next.find((f) => f.id === "brand")?.value;
      setQuery({
        category:
          typeof nextCategory === "string" && nextCategory.length > 0
            ? nextCategory
            : null,
        brand:
          typeof nextBrand === "string" && nextBrand.length > 0
            ? nextBrand
            : null,
      });
    },
    [columnFilters, setQuery],
  );

  const products = data?.products ?? [];
  const totalPages = data ? Math.max(1, Math.ceil(data.total / pageSize)) : 1;

  return (
    <div className="space-y-2">
      <DataTable<Product, unknown>
        isLoading={isLoading}
        isRefetching={isFetching && !isLoading}
        columns={columns}
        data={products}
        getRowId={(row) => String(row.id)}
        editMode="both"
        className="h-[calc(100vh-var(--dashboard-header-height)-22rem)]"
        columnFilters={columnFilters}
        onColumnFiltersChange={handleColumnFiltersChange}
        enableGlobalSearch
        globalSearchKeys={["title", "category", "brand"]}
        globalSearchPlaceholder="Search title, category, brand…"
        onSave={(rowId, updated) => {
          updateProduct.mutate({ id: Number(rowId), payload: updated });
        }}
        onDelete={(_rowId, row) => {
          setPendingDelete(row);
        }}
      />

      <AlertDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => {
          if (!open) setPendingDelete(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this product?</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingDelete
                ? `"${pendingDelete.title}" will be permanently removed. This cannot be undone.`
                : ""}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (pendingDelete) {
                  deleteProduct.mutate({ id: pendingDelete.id });
                  setPendingDelete(null);
                }
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <DataTablePagination
        page={page}
        pageSize={pageSize}
        totalPages={totalPages}
        onPageChange={(next) => setQuery({ page: next })}
        onPageSizeChange={(next) => setQuery({ pageSize: next, page: 1 })}
      />
    </div>
  );
}
