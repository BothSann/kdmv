import Link from "next/link";
import Logo from "./Logo";
import { Heart, User } from "lucide-react";
import { ModeToggle } from "@/components/ModeToggle";
import CartDrawer from "@/components/CartDrawer";

export default function Navigation() {
  return (
    <nav className="flex items-center justify-between">
      <Logo />
      <ul className="flex items-center gap-8">
        <li>
          <Link href="/">
            <Heart />
          </Link>
        </li>

        <CartDrawer />

        <li>
          <Link href="/">
            <User />
          </Link>
        </li>
        <li>
          <ModeToggle />
        </li>
      </ul>
    </nav>
  );
}
