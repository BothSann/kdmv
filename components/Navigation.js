"use client";

import CustomerProfileDropdownMenu from "@/components/customer/CustomerProfileDropdownMenu";

import { ModeToggle } from "@/components/ModeToggle";
import CartDrawer from "@/components/CartDrawer";
import useAuthStore from "@/store/useAuthStore";
import { cn } from "@/lib/utils";
import SearchBar from "./SearchBar";

export default function Navigation({
  className,
  modeToggleClassName,
  modeToggleVariant = "default",
}) {
  const { user } = useAuthStore();
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

        <ModeToggle
          className={modeToggleClassName}
          variant={modeToggleVariant}
        />
      </ul>
    </nav>
  );
}
