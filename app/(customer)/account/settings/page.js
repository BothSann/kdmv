import UserChangePasswordForm from "@/components/UserChangePasswordForm";

export default function SettingsPage() {
  return (
    <>
      <h2 className="text-3xl font-bold">Password & Security</h2>

      <UserChangePasswordForm />
    </>
  );
}
