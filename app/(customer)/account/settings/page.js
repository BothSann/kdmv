import UserChangePasswordForm from "@/components/UserChangePasswordForm";

export default function SettingsPage() {
  return (
    <>
      <h1 className="text-2xl font-semibold">Password & Security</h1>

      <UserChangePasswordForm />
    </>
  );
}
