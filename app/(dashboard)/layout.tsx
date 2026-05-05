import React from "react";
import DashboardLayout from "./dashboard-layout";

export default function layout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardLayout>
      <div className=" pt-6">{children}</div>
    </DashboardLayout>
  );
}
