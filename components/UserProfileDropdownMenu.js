import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User } from "lucide-react";
import Link from "next/link";
import LogoutButton from "@/components/LogoutButton";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import useAuthStore from "@/store/useAuthStore";

export default function UserProfileDropdownMenu() {
  const { profile } = useAuthStore();
  const fullName = `${profile?.first_name} ${profile?.last_name}`;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost">
          <User className="scale-125" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className={cn("w-[16rem]")}>
        {profile ? (
          <>
            <Link href="/account/profile">
              <DropdownMenuItem>{fullName}</DropdownMenuItem>
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
