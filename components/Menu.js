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

export default function Menu() {
  const { profile } = useAuthorization();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-2">
        <User className="cursor-pointer" />
        <span>{profile ? profile.first_name : "Guest"}</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-[14rem] ">
        {profile ? (
          <>
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <LogoutButton />
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
