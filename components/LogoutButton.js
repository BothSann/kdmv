"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import useAuthStore from "@/store/useAuthStore";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

export default function LogoutButton() {
  const router = useRouter();
  const { logoutUser } = useAuthStore();

  async function handleLogout() {
    const { error, success } = await logoutUser();

    if (error) {
      toast.error(error);
      return;
    }

    if (success) {
      toast.success("Logged out successfully!");
      router.push("/");
    }
  }

  return (
    <Button
      className="flex items-center w-full cursor-pointer rounded-none"
      onClick={handleLogout}
    >
      <LogOut />
      <span>Logout</span>
    </Button>
  );
}
