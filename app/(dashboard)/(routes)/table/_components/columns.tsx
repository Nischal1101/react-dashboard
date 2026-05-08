"use client";

import { DataTableHeader } from "@/components/table/data-table-header";
import { ColumnDef } from "@tanstack/react-table";

import type { TProduct } from "@/@types";
import { validateProductField } from "@/lib/schemas/product";
import { formatCurrency, formatNumber, formatPercentage } from "@/lib/utils";

export const columns: ColumnDef<TProduct>[] = [
  {
    id: "title",
    accessorKey: "title",
    header: ({ column }) => <DataTableHeader title="Title" column={column} />,
    size: 240,
    cell: ({ getValue }) => (getValue() as string) || "—",
    meta: {
      fieldType: "text",
      editable: false,
      required: true,
      validate: (value) => validateProductField("title", value),
      normalize: (value) =>
        (typeof value === "string" ? value.trim() : value) as never,
    },
  },
  {
    accessorKey: "category",
    header: ({ column }) => (
      <DataTableHeader title="Category" column={column} />
    ),
    size: 160,
    cell: ({ getValue }) => (getValue() as string) || "—",
    meta: {
      fieldType: "text",
      required: true,
      validate: (value) => validateProductField("category", value),
    },
  },
  {
    accessorKey: "brand",
    header: ({ column }) => <DataTableHeader title="Brand" column={column} />,
    size: 160,
    cell: ({ getValue }) => (getValue() as string) || "—",
    meta: {
      fieldType: "text",
      validate: (value) => validateProductField("brand", value),
    },
  },
  {
    accessorKey: "price",
    header: ({ column }) => <DataTableHeader title="Price" column={column} />,
    enableSorting: true,
    size: 110,
    cell: ({ getValue }) => formatCurrency(getValue() as number, "USD") || "—",
    meta: {
      fieldType: "currency",
      currency: "USD",
      min: 0,
      required: true,
      validate: (value) => validateProductField("price", value),
    },
  },
  {
    accessorKey: "discountPercentage",
    header: ({ column }) => (
      <DataTableHeader title="Discount" column={column} />
    ),
    enableSorting: true,
    size: 110,
    cell: ({ getValue }) => formatPercentage(getValue() as number) || "—",
    meta: {
      fieldType: "percentage",
      validate: (value) => validateProductField("discountPercentage", value),
    },
  },
  {
    accessorKey: "rating",
    header: ({ column }) => <DataTableHeader title="Rating" column={column} />,
    enableSorting: true,
    size: 100,
    cell: ({ getValue }) => formatNumber(getValue() as number) || "—",
    meta: {
      fieldType: "number",
      min: 0,
      max: 5,
      step: 0.01,
      validate: (value) => validateProductField("rating", value),
    },
  },
  {
    accessorKey: "stock",
    header: ({ column }) => <DataTableHeader title="Stock" column={column} />,
    enableSorting: true,
    size: 100,
    cell: ({ getValue }) => formatNumber(getValue() as number) || "—",
    meta: {
      fieldType: "number",
      min: 0,
      step: 1,
      validate: (value) => validateProductField("stock", value),
    },
  },
];
