"use client";

import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import Logo from "../Logo";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerAdminAction } from "@/server/actions/auth-action";
import { Label } from "../ui/label";
import { adminCreateSchema } from "@/lib/validations/admin";
import { cn } from "@/lib/utils";
import FormError from "../FormError";

export default function AdminCreateForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    reset,
  } = useForm({
    resolver: zodResolver(adminCreateSchema),
    mode: "onBlur",
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      password: "",
      confirm_password: "",
    },
  });

  // Watch password fields for real-time inline validation
  const password = watch("password");
  const confirmPassword = watch("confirm_password");

  const onSubmit = async (data) => {
    // data is already validated by Zod and includes:
    // - first_name, last_name (trimmed)
    // - email (lowercased)
    // - password (strength validated)
    // - confirm_password (matching validated)

    const toastId = toast.loading("Creating admin...");

    try {
      // Remove confirm_password before sending to server
      const { confirm_password, ...adminData } = data;

      const { success, error, message } = await registerAdminAction(adminData);

      if (error) {
        toast.error(error, { id: toastId });
      }

      if (success) {
        toast.success(message, { id: toastId });
        reset(); // Reset form to default values
      }
    } catch (error) {
      toast.error(error.message, { id: toastId });
    }
  };

  return (
    <form className="mt-10" onSubmit={handleSubmit(onSubmit)}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button variant="outline" asChild disabled={isSubmitting}>
              <Link href="/admin/users">
                <ChevronLeft />
              </Link>
            </Button>

            <h1 className="text-4xl font-bold">Create Admin</h1>
          </div>
        </div>

        <div className="grid grid-cols-1">
          <div className="rounded-lg p-6 shadow-sm border border-border bg-card">
            <h2 className="text-xl font-semibold">
              Please fill in the information below
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-10 mt-10">
              <div className="space-y-4 order-last lg:order-first">
                <div className="space-y-4">
                  <Label htmlFor="first_name">First Name</Label>
                  <Input
                    {...register("first_name")}
                    type="text"
                    disabled={isSubmitting}
                    className={cn(errors.first_name && "border-destructive")}
                  />
                  {errors.first_name && (
                    <FormError message={errors.first_name.message} />
                  )}
                </div>
                <div className="space-y-4">
                  <Label htmlFor="last_name">Last Name</Label>
                  <Input
                    {...register("last_name")}
                    type="text"
                    disabled={isSubmitting}
                    className={cn(errors.last_name && "border-destructive")}
                  />
                  {errors.last_name && (
                    <FormError message={errors.last_name.message} />
                  )}
                </div>
                <div className="space-y-4">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    {...register("email")}
                    type="email"
                    disabled={isSubmitting}
                    className={cn(errors.email && "border-destructive")}
                  />
                  {errors.email && <FormError message={errors.email.message} />}
                </div>
                <div className="space-y-4">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    {...register("password")}
                    type="password"
                    disabled={isSubmitting}
                    className={cn(errors.password && "border-destructive")}
                  />
                  {errors.password && (
                    <FormError message={errors.password.message} />
                  )}
                </div>
                <div className="space-y-4">
                  <Label htmlFor="confirm_password">Confirm Password</Label>
                  <Input
                    {...register("confirm_password")}
                    type="password"
                    disabled={isSubmitting}
                    className={cn(
                      errors.confirm_password && "border-destructive"
                    )}
                  />
                  {errors.confirm_password && (
                    <FormError message={errors.confirm_password.message} />
                  )}
                </div>
                <div className="flex justify-end gap-3">
                  <Button
                    className="px-4 py-2"
                    variant="outline"
                    type="button"
                    asChild
                    disabled={isSubmitting}
                  >
                    <Link href="/admin/users">Cancel</Link>
                  </Button>
                  <Button
                    type="submit"
                    className="px-4 py-2"
                    disabled={isSubmitting || password !== confirmPassword}
                  >
                    {isSubmitting ? "Creating..." : "Create Admin"}
                  </Button>
                </div>
              </div>

              <div className="flex justify-center items-center">
                <Logo width="w-64" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
