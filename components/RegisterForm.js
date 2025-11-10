"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import { toast } from "sonner";
import { registerUserAction } from "@/actions/auth-action";
import { useState } from "react";

import Logo from "@/components/Logo";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";

export default function RegisterForm() {
  const [gender, setGender] = useState("");
  const [country, setCountry] = useState("Cambodia");
  const [cityProvince, setCityProvince] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  async function handleSubmit(event) {
    event.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(event.target);

    const registerData = {
      first_name: formData.get("first_name"),
      last_name: formData.get("last_name"),
      email: formData.get("email"),
      password: formData.get("password"),
      gender: formData.get("gender"),
      telephone: formData.get("telephone"),
      country: formData.get("country"),
      city_province: formData.get("city_province"),
    };

    const toastId = toast.loading("Registering...");

    try {
      const { success, error, message, authData } = await registerUserAction(
        registerData
      );

      if (error) {
        toast.error(error, { id: toastId });
      }
      if (success) {
        toast.success(message, { id: toastId });
        event.target.reset();
      }
    } catch (error) {
      toast.error(error.message, { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card className="space-y-4">
      <CardHeader className="flex flex-col items-center gap-2">
        <Logo />
        <div className="flex flex-col items-center gap-1">
          <CardTitle>Create an account</CardTitle>
          <CardDescription>
            Enter the details below to create an account
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <div className="flex flex-col gap-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-3">
                <Label htmlFor="first_name">First Name</Label>
                <Input
                  name="first_name"
                  minLength={3}
                  id="first_name"
                  type="text"
                  placeholder="KDMV"
                  required
                  disabled={isSubmitting}
                />
              </div>
              <div className="grid gap-3">
                <Label htmlFor="last_name">Last Name</Label>
                <Input
                  name="last_name"
                  minLength={3}
                  id="last_name"
                  type="text"
                  placeholder="Digital"
                  required
                />
              </div>
            </div>

            <div className="space-y-4">
              <Label htmlFor="email">Email</Label>
              <Input
                name="email"
                id="email"
                type="email"
                placeholder="m@example.com"
                required
                disabled={isSubmitting}
              />
            </div>
            <div className="space-y-4">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  name="password"
                  id="password"
                  placeholder="Password"
                  type={showPassword ? "text" : "password"}
                  required
                  disabled={isSubmitting}
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
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <Label htmlFor="gender">Gender</Label>
                <Select
                  name="gender"
                  value={gender}
                  onValueChange={setGender}
                  disabled={isSubmitting}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="prefer not to say">
                      Prefer not to say
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-4">
                <Label htmlFor="telephone">Telephone</Label>
                <Input
                  name="telephone"
                  id="telephone"
                  type="tel"
                  placeholder="0123456789"
                  required
                  disabled={isSubmitting}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <Label htmlFor="country">Country</Label>
                <Select
                  name="country"
                  value={country}
                  onValueChange={setCountry}
                  disabled={isSubmitting}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Cambodia">Cambodia</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-4">
                <Label htmlFor="city_province">City/Province</Label>
                <Select
                  name="city_province"
                  value={cityProvince}
                  onValueChange={setCityProvince}
                  required
                  disabled={isSubmitting}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a city/province" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Phnom Penh">Phnom Penh</SelectItem>
                    <SelectItem value="Siem Reap">Siem Reap</SelectItem>
                    <SelectItem value="Battambang">Battambang</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex flex-col gap-3">
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Registering..." : "Register"}
              </Button>
            </div>
          </div>
          <div className="mt-4 text-center text-sm">
            Already have an account?{" "}
            <Link href="/auth/login" className="underline underline-offset-4">
              Login
            </Link>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
