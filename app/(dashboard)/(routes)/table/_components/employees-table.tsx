"use client";

import { useCallback, useState } from "react";
import { parseAsInteger, parseAsString, useQueryStates } from "nuqs";

import { DataTable } from "@/components/table/data-table";
import { DataTablePagination } from "@/components/table/data-table-pagination";
import type { Product } from "@/@types";

import {
  useDeleteProduct,
  useFetchProducts,
  useUpdateProduct,
} from "./actions";
import { columns } from "./columns";
import DeleteDialog from "./product-delete-dialog";
import { ProductsToolbar } from "./products-toolbar";

export function EmployeesTable() {
  const [{ page, pageSize, q, category, brand }, setQuery] = useQueryStates({
    page: parseAsInteger.withDefault(1),
    pageSize: parseAsInteger.withDefault(10),
    q: parseAsString.withDefault(""),
    category: parseAsString.withDefault(""),
    brand: parseAsString.withDefault(""),
  });

  const { data, isLoading, isFetching } = useFetchProducts({
    limit: pageSize,
    skip: (page - 1) * pageSize,
    q: q || undefined,
    category: category || undefined,
    brand: brand || undefined,
  });

  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();

  const [pendingDelete, setPendingDelete] = useState<Product | null>(null);

  const handleToolbarChange = useCallback(
    (next: { q?: string; category?: string; brand?: string }) => {
      setQuery({ ...next, page: 1 });
    },
    [setQuery],
  );

  const products = data?.products ?? [];
  const totalPages = data ? Math.max(1, Math.ceil(data.total / pageSize)) : 1;

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col gap-2">
      <ProductsToolbar
        q={q}
        category={category}
        brand={brand}
        onChange={handleToolbarChange}
      />

      <DataTable<Product, unknown>
        isLoading={isLoading}
        isRefetching={isFetching && !isLoading}
        columns={columns}
        data={products}
        getRowId={(row) => String(row.id)}
        editMode="both"
        className="h-[calc(100vh-var(--dashboard-header-height)-20.2rem)]"
        onSave={(rowId, updated) => {
          updateProduct.mutate({ id: Number(rowId), payload: updated });
        }}
        onDelete={(_rowId, row) => {
          setPendingDelete(row);
        }}
      />

      <DeleteDialog
        product={pendingDelete}
        onOpenChange={(open) => {
          if (!open) setPendingDelete(null);
        }}
        onConfirm={(product) => {
          deleteProduct.mutate({ id: product.id });
          setPendingDelete(null);
        }}
      />

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
