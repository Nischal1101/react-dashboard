import { EmployeesTable } from "./employees-table";

export default function Page() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Employees</h1>
        <p className="text-muted-foreground text-sm">
          Click the pencil to edit a row, or click any cell to start inline
          editing. Sort by clicking headers (shift+click for multi-sort). Drag
          column edges to resize.
        </p>
      </div>
      <EmployeesTable />
    </div>
  );
}
