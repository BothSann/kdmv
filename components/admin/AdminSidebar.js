"use client";

import {
  Home,
  Boxes,
  Settings,
  Users,
  FileCheck,
  TicketPercent,
  Combine,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from "@/components/ui/sidebar";
import Logo from "../Logo";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

import LogoutButton from "@/components/LogoutButton";

// Menu items.
const items = [
  {
    title: "Dashboard",
    url: "/admin/dashboard",
    icon: Home,
  },
  {
    title: "Products",
    url: "/admin/products",
    icon: Boxes,
  },
  {
    title: "Collections",
    url: "/admin/collections",
    icon: Combine,
  },
  {
    title: "Coupons",
    url: "/admin/coupons",
    icon: TicketPercent,
  },
  {
    title: "Orders",
    url: "/admin/orders",
    icon: FileCheck,
  },
  {
    title: "Users",
    url: "/admin/users",
    icon: Users,
  },
  {
    title: "Settings",
    url: "/admin/settings",
    icon: Settings,
  },
];

export function AdminSidebar() {
  const pathname = usePathname();
  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup className={cn("px-4 pt-10 gap-y-12")}>
          <SidebarGroupLabel
            className={cn("flex justify-start items-center px-10")}
          >
            <Logo width="w-32" />
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className={cn("gap-4")}>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    size="lg"
                    className={cn(
                      "text-base gap-2.5 rounded-none px-10",
                      pathname === item.url && "bg-accent"
                    )}
                    asChild
                  >
                    <Link href={item.url}>
                      <item.icon size={30} />
                      {item.title}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <LogoutButton />
      </SidebarFooter>
    </Sidebar>
  );
}
