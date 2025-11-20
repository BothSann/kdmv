"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Logo from "@/components/Logo";
import Link from "next/link";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { forgotPasswordSchema } from "@/lib/validations/auth";
import FormError from "@/components/FormError";
import { cn } from "@/lib/utils";
import { sendPasswordResetEmailAction } from "@/server/actions/auth-action";
import { ArrowLeft } from "lucide-react";

export default function ForgotPasswordForm() {
  const [emailSent, setEmailSent] = useState(false);

  // React Hook Form with Zod validation
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    getValues,
  } = useForm({
    resolver: zodResolver(forgotPasswordSchema),
    mode: "onBlur",
    defaultValues: {
      email: "",
    },
  });

  // Form submit handler with validated data
  const onSubmit = async (data) => {
    const toastId = toast.loading("Sending reset link...");

    try {
      const result = await sendPasswordResetEmailAction(data.email);

      if (result.error) {
        toast.error(result.error, { id: toastId });
        return;
      }

      if (result.success) {
        toast.success(result.message, { id: toastId });
        setEmailSent(true);
      }
    } catch (error) {
      toast.error("Failed to send reset link. Please try again.", {
        id: toastId,
      });
    }
  };

  // Show success message after email is sent
  if (emailSent) {
    return (
      <div className="flex flex-col gap-6">
        <Card className="space-y-4">
          <CardHeader className="flex flex-col items-center gap-2">
            <Logo />

            <div className="flex flex-col items-center gap-1 text-center">
              <CardTitle>Check Your Email</CardTitle>
              <CardDescription>
                We sent a password reset link to{" "}
                <span className="font-medium text-foreground">
                  {getValues("email")}
                </span>
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="rounded-lg border p-4 text-sm text-muted-foreground">
              <p className="mb-2">
                Click the link in the email to reset your password.
              </p>
              <p>If you don&apos;t see the email, check your spam folder.</p>
            </div>

            <div className="text-center text-sm">
              Didn&apos;t receive the email?{" "}
              <button
                onClick={() => setEmailSent(false)}
                className="underline underline-offset-4 hover:text-primary"
              >
                Try again
              </button>
            </div>

            <div className="text-center">
              <Link
                href="/auth/login"
                className="inline-flex items-center gap-2 text-sm hover:underline underline-offset-4"
              >
                <ArrowLeft size={16} />
                Back to Login
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <Card className="space-y-4">
        <CardHeader className="flex flex-col items-center gap-2">
          <Logo />

          <div className="flex flex-col items-center gap-1 text-center">
            <CardTitle>Forgot Password?</CardTitle>
            <CardDescription>
              Enter your email address and we&apos;ll send you a link to reset
              your password
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="flex flex-col gap-6">
              <div className="space-y-2.5">
                <Label htmlFor="email">Email</Label>
                <Input
                  {...register("email")}
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  disabled={isSubmitting}
                  className={cn("w-full", errors.email && "border-destructive")}
                />
                {errors.email && <FormError message={errors.email.message} />}
              </div>

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Sending..." : "Send Reset Link"}
              </Button>
            </div>

            <div className="mt-4 text-center">
              <Link
                href="/auth/login"
                className="inline-flex items-center gap-2 text-sm hover:underline underline-offset-4"
              >
                <ArrowLeft size={16} />
                Back to Login
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
