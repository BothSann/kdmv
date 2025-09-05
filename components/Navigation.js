"use client";

import Link from "next/link";
import CartDrawer from "@/components/CartDrawer";
import UserDropdownMenu from "@/components/UserDropdownMenu";
import useAuthorization from "@/hooks/useAuthorization";
import { Heart } from "lucide-react";
import { ModeToggle } from "@/components/ModeToggle";

export default function Navigation() {
  const { isAuthenticated } = useAuthorization();
  return (
    <nav className="z-10">
      <ul className="flex items-center gap-4">
        {isAuthenticated() && (
          <>
            <li className="flex items-center">
              <Link href="/" className="flex items-center">
                <Heart />
              </Link>
            </li>
            <li className="flex items-center">
              <CartDrawer />
            </li>
          </>
        )}
        <li className="flex items-center ">
          <UserDropdownMenu />
        </li>
        <li className="flex items-center">
          <ModeToggle />
        </li>
      </ul>
    </nav>
  );
}
