import { type LucideIcon } from "lucide-react";

export type TNavigationItem = {
  name: string;
  icon: LucideIcon;
  target?: "_blank";
} & (
  | { subItems: TSubNavigationItem[]; href?: never }
  | { href: string; subItems?: never }
);

export type TSubNavigationItem = {
  name: string;
  href?: string;
  subItems?: TSubNavigationItem[];
};
