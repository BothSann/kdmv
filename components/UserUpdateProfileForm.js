"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import useAuthStore from "@/store/useAuthStore";
import { useRef, useState, useEffect } from "react";
import { toast } from "sonner";
import { updateCurrentUserProfileAction } from "@/server/actions/user-action";
import { CAMBODIA_PROVINCES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import FormError from "@/components/FormError";
import Image from "next/image";
import { User, Trash } from "lucide-react";
import Spinner from "./Spinner";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { profileUpdateSchema } from "@/lib/validations/profile";

export default function UserUpdateProfileForm() {
  const { profile, setProfile } = useAuthStore();
  const router = useRouter();
  const fileInputRef = useRef(null);

  // Preview state for avatar (kept separate from form)
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize React Hook Form with Zod validation
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
    reset,
  } = useForm({
    resolver: zodResolver(profileUpdateSchema),
    mode: "onBlur", // Validate on blur for better UX
    defaultValues: {
      first_name: "",
      last_name: "",
      gender: "",
      telephone: "",
      country: "Cambodia",
      city_province: "",
      avatar_file: undefined,
    },
  });

  // Sync form with profile data when it loads
  useEffect(() => {
    setIsLoading(true);
    if (profile) {
      reset({
        first_name: profile.first_name || "",
        last_name: profile.last_name || "",
        gender: profile.gender || "",
        telephone: profile.telephone || "",
        country: "Cambodia",
        city_province: profile.city_province || "",
        avatar_file: undefined,
      });
    }
    setIsLoading(false);
  }, [profile, reset]);

  // Compute fullName safely
  const fullName =
    profile?.first_name && profile?.last_name
      ? `${profile.first_name} ${profile.last_name}`
      : "Loading...";

  // Form submission handler - receives validated data from React Hook Form
  const onSubmit = async (data) => {
    // data is already validated by Zod at this point!
    const toastId = toast.loading("Updating profile...");

    try {
      const { success, error, message, updatedProfile } =
        await updateCurrentUserProfileAction(data);

      if (error) {
        toast.error(error, { id: toastId });
        return;
      }

      if (success && updatedProfile) {
        setProfile(updatedProfile);
        toast.success(message, { id: toastId });
        // Clear preview URL after successful update
        setPreviewUrl(null);
      }
    } catch (error) {
      toast.error(error.message, { id: toastId });
    }
  };

  // Handle file change for preview (will be connected to Controller)
  const handleFileChange = (file, onChange) => {
    if (!file) {
      setPreviewUrl(null);
      onChange(undefined);
      return;
    }

    // Update form field value
    onChange(file);

    // Create preview URL for the selected file
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
  };

  // Cleanup preview URL to prevent memory leaks
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  if (isLoading || !profile) {
    return (
      <Spinner
        className="min-h-[calc(100vh-16rem)]"
        message="Loading profile..."
      />
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="w-full mt-10">
      <div className="grid grid-cols-2 gap-6">
        {/* Avatar Section */}
        <div className="grid col-span-2 gap-3 mb-6">
          <div className="flex items-center gap-4">
            <div className="relative w-20 h-20 aspect-square">
              {previewUrl ? (
                <Image
                  src={previewUrl}
                  alt="User Avatar Preview"
                  fill
                  loading="lazy"
                  quality={50}
                  sizes="80px"
                  className="object-cover object-center rounded-full"
                />
              ) : profile?.avatar_url ? (
                <Image
                  src={profile.avatar_url}
                  alt="User Avatar"
                  fill
                  loading="lazy"
                  quality={50}
                  sizes="80px"
                  className="object-cover object-center rounded-full"
                />
              ) : (
                <div className="w-full h-full bg-secondary rounded-full flex items-center justify-center">
                  <User className="w-3/4 h-3/4 text-ring" />
                </div>
              )}
            </div>

            <div className="flex flex-col items-start gap-2">
              <span className="font-medium text-base">{fullName}</span>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  onClick={triggerFileInput}
                  disabled={isSubmitting}
                  size="sm"
                  className="text-xs"
                >
                  {profile?.avatar_url ? "Change Avatar" : "Upload Avatar"}
                </Button>

                {previewUrl && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setPreviewUrl(null)}
                    disabled={isSubmitting}
                    size="sm"
                  >
                    <Trash />
                  </Button>
                )}
              </div>
              <Controller
                name="avatar_file"
                control={control}
                render={({ field: { onChange, value, ...field } }) => (
                  <Input
                    {...field}
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      handleFileChange(file, onChange);
                    }}
                    accept="image/*"
                    disabled={isSubmitting}
                  />
                )}
              />
              {errors.avatar_file && (
                <FormError message={errors.avatar_file.message} />
              )}
            </div>
          </div>
        </div>

        {/* Information Section */}
        <div className="space-y-2.5">
          <Label htmlFor="first_name">
            First Name<span className="text-destructive">*</span>
          </Label>
          <Input
            {...register("first_name")}
            id="first_name"
            type="text"
            placeholder="Your first name"
            disabled={isSubmitting}
            className={cn("w-full", errors.first_name && "border-destructive")}
          />
          {errors.first_name && (
            <FormError message={errors.first_name.message} />
          )}
        </div>

        <div className="space-y-2.5">
          <Label htmlFor="last_name">
            Last Name<span className="text-destructive">*</span>
          </Label>
          <Input
            {...register("last_name")}
            id="last_name"
            type="text"
            placeholder="Your last name"
            disabled={isSubmitting}
            className={cn("w-full", errors.last_name && "border-destructive")}
          />
          {errors.last_name && <FormError message={errors.last_name.message} />}
        </div>

        <div className="grid col-span-2 space-y-4">
          <Label htmlFor="email">Email</Label>
          <Input
            type="email"
            name="email"
            value={profile?.email}
            disabled
            required
          />
        </div>

        <div className="grid col-span-2 gap-3">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2.5">
              <Label htmlFor="gender">
                Gender<span className="text-destructive">*</span>
              </Label>
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
                      disabled={isSubmitting}
                    >
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
                )}
              />
              {errors.gender && <FormError message={errors.gender.message} />}
            </div>
            <div className="space-y-2.5">
              <Label htmlFor="telephone">
                Telephone<span className="text-destructive">*</span>
              </Label>
              <Input
                {...register("telephone")}
                id="telephone"
                type="tel"
                placeholder="012345678"
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
        </div>

        <div className="grid col-span-2 gap-3">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2.5">
              <Label htmlFor="country">
                Country<span className="text-destructive">*</span>
              </Label>
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
                      disabled={isSubmitting}
                    >
                      <SelectValue placeholder="Select a country" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Cambodia">Cambodia</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.country && <FormError message={errors.country.message} />}
            </div>
            <div className="space-y-2.5">
              <Label htmlFor="city_province">
                City/Province<span className="text-destructive">*</span>
              </Label>
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
                      disabled={isSubmitting}
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
        </div>

        <div className="grid col-span-2 gap-3">
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              type="button"
              disabled={isSubmitting}
              onClick={() => router.back()}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Updating..." : "Update Profile"}
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
}
