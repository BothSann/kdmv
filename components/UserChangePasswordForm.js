"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { verifyAndUpdateUserPasswordAction } from "@/server/actions/user-action";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { changePasswordSchema } from "@/lib/validations/password";
import { cn } from "@/lib/utils";
import FormError from "@/components/FormError";

export default function UserChangePasswordForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  // Initialize React Hook Form with Zod validation
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
    reset,
    watch,
  } = useForm({
    resolver: zodResolver(changePasswordSchema),
    mode: "onBlur", // Validate on blur for better UX
    defaultValues: {
      current_password: "",
      new_password: "",
      confirm_password: "",
      logout_other_devices: false,
    },
  });

  // Watch password fields for real-time feedback
  const newPassword = watch("new_password");
  const confirmPassword = watch("confirm_password");

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const handleCancel = () => {
    reset(); // Clear all form fields
    router.back();
  };

  // Form submission handler - receives validated data from React Hook Form
  const onSubmit = async (data) => {
    // data is already validated by Zod at this point!
    const toastId = toast.loading("Updating password...");

    try {
      const { success, error, message } =
        await verifyAndUpdateUserPasswordAction(data);

      if (error) {
        toast.error(error, { id: toastId });
        return;
      }

      if (success) {
        toast.success(message, { id: toastId });
        reset(); // Clear all form fields
      }
    } catch (error) {
      toast.error(error.message, { id: toastId });
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="w-full lg:w-3/4 mt-8 lg:mt-10"
    >
      <div className="grid grid-cols-1 gap-6">
        <div className="space-y-2.5">
          <Label htmlFor="current_password">
            Current Password<span className="text-destructive">*</span>
          </Label>
          <div className="relative">
            <Input
              {...register("current_password")}
              id="current_password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter current password"
              disabled={isSubmitting}
              className={cn(
                "pr-10",
                errors.current_password && "border-destructive"
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
          {errors.current_password && (
            <FormError message={errors.current_password.message} />
          )}
        </div>
        <div className="space-y-2.5">
          <Label htmlFor="new_password">
            New Password<span className="text-destructive">*</span>
          </Label>
          <Input
            {...register("new_password")}
            id="new_password"
            type={showPassword ? "text" : "password"}
            placeholder="Enter new password"
            disabled={isSubmitting}
            className={cn(
              "w-full",
              errors.new_password && "border-destructive"
            )}
          />
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
            Confirm New Password<span className="text-destructive">*</span>
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
              <p className="text-xs text-success">&#10003; Passwords match</p>
            ) : (
              <p className="text-xs text-warning">
                &#10007; Passwords do not match yet
              </p>
            ))}
        </div>

        {/* Logout other devices */}
        <div className="flex items-center gap-2">
          <Controller
            name="logout_other_devices"
            control={control}
            render={({ field }) => (
              <Checkbox
                id="logout_other_devices"
                checked={field.value}
                onCheckedChange={field.onChange}
                disabled={isSubmitting || true} // Keep disabled for now
              />
            )}
          />
          <Label htmlFor="logout_other_devices">Logout of other devices</Label>
        </div>

        <div className="flex justify-end gap-3">
          <Button
            variant="outline"
            type="button"
            disabled={isSubmitting}
            onClick={handleCancel}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Updating..." : "Update Password"}
          </Button>
        </div>
      </div>
    </form>
  );
}
