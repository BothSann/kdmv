import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import useAuthStore from "@/store/useAuthStore";

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

  return <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>;
}
