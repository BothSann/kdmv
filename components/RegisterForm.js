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
import { registerUserAction } from "@/server/actions/auth-action";
import { useState } from "react";

import Logo from "@/components/Logo";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { registerSchema } from "@/lib/validations/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { cn } from "@/lib/utils";
import FormError from "./FormError";
import { CAMBODIA_PROVINCES, COUNTRIES } from "@/lib/constants";
import { ScrollArea } from "./ui/scroll-area";

export default function RegisterForm() {
  const [showPassword, setShowPassword] = useState(false);

  const {
    register, // Register input fields
    handleSubmit, // Handle form submission
    control, // For complex components (Select)
    formState: { errors, isSubmitting }, // Access errors and submit state
    reset, // Reset form after success
  } = useForm({
    mode: "onBlur",
    resolver: zodResolver(registerSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      password: "",
      gender: "",
      telephone: "",
      country: "Cambodia",
      city_province: "",
    },
  });

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const onSubmit = async (data) => {
    const toastId = toast.loading("Registering...");

    try {
      const { success, error, message } = await registerUserAction(data);

      if (error) {
        toast.error(error, { id: toastId });
      }
      if (success) {
        toast.success(message, { id: toastId });
        reset();
      }
    } catch (error) {
      toast.error(error.message, { id: toastId });
    }
  };

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
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="flex flex-col gap-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2.5">
                <Label htmlFor="first_name">First Name</Label>
                <Input
                  {...register("first_name")}
                  id="first_name"
                  type="text"
                  placeholder="KDMV"
                  disabled={isSubmitting}
                  className={cn(
                    "w-full",
                    errors.first_name && "border-destructive"
                  )}
                />
                {errors.first_name && (
                  <FormError message={errors.first_name.message} />
                )}
              </div>
              <div className="space-y-2.5">
                <Label htmlFor="last_name">Last Name</Label>
                <Input
                  {...register("last_name")}
                  id="last_name"
                  type="text"
                  placeholder="Digital"
                  disabled={isSubmitting}
                  className={cn(
                    "w-full",
                    errors.last_name && "border-destructive"
                  )}
                />
                {errors.last_name && (
                  <FormError message={errors.last_name.message} />
                )}
              </div>
            </div>

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
            <div className="space-y-2.5 relative">
              <Label htmlFor="password">Password</Label>
              <Input
                {...register("password")}
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                disabled={isSubmitting}
                className={cn(
                  "w-full",
                  errors.password && "border-destructive"
                )}
              />
              {errors.password && (
                <FormError message={errors.password.message} />
              )}
              {showPassword ? (
                <Eye
                  size={20}
                  className={cn(
                    "absolute right-3 top-7.5 text-muted-foreground cursor-pointer",
                    isSubmitting && "opacity-50 cursor-not-allowed"
                  )}
                  onClick={togglePasswordVisibility}
                />
              ) : (
                <EyeOff
                  size={20}
                  className={cn(
                    "absolute right-3 top-7.5 text-muted-foreground cursor-pointer",
                    isSubmitting && "opacity-50 cursor-not-allowed"
                  )}
                  onClick={togglePasswordVisibility}
                />
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2.5">
                <Label htmlFor="gender">Gender</Label>
                <Controller
                  name="gender"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={isSubmitting}
                    >
                      <SelectTrigger
                        className={cn(
                          "w-full",
                          errors.gender && "border-destructive"
                        )}
                      >
                        <SelectValue placeholder="Select a gender" />
                      </SelectTrigger>
                      <SelectContent position="popper">
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="prefer not to say">
                          Prefer not to say
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.gender && <FormError message={errors.gender.message} />}
              </div>
              <div className="space-y-2.5">
                <Label htmlFor="telephone">Telephone</Label>
                <Input
                  {...register("telephone")}
                  id="telephone"
                  type="tel"
                  placeholder="0123456789"
                  disabled={isSubmitting}
                  className={cn(
                    "w-full",
                    errors.telephone && "border-destructive"
                  )}
                />
                {errors.telephone && (
                  <FormError message={errors.telephone.message} />
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2.5">
                <Label htmlFor="country">Country</Label>
                <Controller
                  name="country"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={isSubmitting}
                    >
                      <SelectTrigger
                        className={cn(
                          "w-full",
                          errors.country && "border-destructive"
                        )}
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent position="popper">
                        {COUNTRIES.map((country) => (
                          <SelectItem key={country.code} value={country.value}>
                            {country.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.country && (
                  <FormError message={errors.country.message} />
                )}
              </div>

              <div className="space-y-2.5">
                <Label htmlFor="city_province">City/Province</Label>
                <Controller
                  name="city_province"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={isSubmitting}
                    >
                      <SelectTrigger
                        className={cn(
                          "w-full",
                          errors.city_province && "border-destructive"
                        )}
                      >
                        <SelectValue placeholder="Select a city/province" />
                      </SelectTrigger>
                      <SelectContent position="popper">
                        <ScrollArea className="h-48">
                          {CAMBODIA_PROVINCES.map((province) => (
                            <SelectItem
                              key={province.value}
                              value={province.value}
                            >
                              {province.label}
                            </SelectItem>
                          ))}
                        </ScrollArea>
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.city_province && (
                  <FormError message={errors.city_province.message} />
                )}
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
          <div className="mt-4 text-center text-sm">
            Login as a demo account?{" "}
            <Link href="/auth/login" className="underline underline-offset-4">
              Demo Account
            </Link>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
