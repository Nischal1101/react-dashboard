"use client";

import type { EditableColumnDef } from "@/@types";

import type { Employee } from "@/@types";

const departmentOptions = [
  { label: "Engineering", value: "engineering" },
  { label: "Design", value: "design" },
  { label: "Product", value: "product" },
  { label: "People", value: "people" },
];

export const createColumns = (): EditableColumnDef<Employee>[] => [
  {
    accessorKey: "name",
    header: "Name",
    size: 180,
    meta: {
      fieldType: "text",
      required: true,
      placeholder: "Full name",
    },
  },
  {
    accessorKey: "email",
    header: "Email",
    size: 220,
    meta: {
      fieldType: "text",
      required: true,
      placeholder: "name@example.com",
      validate: (value: unknown) => {
        if (typeof value !== "string") return null;
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
          ? null
          : "Enter a valid email address";
      },
      normalize: (value: unknown) =>
        typeof value === "string" ? value.trim().toLowerCase() : value,
    },
  },
  {
    accessorKey: "department",
    header: "Department",
    size: 150,
    meta: {
      fieldType: "select",
      required: true,
      options: departmentOptions,
      filterType: "select",
      filterOptions: departmentOptions,
    },
  },
  {
    accessorKey: "salary",
    header: "Salary",
    size: 130,
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
    accessorKey: "bonus",
    header: "Bonus",
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
    accessorKey: "yearsExperience",
    header: "Years",
    size: 90,
    meta: {
      fieldType: "number",
      min: 0,
      max: 50,
      step: 1,
    },
  },
  {
    accessorKey: "startDate",
    header: "Start Date",
    size: 140,
    meta: { fieldType: "date" },
  },
  {
    accessorKey: "phone",
    header: "Phone",
    size: 160,
    meta: {
      fieldType: "phone",
      validate: (value: unknown) => {
        if (value == null || value === "") return null;
        return typeof value === "string" &&
          value.replace(/\D/g, "").length === 10
          ? null
          : "Must be 10 digits";
      },
    },
  },
  {
    accessorKey: "active",
    header: "Active",
    size: 80,
    meta: { fieldType: "checkbox" },
  },
];

export const columns = createColumns();
