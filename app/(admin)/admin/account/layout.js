"use client";

import { Palette, Shield, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export default function AccountPage({ children }) {
  const pathname = usePathname();

  const navItems = [
    { href: "/admin/account/profile", icon: User, label: "Personal Info" },
    {
      href: "/admin/account/password",
      icon: Shield,
      label: "Password & Security",
    },
    { href: "/admin/account/appearance", icon: Palette, label: "Appearance" },
  ];

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center pl-8">
        <h1 className="text-3xl font-bold">Account</h1>
      </div>

      <div className="grid grid-cols-[1fr_3fr] mt-8 gap-x-2">
        <aside className="px-4 py-2 border-r border-border">
          <ul className="space-y-4">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2.5 transition-colors hover:bg-accent",
                    isActive && "bg-accent"
                  )}
                >
                  <Icon size={22} />
                  {item.label}
                </Link>
              );
            })}
          </ul>
        </aside>

        <div className="px-4 py-2">{children}</div>
      </div>
    </div>
  );
}
