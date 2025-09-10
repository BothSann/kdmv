"use client";

import useAuthStore from "@/store/useAuthStore";
import Image from "next/image";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { Bell, User } from "lucide-react";
import { ModeToggle } from "@/components/ModeToggle";

export default function AdminHeader() {
  const { profile } = useAuthStore();
  const fullName = `${profile?.first_name} ${profile?.last_name}`;

  return (
    <header className="flex justify-between items-center py-4 px-8 border-b border-zinc-200 dark:border-zinc-800">
      <SidebarTrigger />

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2.5 border-r border-zinc-200 dark:border-zinc-800 pr-4">
          <div className="relative w-10 h-10 aspect-square">
            <Image
              src={profile?.avatar_url}
              alt="Admin Avatar"
              fill
              quality={80}
              sizes="100vw"
              className="object-cover object-center rounded-full"
            />
          </div>
          <span>{fullName}</span>
        </div>
        <ul className="flex items-center gap-4">
          <li className="cursor-pointer">
            <User size={20} />
          </li>
          <li className="cursor-pointer">
            <Bell size={20} />
          </li>
          <li className="cursor-pointer">
            <ModeToggle />
          </li>
        </ul>
      </div>
    </header>
  );
}
