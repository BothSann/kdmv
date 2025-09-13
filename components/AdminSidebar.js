import { Home, Boxes, Search, Settings, Users, FileCheck } from "lucide-react";

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
import Logo from "./Logo";
import Link from "next/link";

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
    title: "Search",
    url: "#",
    icon: Search,
  },
  {
    title: "Settings",
    url: "#",
    icon: Settings,
  },
];

export function AdminSidebar() {
  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup className="px-4 pt-10 gap-y-12">
          <SidebarGroupLabel className="flex justify-start items-center px-10">
            <Logo width="w-32" />
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-4">
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    size="lg"
                    className="text-lg gap-4 rounded-none px-10"
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
