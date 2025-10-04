"use client";

import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import Logo from "../Logo";
import { toast } from "sonner";
import { useState } from "react";
import { registerAdminAction } from "@/actions/auth-action";
import { Label } from "../ui/label";

export default function AdminCreateForm() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isPending, setIsPending] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsPending(true);

    const formData = new FormData(event.target);

    const adminData = {
      first_name: formData.get("first_name"),
      last_name: formData.get("last_name"),
      email: formData.get("email"),
      password: formData.get("password"),
    };

    const toastId = toast.loading("Creating admin...");

    if (password !== confirmPassword) {
      toast.error("Passwords do not match!", { id: toastId });
      return;
    }

    try {
      const { success, error, message } = await registerAdminAction(adminData);

      if (error) {
        toast.error(error, { id: toastId });
      }

      if (success) {
        toast.success(message, { id: toastId });
        event.target.reset();

        setPassword("");
        setConfirmPassword("");
      }
    } catch (error) {
      toast.error(error.message, { id: toastId });
    } finally {
      setIsPending(false);
    }
  };

  return (
    <form className="mt-10" onSubmit={handleSubmit}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button variant="outline" asChild disabled={isPending}>
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
                    type="text"
                    name="first_name"
                    required
                    disabled={isPending}
                  />
                </div>
                <div className="space-y-4">
                  <Label htmlFor="last_name">Last Name</Label>
                  <Input
                    type="text"
                    name="last_name"
                    required
                    disabled={isPending}
                  />
                </div>
                <div className="space-y-4">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    type="email"
                    name="email"
                    required
                    disabled={isPending}
                  />
                </div>
                <div className="space-y-4">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    type="password"
                    name="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isPending}
                  />
                </div>
                <div className="space-y-4">
                  <Label htmlFor="confirm_password">Confirm Password</Label>
                  <Input
                    type="password"
                    name="confirm_password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={isPending}
                  />
                  {password !== confirmPassword &&
                    password &&
                    confirmPassword && (
                      <p className="text-destructive text-sm mt-3">
                        Passwords do not match!
                      </p>
                    )}
                </div>
                <div className="flex justify-end gap-3">
                  <Button
                    className="px-4 py-2"
                    variant="outline"
                    type="button"
                    asChild
                    disabled={isPending}
                  >
                    <Link href="/admin/users">Cancel</Link>
                  </Button>
                  <Button
                    type="submit"
                    className="px-4 py-2"
                    disabled={isPending || password !== confirmPassword}
                  >
                    {isPending ? "Creating..." : "Create Admin"}
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
