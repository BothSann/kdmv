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

import useAuthStore from "@/store/useAuthStore";

import { useRef, useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import { updateCurrentAdminProfileAction } from "@/lib/actions";
import { Trash, User } from "lucide-react";
import { sanitizeName } from "@/lib/utils";

export default function AdminUpdateProfileForm() {
  const { profile, setProfile } = useAuthStore();
  const [first_name, setFirst_name] = useState(profile?.first_name);
  const [last_name, setLast_name] = useState(profile?.last_name);
  const [gender, setGender] = useState(profile?.gender);
  const [country, setCountry] = useState("Cambodia");
  const [city_province, setCity_province] = useState(profile?.city_province);
  const [telephone, setTelephone] = useState(profile?.telephone);
  const [avatarFile, setAvatarFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isPending, setIsPending] = useState(false);
  const fullName = `${profile?.first_name} ${profile?.last_name}`;

  const fileInputRef = useRef(null);

  // We'll manage pending state manually for now
  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsPending(true);

    const formData = new FormData(event.target);
    const updateAdminProfileData = {
      first_name: formData.get("first_name"),
      last_name: formData.get("last_name"),
      gender: formData.get("gender"),
      telephone: formData.get("telephone"),
      country: formData.get("country"),
      city_province: formData.get("city_province"),
      avatar_file: avatarFile,
    };

    const toastId = toast.loading("Updating profile...");
    try {
      const { success, error, message, updatedProfile } =
        await updateCurrentAdminProfileAction(updateAdminProfileData);

      if (error) {
        toast.error(error, { id: toastId });
      }

      if (success && updatedProfile) {
        setProfile(updatedProfile);
        event.target.reset();
        toast.success(message, { id: toastId });
      }
    } catch (error) {
      toast.error(error.message, { id: toastId });
    } finally {
      setIsPending(false);
    }
  };

  const handleNameBlur = (setter) => (event) => {
    const cleaned = sanitizeName(event.target.value);
    setter(cleaned);
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];

    if (!file) {
      setAvatarFile(null);
      setPreviewUrl(null);
      return;
    }

    setAvatarFile(file);

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

  return (
    <form onSubmit={handleSubmit} className="w-3/4 mt-10">
      <div className="grid grid-cols-2 gap-6">
        {/* Avatar Section */}
        <div className="grid col-span-2 gap-3 mb-6">
          <div className="flex items-center gap-6">
            <div className="relative w-20 h-20 aspect-square">
              {previewUrl ? (
                <Image
                  src={previewUrl}
                  alt="User Avatar Preview"
                  fill
                  quality={80}
                  sizes="100vw"
                  className="object-cover object-center rounded-full"
                />
              ) : profile?.avatar_url ? (
                <Image
                  src={profile.avatar_url}
                  alt="User Avatar"
                  fill
                  quality={80}
                  sizes="100vw"
                  className="object-cover object-center rounded-full"
                />
              ) : (
                <div className="w-full h-full bg-secondary rounded-full flex items-center justify-center">
                  <User className="w-3/4 h-3/4 text-ring" />
                </div>
              )}
            </div>

            <div className="flex flex-col items-start gap-2">
              <span className="font-medium text-lg">{fullName}</span>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  onClick={triggerFileInput}
                  disabled={isPending}
                >
                  {profile?.avatar_url ? "Change Avatar" : "Upload Avatar"}
                </Button>

                {previewUrl && (
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={() => setPreviewUrl(null)}
                    disabled={isPending}
                  >
                    <Trash className="w-4 h-4" />
                  </Button>
                )}
              </div>
              <Input
                ref={fileInputRef}
                type="file"
                className="hidden"
                name="avatar_url"
                onChange={handleFileChange}
                accept="image/*"
                disabled={isPending}
              />
            </div>
          </div>
        </div>

        {/* Information Section */}
        <div className="space-y-4">
          <Label htmlFor="first_name">First Name</Label>
          <Input
            type="text"
            name="first_name"
            value={first_name}
            onChange={(e) => setFirst_name(e.target.value)}
            onBlur={handleNameBlur(setFirst_name)}
            disabled={isPending}
            required
          />
        </div>

        <div className="space-y-4">
          <Label htmlFor="last_name">Last Name</Label>
          <Input
            type="text"
            name="last_name"
            value={last_name}
            onChange={(e) => setLast_name(e.target.value)}
            onBlur={handleNameBlur(setLast_name)}
            disabled={isPending}
            required
          />
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
            <div className="space-y-4">
              <Label htmlFor="gender">Gender</Label>
              <Select
                name="gender"
                value={gender}
                onValueChange={setGender}
                disabled={isPending}
              >
                <SelectTrigger className="w-full" disabled={isPending}>
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
                placeholder="1234567890"
                value={telephone}
                onChange={(e) => setTelephone(e.target.value)}
                disabled={isPending}
              />
            </div>
          </div>
        </div>

        <div className="grid col-span-2 gap-3">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
              <Label htmlFor="country">Country</Label>
              <Select
                name="country"
                value={country}
                onValueChange={setCountry}
                disabled={isPending}
              >
                <SelectTrigger className="w-full" disabled={isPending}>
                  <SelectValue placeholder="Select a country" />
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
                value={city_province}
                onValueChange={setCity_province}
                disabled={isPending}
              >
                <SelectTrigger className="w-full" disabled={isPending}>
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
        </div>

        <div className="grid col-span-2 gap-3">
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              type="button"
              asChild
              disabled={isPending}
            >
              <Link href="/admin/account/profile">Cancel</Link>
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Updating..." : "Update Profile"}
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
}
