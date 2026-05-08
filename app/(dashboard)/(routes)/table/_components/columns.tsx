"use client";

import { DataTableHeader } from "@/components/table/data-table-header";
import { ColumnDef } from "@tanstack/react-table";

import type { TProduct } from "@/@types";

export const columns: ColumnDef<TProduct>[] = [
  {
    id: "title",
    accessorKey: "title",
    header: ({ column }) => <DataTableHeader title="Title" column={column} />,
    size: 240,
    meta: {
      fieldType: "text",
      required: true,
      validate: (value: unknown) => {
        if (typeof value !== "string" || value.trim() === "") return "Required";
        if (value.trim().length < 2) return "Must be at least 2 characters";
        return null;
      },
      normalize: (value: unknown) =>
        (typeof value === "string" ? value.trim() : value) as never,
    },
  },
  {
    accessorKey: "category",
    header: ({ column }) => (
      <DataTableHeader title="Category" column={column} />
    ),
    size: 160,
    meta: {
      fieldType: "text",
    },
  },
  {
    accessorKey: "brand",
    header: ({ column }) => <DataTableHeader title="Brand" column={column} />,
    size: 160,
    meta: {
      fieldType: "text",
    },
  },
  {
    accessorKey: "price",
    header: ({ column }) => <DataTableHeader title="Price" column={column} />,
    enableSorting: true,
    size: 110,
    meta: {
      fieldType: "currency",
      currency: "USD",
      min: 0,
      validate: (value: unknown) => {
        if (value == null) return "Required";
        if (typeof value === "number" && value < 0) return "Cannot be negative";
        return null;
      },
    },
  },
  {
    accessorKey: "discountPercentage",
    header: ({ column }) => (
      <DataTableHeader title="Discount" column={column} />
    ),
    enableSorting: true,
    size: 110,
    meta: {
      fieldType: "percentage",
      validate: (value: unknown) => {
        if (value == null) return null;
        if (typeof value === "number" && (value < 0 || value > 100))
          return "0-100 only";
        return null;
      },
    },
  },
  {
    accessorKey: "rating",
    header: ({ column }) => <DataTableHeader title="Rating" column={column} />,
    enableSorting: true,
    size: 100,
    meta: {
      fieldType: "number",
      min: 0,
      max: 5,
      step: 0.01,
    },
  },
  {
    accessorKey: "stock",
    header: ({ column }) => <DataTableHeader title="Stock" column={column} />,
    enableSorting: true,
    size: 100,
    meta: {
      fieldType: "number",
      min: 0,
      step: 1,
    },
  },
];
