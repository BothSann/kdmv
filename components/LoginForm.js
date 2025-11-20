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
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema } from "@/lib/validations/auth";
import FormError from "@/components/FormError";
import { cn } from "@/lib/utils";

export default function LoginForm() {
  const { signInUser } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  // React Hook Form with Zod validation
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
    mode: "onBlur",
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // Form submit handler with validated data
  const onSubmit = async (data) => {
    const toastId = toast.loading("Logging in...");
    try {
      // data is already validated by Zod schema
      const result = await signInUser(data.email, data.password);

      if (result.error) {
        toast.error(result.error, { id: toastId });
      }

      if (result.success) {
        toast.success(result.message, { id: toastId });
        router.push(result.redirectTo);
      }
    } catch (error) {
      toast.error(error.message, { id: toastId });
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
              <div className="space-y-2.5">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                  <Link
                    href="/auth/forgot-password"
                    className="ml-auto inline-block underline-offset-4 hover:underline text-sm"
                  >
                    Forgot your password?
                  </Link>
                </div>
                <div className="relative">
                  <Input
                    {...register("password")}
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    disabled={isSubmitting}
                    className={cn(
                      "w-full pr-10",
                      errors.password && "border-destructive"
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
                {errors.password && (
                  <FormError message={errors.password.message} />
                )}
              </div>

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Logging in..." : "Login"}
              </Button>
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
