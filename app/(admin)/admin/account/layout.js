import { Palette, Shield, User } from "lucide-react";
import Link from "next/link";

export default function AccountPage({ children }) {
  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center pl-8">
        <h1 className="text-3xl font-bold">Account</h1>
      </div>

      <div className="grid grid-cols-[1fr_3fr] mt-8 gap-x-2">
        <aside className="px-4 py-2 border-r border-border">
          <ul className="space-y-4">
            <Link
              href="/admin/account/profile"
              className="flex items-center gap-2 px-4 py-2.5 hover:bg-accent"
            >
              <User size={22} />
              Personal Info
            </Link>
            <Link
              href="/admin/account/password"
              className="flex items-center gap-2 px-4 py-2.5 hover:bg-accent"
            >
              <Shield size={22} />
              Password & Security
            </Link>
            <Link
              href="/admin/account/appearance"
              className="flex items-center gap-2 px-4 py-2.5 hover:bg-accent"
            >
              <Palette size={22} />
              Appearance
            </Link>
          </ul>
        </aside>

        <div className="px-4 py-2">{children}</div>
      </div>
    </div>
  );
}
