import { Suspense } from "react";
import { EmployeesTable } from "./_components/employees-table";

export default function Page() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Products</h1>
        <p className="text-muted-foreground text-sm">
          Data is paginated server-side via dummyjson.com. Click the pencil to
          edit a row, or click any cell to start inline editing — saves and
          deletes hit the API and invalidate the products query.
        </p>
      </div>

      <Suspense>
        <EmployeesTable />
      </Suspense>
    </div>
  );
}
