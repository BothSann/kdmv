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
import { cn } from "@/lib/utils";

export default function UserProfileDropdownMenu() {
  const { profile } = useAuthorization();
  const fullName = `${profile?.first_name} ${profile?.last_name}`;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          "flex items-center gap-2 cursor-pointer focus:outline-none"
        )}
      >
        <User className="cursor-pointer" />
        <span>{profile ? fullName : "Guest"}</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent className={cn("w-[16rem]")}>
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
