"use client";

import useAuthStore from "@/store/useAuthStore";
import Image from "next/image";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { Bell, User } from "lucide-react";
import { ModeToggle } from "@/components/ModeToggle";
import Link from "next/link";
import AdminProfileDropdownMenu from "./AdminProfileDropdownMenu";

export default function AdminHeader() {
  const { profile } = useAuthStore();
  const fullName = `${profile?.first_name} ${profile?.last_name}`;

  return (
    <header className="flex justify-between items-center py-4 px-8 border-b border-border sticky top-0 z-40 bg-background dark:bg-primary-foreground">
      <SidebarTrigger />

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2.5 border-r border-border pr-4">
          <div className="relative w-10 h-10 aspect-square">
            {profile?.avatar_url ? (
              <Image
                src={profile?.avatar_url}
                alt="Admin Avatar"
                fill
                quality={80}
                sizes="100vw"
                className="object-cover object-center rounded-full"
              />
            ) : (
              <div className="w-full h-full bg-secondary rounded-full flex items-center justify-center">
                <User className="w-2/3 h-2/3 text-ring" />
              </div>
            )}
          </div>
          <span className="font-medium">{fullName}</span>
        </div>
        <ul className="flex items-center gap-0.5">
          <AdminProfileDropdownMenu />
          <Link href="" className="cursor-pointer p-2 hover:bg-accent">
            <Bell size={22} />
          </Link>
          <li className="cursor-pointer p-2">
            <ModeToggle />
          </li>
        </ul>
      </div>
    </header>
  );
}
