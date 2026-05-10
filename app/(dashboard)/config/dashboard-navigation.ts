import { TNavigationItem } from "@/@types";
import { Calculator, Home, Table } from "lucide-react";

export const navigations: TNavigationItem[] = [
  {
    name: "table",
    icon: Table,
    href: "/table",
  },
  {
    name: "home",
    icon: Home,
    href: "/home",
  },
  {
    name: "accounts",
    icon: Calculator,
    href: "/accounts",
  },
];
