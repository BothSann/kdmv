import UserChangePasswordForm from "@/components/UserChangePasswordForm";

export const metadata = {
  title: "KDMV | Settings",
  description: "Manage your account settings and preferences",
};

export default function SettingsPage() {
  return (
    <>
      <h2 className="text-2xl xl:text-3xl font-bold">Password & Security</h2>

      <UserChangePasswordForm />
    </>
  );
}
