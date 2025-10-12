"use client";

import Link from "next/link";
import CustomerProfileDropdownMenu from "@/components/customer/CustomerProfileDropdownMenu";

import { Heart } from "lucide-react";
import { ModeToggle } from "@/components/ModeToggle";
import { Button } from "./ui/button";
import CartDrawer from "@/components/CartDrawer";

export default function Navigation() {
  return (
    <nav className="z-10">
      <ul className="flex items-center gap-2">
        <>
          <Button variant="ghost" asChild>
            <Link href="/dashboard">
              <Heart className="scale-125" />
            </Link>
          </Button>
        </>

        <CartDrawer />
        <CustomerProfileDropdownMenu />
        <ModeToggle />
      </ul>
    </nav>
  );
}
