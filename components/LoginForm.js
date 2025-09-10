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
import { toast } from "sonner";
import { loginUserAction } from "@/lib/actions";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import useAuthStore from "@/store/useAuthStore";

export default function LoginForm() {
  const { initAuth } = useAuthStore();
  const router = useRouter();

  const handleSubmit = async (event) => {
    event.preventDefault();

    const formData = new FormData(event.target);
    const loginData = {
      email: formData.get("email"),
      password: formData.get("password"),
    };

    const toastId = toast.loading("Logging in...");
    try {
      const { error, success, redirectTo, message } = await loginUserAction(
        loginData
      );
      await initAuth();

      if (error) {
        toast.error(error, { id: toastId });
      }

      if (success) {
        toast.success(message, { id: toastId });
        router.push(redirectTo || "/");
      }
    } catch (err) {
      toast.error(err.message, { id: toastId });
    }
  };
  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader className="flex flex-col items-center">
          <Logo />
          <CardTitle className="text-2xl font-bold">
            Login to your account
          </CardTitle>
          <CardDescription>
            Enter your email below to login to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-3">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="m@example.com"
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
                <Input id="password" name="password" type="password" required />
              </div>

              <SubmitButton />
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

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? "Logging in..." : "Login"}
    </Button>
  );
}
