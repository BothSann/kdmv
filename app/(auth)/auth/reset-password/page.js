import ResetPasswordForm from "@/components/ResetPasswordForm";

export const metadata = {
  title: "Reset Password | KDMV",
  description: "Set your new password",
};

export default function ResetPasswordPage() {
  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-md">
        <ResetPasswordForm />
      </div>
    </div>
  );
}
