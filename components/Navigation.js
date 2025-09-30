"use client";

import Link from "next/link";
import CartDrawer from "@/components/CartDrawer";
import UserProfileDropdownMenu from "@/components/UserProfileDropdownMenu";
import useAuthorization from "@/hooks/useAuthorization";
import { Heart } from "lucide-react";
import { ModeToggle } from "@/components/ModeToggle";

export default function Navigation({ modeToggleClassName }) {
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
          <UserProfileDropdownMenu />
        </li>
        <li className="flex items-center">
          <ModeToggle className={`${modeToggleClassName}`} />
        </li>
      </ul>
    </nav>
  );
}
