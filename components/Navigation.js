"use client";

import Link from "next/link";
import UserProfileDropdownMenu from "@/components/UserProfileDropdownMenu";
import useAuthorization from "@/hooks/useAuthorization";
import { Heart } from "lucide-react";
import { ModeToggle } from "@/components/ModeToggle";
import { Button } from "./ui/button";
import CartDrawer from "@/components/CartDrawer";

export default function Navigation() {
  const { isAuthenticated } = useAuthorization();
  return (
    <nav className="z-10">
      <ul className="flex items-center gap-2">
        {isAuthenticated() && (
          <>
            <Button variant="ghost" asChild>
              <Link href="/dashboard">
                <Heart className="scale-125" />
              </Link>
            </Button>
          </>
        )}
        <CartDrawer />
        <UserProfileDropdownMenu />
        <ModeToggle />
      </ul>
    </nav>
  );
}
