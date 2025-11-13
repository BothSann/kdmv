import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { User, Palette, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import useAuthStore from "@/store/useAuthStore";
import LogoutButton from "../LogoutButton";
export default function AdminProfileDropdownMenu() {
  const { profile } = useAuthStore();
  const fullName = `${profile?.first_name} ${profile?.last_name}`;

  const navItems = [
    { href: "/admin/account/profile", icon: User, label: "Profile" },
    {
      href: "/admin/account/password",
      icon: Settings,
      label: "Settings",
    },
    { href: "/admin/account/appearance", icon: Palette, label: "Appearance" },
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn("cursor-pointer p-2 hover:bg-accent focus:outline-none")}
      >
        <User />
      </DropdownMenuTrigger>
      <DropdownMenuContent className={cn("w-[16rem]")}>
        <DropdownMenuLabel className={cn("flex items-center gap-2")}>
          <div className="relative w-8 h-8 aspect-square">
            {profile?.avatar_url ? (
              <Image
                src={profile?.avatar_url}
                alt="Admin Avatar"
                fill
                quality={50}
                loading="lazy"
                sizes="32px"
                className="object-cover object-center rounded-full"
              />
            ) : (
              <div className="w-full h-full bg-secondary rounded-full flex items-center justify-center">
                <User className="w-2/3 h-2/3 text-ring" />
              </div>
            )}
          </div>

          <div>
            <p className="font-medium">{fullName}</p>
            <p className="text-xs font-normal text-muted-foreground">
              {profile?.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {navItems.map((item) => (
          <Link href={item.href} key={item.href}>
            <DropdownMenuItem className={cn("py-2.5")}>
              <item.icon size={20} />
              {item.label}
            </DropdownMenuItem>
          </Link>
        ))}
        <DropdownMenuSeparator />

        <DropdownMenuItem>
          <LogoutButton />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
