"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import useAuthStore from "@/store/useAuthStore";

export default function LogoutButton() {
  const { logoutUser } = useAuthStore();
  const router = useRouter();

  async function handleLogout() {
    const toastId = toast.loading("Logging out...");

    try {
      const { error, success, message } = await logoutUser();

      if (error) toast.error(error, { id: toastId });

      if (success) {
        toast.success(message, { id: toastId });
        router.push("/");
      }
    } catch (err) {
      toast.error(err.message, { id: toastId });
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
