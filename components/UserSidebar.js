import { MapPinHouse, FileText, Settings, User } from "lucide-react";
import Link from "next/link";
import LogoutButton from "./LogoutButton";

const navLinks = [
  {
    title: "Profile",
    href: "/account/profile",
    icon: <User size={24} />,
  },
  {
    title: "Orders",
    href: "/account/orders",
    icon: <FileText size={24} />,
  },
  {
    title: "Address",
    href: "/account/address",
    icon: <MapPinHouse size={24} />,
  },
  {
    title: "Settings",
    href: "/account/settings",
    icon: <Settings size={24} />,
  },
];

export function UserSidebar() {
  return (
    <nav className="border-r border-zinc-200 dark:border-zinc-800 ">
      <ul className="flex flex-col space-y-1 h-full">
        {navLinks.map((link) => (
          <li key={link.title}>
            <Link
              href={link.href}
              className="flex items-center gap-4 hover:bg-zinc-100 dark:hover:bg-zinc-900 px-2 py-4 transition-colors"
            >
              {link.icon}
              {link.title}
            </Link>
          </li>
        ))}

        <li className="mt-auto">
          <LogoutButton />
        </li>
      </ul>
    </nav>
  );
}
