"use client";

import CustomerProfileDropdownMenu from "@/components/customer/CustomerProfileDropdownMenu";

import { ModeToggle } from "@/components/ModeToggle";
import CartDrawer from "@/components/CartDrawer";
import useAuthStore from "@/store/useAuthStore";
import { cn } from "@/lib/utils";
import SearchBar from "./SearchBar";
import useAuthorization from "@/hooks/useAuthorization";
import { Button } from "./ui/button";
import Link from "next/link";
import { UserStar } from "lucide-react";

export default function Navigation({
  className,
  modeToggleClassName,
  modeToggleVariant = "default",
}) {
  const { user } = useAuthStore();
  const { isAdmin } = useAuthorization();

  return (
    <nav className={cn("z-10", className)}>
      <ul className="flex items-center lg:gap-2">
        {/* <>
          <Button variant="ghost" asChild>
            <Link href="/dashboard">
              <Heart className="scale-125" />
            </Link>
          </Button>
        </> */}
        <SearchBar />
        {user && <CartDrawer />}

        <CustomerProfileDropdownMenu />
        {isAdmin() && <Button variant="ghost" size="icon" asChild className="cursor-pointer">
          <Link href="/admin/dashboard">
            <UserStar className="size-5 sm:size-6" />
          </Link>
        </Button>}

        <ModeToggle
          className={modeToggleClassName}
          variant={modeToggleVariant}
        />
      </ul>
    </nav>
  );
}
