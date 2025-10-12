"use client";

import { cn } from "@/lib/utils";

import { MapPinHouse, FileText, Settings, User } from "lucide-react";
import Link from "next/link";
import LogoutButton from "./LogoutButton";
import { usePathname } from "next/navigation";

const navLinks = [
  {
    title: "Profile",
    href: "/account/profile",
    icon: User,
  },
  {
    title: "Orders",
    href: "/account/orders",
    icon: FileText,
  },
  {
    title: "Address",
    href: "/account/address",
    icon: MapPinHouse,
  },
  {
    title: "Settings",
    href: "/account/settings",
    icon: Settings,
  },
];

export function UserSidebar() {
  const pathname = usePathname();
  return (
    <nav className="border-r border-border ">
      <ul className="flex flex-col space-y-4 h-full">
        {navLinks.map((link) => {
          const isActive = pathname === link.href;
          const Icon = link.icon;

          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-4 px-2 py-4 transition-colors hover:bg-accent",
                isActive && "bg-accent"
              )}
            >
              <Icon size={24} />
              {link.title}
            </Link>
          );
        })}

        <li className="mt-auto">
          <LogoutButton />
        </li>
      </ul>
    </nav>
  );
}
