"use client";

import Link from "next/link";
import Logo from "./Logo";
import { Heart } from "lucide-react";
import { ModeToggle } from "@/components/ModeToggle";
import CartDrawer from "@/components/CartDrawer";
import Menu from "@/components/Menu";

export default function Navigation() {
  return (
    <nav className="flex items-center justify-between">
      <Logo />
      <div className="flex items-center gap-4">
        <Link href="/">
          <Heart />
        </Link>

        <CartDrawer />
        <Menu />

        <ModeToggle />
      </div>
    </nav>
  );
}
