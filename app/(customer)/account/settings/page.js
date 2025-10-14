import UserChangePasswordForm from "@/components/UserChangePasswordForm";

export default function SettingsPage() {
  return (
    <>
      <h2 className="text-2xl font-semibold">Password & Security</h2>

      <UserChangePasswordForm />
    </>
  );
}
