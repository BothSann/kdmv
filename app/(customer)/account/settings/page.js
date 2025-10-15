import UserChangePasswordForm from "@/components/UserChangePasswordForm";

export default function SettingsPage() {
  return (
    <>
      <h2 className="text-[2.125rem] lg:text-3xl font-bold">
        Password & Security
      </h2>

      <UserChangePasswordForm />
    </>
  );
}
