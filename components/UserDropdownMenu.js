import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User } from "lucide-react";
import Link from "next/link";
import useAuthorization from "@/hooks/useAuthorization";
import LogoutButton from "@/components/LogoutButton";

export default function UserDropdownMenu() {
  const { profile } = useAuthorization();
  const fullName = `${profile?.first_name} ${profile?.last_name}`;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-2 cursor-pointer focus:outline-none">
        <User className="cursor-pointer" />
        <span>{profile ? fullName : "Guest"}</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-[14rem]">
        {profile ? (
          <>
            <Link href="/account/profile">
              <DropdownMenuItem>My Profile</DropdownMenuItem>
            </Link>
            <DropdownMenuItem>
              <LogoutButton />
            </DropdownMenuItem>
          </>
        ) : (
          <>
            <Link href="/auth/login">
              <DropdownMenuItem>Login</DropdownMenuItem>
            </Link>
            <Link href="/auth/register">
              <DropdownMenuItem>Register</DropdownMenuItem>
            </Link>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
