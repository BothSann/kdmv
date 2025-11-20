"use client";

import { cn } from "@/lib/utils";

import { MapPinHouse, FileText, Settings, User, Palette } from "lucide-react";
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
    title: "Addresses",
    href: "/account/addresses",
    icon: MapPinHouse,
  },
  {
    title: "Appearances",
    href: "/account/appearances",
    icon: Palette,
  },
  {
    title: "Password & Security",
    href: "/account/password",
    icon: Settings,
  },
];

export function UserSidebar() {
  const pathname = usePathname();
  return (
    <nav className="border-r border-border hidden md:block">
      <ul className="flex flex-col space-y-4 h-full">
        {navLinks.map((link) => {
          const isActive = pathname === link.href;
          const Icon = link.icon;

          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-2 px-2 py-4 transition-colors hover:bg-accent",
                isActive && "bg-accent"
              )}
            >
              <Icon size={24} />
              {link.title}
            </Link>
          );
        })}

        {/* <li className="mt-auto">
          <LogoutButton />
        </li> */}
      </ul>
    </nav>
  );
}
