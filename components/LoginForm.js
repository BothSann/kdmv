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
import useAuthStore from "@/store/useAuthStore";
import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";

export default function LoginForm() {
  const { signInUser } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);

    const toastId = toast.loading("Logging in...");
    try {
      const formData = new FormData(event.target);
      const result = await signInUser(
        formData.get("email"),
        formData.get("password")
      );

      if (result.error) {
        toast.error(result.error, { id: toastId });
      }

      if (result.success) {
        toast.success(result.message, { id: toastId });
        router.push(result.redirectTo);
      }
    } catch (error) {
      toast.error(error.message, { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  return (
    <div className="flex flex-col gap-6">
      <Card className="space-y-4">
        <CardHeader className="flex flex-col items-center gap-2">
          <Logo />

          <div className="flex flex-col items-center gap-1">
            <CardTitle>Login to your account</CardTitle>
            <CardDescription>
              Enter your email below to login to your account
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-6">
              <LoginFormField
                isSubmitting={isSubmitting}
                showPassword={showPassword}
                togglePasswordVisibility={togglePasswordVisibility}
              />
            </div>
            <div className="mt-4 text-sm text-center">
              Don&apos;t have an account?{" "}
              <Link
                href="/auth/register"
                className="underline underline-offset-4"
              >
                Sign up
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

function LoginFormField({
  isSubmitting,
  showPassword,
  togglePasswordVisibility,
}) {
  return (
    <>
      <div className="grid gap-3">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="m@example.com"
          disabled={isSubmitting}
          required
        />
      </div>
      <div className="grid gap-3">
        <div className="flex items-center">
          <Label htmlFor="password">Password</Label>
          <a
            href="#"
            className="ml-auto inline-block underline-offset-4 hover:underline text-sm"
          >
            Forgot your password?
          </a>
        </div>
        <div className="relative">
          <Input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            disabled={isSubmitting}
            required
          />
          {showPassword ? (
            <Eye
              size={20}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground cursor-pointer"
              onClick={togglePasswordVisibility}
            />
          ) : (
            <EyeOff
              size={20}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground cursor-pointer"
              onClick={togglePasswordVisibility}
            />
          )}
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Logging in..." : "Login"}
      </Button>
    </>
  );
}
