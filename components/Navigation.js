import Link from "next/link";
import Logo from "./Logo";
import { Handbag, Heart, User } from "lucide-react";
import { ModeToggle } from "@/components/ModeToggle";

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
        <li>
          <Link href="/">
            <Handbag />
          </Link>
        </li>
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
