import { Home, Inbox, Search, Settings, Users } from "lucide-react";

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
import { Button } from "@/components/ui/button";
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
    icon: Inbox,
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
      <SidebarContent className="border-r border-zinc-50 dark:border-zinc-800 ">
        <SidebarGroup className="px-4 py-6 gap-y-8">
          <SidebarGroupLabel className="flex justify-start items-center">
            <Logo width="w-32" />
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-4">
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    size="lg"
                    className="text-base gap-2.5 rounded-none"
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
      <SidebarFooter className="border-r border-zinc-50 dark:border-zinc-800">
        <LogoutButton />
      </SidebarFooter>
    </Sidebar>
  );
}
