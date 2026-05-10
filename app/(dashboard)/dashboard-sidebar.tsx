"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { TNavigationItem, TSubNavigationItem } from "@/@types";
import { navigations } from "./config/dashboard-navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { Frame } from "lucide-react";

function SubNavigation({ items }: { items: TSubNavigationItem[] }) {
  const pathname = usePathname();

  return (
    <SidebarMenuSub>
      {items.map((item) => (
        <SidebarMenuSubItem key={item.name}>
          {item.href ? (
            <SidebarMenuSubButton asChild isActive={pathname === item.href}>
              <Link href={item.href}>{item.name}</Link>
            </SidebarMenuSubButton>
          ) : (
            <SidebarMenuSubButton>{item.name}</SidebarMenuSubButton>
          )}
          {item.subItems && item.subItems.length > 0 ? (
            <SubNavigation items={item.subItems} />
          ) : null}
        </SidebarMenuSubItem>
      ))}
    </SidebarMenuSub>
  );
}

function NavigationItem({ item }: { item: TNavigationItem }) {
  const pathname = usePathname();
  const Icon = item.icon;

  if (item.subItems) {
    return (
      <SidebarMenuItem>
        <SidebarMenuButton>
          <Icon />
          <span>{item.name}</span>
        </SidebarMenuButton>
        <SubNavigation items={item.subItems} />
      </SidebarMenuItem>
    );
  }

  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild isActive={pathname === item.href}>
        <Link href={item.href} target={item.target}>
          <Icon />
          <span>{item.name}</span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar {...props}>
      <SidebarHeader className="flex w-full items-center">
        <Frame size={36} />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigations.map((item) => (
                <NavigationItem key={item.name} item={item} />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
