"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Logo from "@/components/Logo";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { resetPasswordSchema } from "@/lib/validations/password";
import FormError from "@/components/FormError";
import { cn } from "@/lib/utils";
import { createSupabaseFrontendClient } from "@/utils/supabase/client";
import { getCurrentUserAction } from "@/server/actions/auth-action";

export default function ResetPasswordForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isRecoverySession, setIsRecoverySession] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const supabase = createSupabaseFrontendClient();

  // React Hook Form with Zod validation
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
  } = useForm({
    resolver: zodResolver(resetPasswordSchema),
    mode: "onBlur",
    defaultValues: {
      new_password: "",
      confirm_password: "",
    },
  });

  // Watch password fields for real-time feedback
  const newPassword = watch("new_password");
  const confirmPassword = watch("confirm_password");

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  // ═══════════════════════════════════════════════════════════
  // SECURITY: Detect recovery session
  // Since PASSWORD_RECOVERY event doesn't fire with server-side verifyOtp,
  // we check session age to determine if this is a legitimate recovery
  // ═══════════════════════════════════════════════════════════
  useEffect(() => {
    let isMounted = true;

    const checkRecoverySession = async () => {
      const { user } = await getCurrentUserAction();

      if (!isMounted) return;

      if (!user) {
        console.log("❌ No session found - not a recovery session");
        setIsRecoverySession(false);
        setIsCheckingSession(false);
        return;
      }

      // ═══════════════════════════════════════════════════════════
      // SECURITY: Check recovery_sent_at timestamp
      // This timestamp is set when password reset email is sent
      // and is NOT affected by logout/login cycles
      // ═══════════════════════════════════════════════════════════

      // If no recovery_sent_at, user didn't request password reset → Block
      if (!user.recovery_sent_at) {
        setIsRecoverySession(false);
        setIsCheckingSession(false);
        return;
      }

      // Check if recovery request is recent (< 2 minutes)
      const now = Date.now();
      const recoverySentTime = new Date(user.recovery_sent_at).getTime();
      const sessionAge = now - recoverySentTime;
      const twoMinutes = 2 * 60 * 1000;

      if (sessionAge < twoMinutes) {
        setIsRecoverySession(true);
      } else {
        setIsRecoverySession(false);
      }

      setIsCheckingSession(false);
    };

    checkRecoverySession();

    return () => {
      isMounted = false;
    };
  }, []);

  // Form submission handler
  const onSubmit = async (data) => {
    const toastId = toast.loading("Updating password...");

    try {
      // Call updateUser() directly - no current password needed in recovery mode
      const { error } = await supabase.auth.updateUser({
        password: data.new_password,
      });

      if (error) {
        console.error("Password update error:", error);
        toast.error(error.message || "Failed to reset password", {
          id: toastId,
        });
        return;
      }

      toast.success("Password updated successfully!", { id: toastId });

      // Redirect to home page
      setTimeout(() => {
        router.push("/");
      }, 1000);
    } catch (error) {
      console.error("Unexpected error:", error);
      toast.error("Failed to reset password. Please try again.", {
        id: toastId,
      });
    }
  };

  // Show loading state while checking for recovery session
  if (isCheckingSession) {
    return (
      <div className="flex flex-col gap-6">
        <Card className="space-y-4">
          <CardHeader className="flex flex-col items-center gap-2">
            <Logo />
            <div className="flex flex-col items-center gap-1">
              <CardTitle>Reset Password</CardTitle>
              <CardDescription>Verifying your reset link...</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="flex justify-center py-8">
            <div className="animate-pulse text-muted-foreground">
              Checking session...
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show error if not a valid recovery session
  if (!isRecoverySession) {
    return (
      <div className="flex flex-col gap-6">
        <Card className="space-y-4">
          <CardHeader className="flex flex-col items-center gap-2">
            <Logo />
            <div className="flex flex-col items-center gap-1 text-center">
              <CardTitle>Invalid Reset Link</CardTitle>
              <CardDescription>
                This page can only be accessed via a password reset link from
                your email.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground text-center">
              If you need to reset your password, please request a new
            </p>
            <Button
              className="w-full"
              onClick={() => router.push("/auth/forgot-password")}
            >
              Request Reset Link
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show password reset form (only for valid recovery sessions)
  return (
    <div className="flex flex-col gap-6">
      <Card className="space-y-4">
        <CardHeader className="flex flex-col items-center gap-2">
          <Logo />

          <div className="flex flex-col items-center gap-1 text-center">
            <CardTitle>Reset Your Password</CardTitle>
            <CardDescription>
              Enter your new password below. Make sure it&apos;s strong and
              secure.
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="flex flex-col gap-6">
              <div className="space-y-2.5">
                <Label htmlFor="new_password">
                  New Password<span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <Input
                    {...register("new_password")}
                    id="new_password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter new password"
                    disabled={isSubmitting}
                    className={cn(
                      "pr-10",
                      errors.new_password && "border-destructive"
                    )}
                  />
                  {showPassword ? (
                    <Eye
                      size={20}
                      className={cn(
                        "absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground cursor-pointer",
                        isSubmitting && "opacity-50 cursor-not-allowed"
                      )}
                      onClick={togglePasswordVisibility}
                    />
                  ) : (
                    <EyeOff
                      size={20}
                      className={cn(
                        "absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground cursor-pointer",
                        isSubmitting && "opacity-50 cursor-not-allowed"
                      )}
                      onClick={togglePasswordVisibility}
                    />
                  )}
                </div>
                {errors.new_password && (
                  <FormError message={errors.new_password.message} />
                )}
                {/* Password strength indicator */}
                {newPassword && !errors.new_password && (
                  <p className="text-xs text-success">
                    &#10003; Password meets requirements
                  </p>
                )}
              </div>

              <div className="space-y-2.5">
                <Label htmlFor="confirm_password">
                  Confirm New Password
                  <span className="text-destructive">*</span>
                </Label>
                <Input
                  {...register("confirm_password")}
                  id="confirm_password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Re-enter new password"
                  disabled={isSubmitting}
                  className={cn(
                    "w-full",
                    errors.confirm_password && "border-destructive"
                  )}
                />
                {errors.confirm_password && (
                  <FormError message={errors.confirm_password.message} />
                )}

                {/* Real-time password match indicator */}
                {newPassword &&
                  confirmPassword &&
                  !errors.confirm_password &&
                  (newPassword === confirmPassword ? (
                    <p className="text-xs text-success">
                      &#10003; Passwords match
                    </p>
                  ) : (
                    <p className="text-xs text-warning">
                      &#10007; Passwords do not match yet
                    </p>
                  ))}
              </div>

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Updating..." : "Reset Password"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
