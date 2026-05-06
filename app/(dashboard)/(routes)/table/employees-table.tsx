"use client";

import { useState } from "react";

import { DataTable } from "@/components/table/data-table";
import type { Employee } from "@/@types";

import { columns } from "./columns";
import { seedEmployees } from "./data";

export function EmployeesTable({
  isLoading = false,
  isRefetching = false,
}: {
  isLoading?: boolean;
  isRefetching?: boolean;
}) {
  const [data, setData] = useState<Employee[]>(seedEmployees);

  return (
    <DataTable<Employee, unknown>
      isLoading={isLoading}
      isRefetching={isRefetching}
      columns={columns}
      data={data}
      getRowId={(row) => row.id}
      editMode="both"
      pageSize={10}
      enableSorting
      enableMultiSort
      enableFiltering
      enableResizing
      enablePagination
      className="max-h-[calc(100vh-var(--dashboard-header-height)-18rem)]"
      clientSideFilters={["name"]}
      onEdit={(rowId) => console.log("[edit]", rowId)}
      onSave={(rowId, updated) => {
        setData((rows) => rows.map((r) => (r.id === rowId ? updated : r)));
      }}
      onCancel={(rowId) => console.log("[cancel]", rowId)}
      onDelete={(rowId) => {
        setData((rows) => rows.filter((r) => r.id !== rowId));
      }}
    />
  );
}
