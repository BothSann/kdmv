import CustomerUpdateProfileForm from "@/components/UserUpdateProfileForm";
import { getCurrentUser } from "@/lib/api/users";

export async function generateMetadata() {
  const { user } = await getCurrentUser();
  return {
    title: `Profile | ${user?.user_metadata?.first_name} ${user?.user_metadata?.last_name}`,
  };
}

export default function ProfilePage() {
  return (
    <>
      <h2 className="text-2xl xl:text-3xl font-bold">Update profile</h2>

      <CustomerUpdateProfileForm />
    </>
  );
}
