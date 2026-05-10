import { Suspense } from "react";
import { EmployeesTable } from "./_components/employees-table";

export default function Page() {
  return (
    <div className="flex h-full min-h-0 flex-1 flex-col gap-4">
      <div>
        <h1 className="text-2xl font-semibold">Products</h1>
      </div>

      <Suspense>
        <EmployeesTable />
      </Suspense>
    </div>
  );
}
