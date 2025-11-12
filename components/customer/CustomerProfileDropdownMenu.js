import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

import { User, FileText, MapPinHouse, Settings } from "lucide-react";

import useAuthStore from "@/store/useAuthStore";

import LogoutButton from "@/components/LogoutButton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import useAuthorization from "@/hooks/useAuthorization";

export default function CustomerProfileDropdownMenu() {
  const { profile, isLoading } = useAuthStore();
  const { isAuthenticated } = useAuthorization();
  const fullName = `${profile?.first_name} ${profile?.last_name}`;

  const navItems = [
    { href: "/account/profile", icon: User, label: "Profile" },
    { href: "/account/orders", icon: FileText, label: "Orders" },
    { href: "/account/address", icon: MapPinHouse, label: "Address" },
    { href: "/account/settings", icon: Settings, label: "Settings" },
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          "cursor-pointer p-2 hover:bg-accent dark:hover:bg-accent/50 focus:outline-none"
        )}
      >
        <User />
      </DropdownMenuTrigger>
      <DropdownMenuContent className={cn("w-full md:w-[18rem]")}>
        {isAuthenticated() ? (
          <>
            {!isLoading ? (
              <DropdownMenuLabel className={cn("flex items-center gap-2")}>
                <div className="relative w-9 h-9 aspect-square">
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

                <div className="space-y-0.5 lg:space-y-0">
                  <p className="font-medium text-xs lg:text-sm">{fullName}</p>
                  <p className="text-[0.625rem] lg:text-xs font-normal text-muted-foreground">
                    {profile?.email}
                  </p>
                </div>
              </DropdownMenuLabel>
            ) : (
              <DropdownMenuLabel className={cn("flex items-center gap-2")}>
                <div className="flex items-center justify-center gap-2">
                  <User size={20} />
                  <span>Loading...</span>
                </div>
              </DropdownMenuLabel>
            )}
            <DropdownMenuSeparator />
            {navItems.map((item) => (
              <Link href={item.href} key={item.href}>
                <DropdownMenuItem
                  className={cn("py-2.5 text-xs gap-1 lg:gap-2 lg:text-sm")}
                >
                  <item.icon size={20} className="scale-80 lg:scale-100" />
                  {item.label}
                </DropdownMenuItem>
              </Link>
            ))}
            <DropdownMenuSeparator />

            <DropdownMenuItem>
              <LogoutButton />
            </DropdownMenuItem>
          </>
        ) : (
          <>
            <Link href="/auth/login">
              <DropdownMenuItem>Login</DropdownMenuItem>
            </Link>
            <Link href="/auth/register">
              <DropdownMenuItem>Register</DropdownMenuItem>
            </Link>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
