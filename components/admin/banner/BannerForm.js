"use client";

import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { bannerSchema } from "@/lib/validations/banner";
import { cn } from "@/lib/utils";

import BannerImageUpload from "./BannerImageUpload";
import {
  createBannerAction,
  updateBannerAction,
} from "@/server/actions/banner-action";
import FormError from "@/components/FormError";

/**
 * BannerForm Component
 * Handles both create and edit modes for hero banners
 *
 * @param {Object} props
 * @param {Object|null} props.existingBanner - Existing banner data for edit mode
 */
export default function BannerForm({ existingBanner = null }) {
  const isEditMode = !!existingBanner;
  const router = useRouter();

  // React Hook Form with Zod validation
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
    reset,
  } = useForm({
    resolver: zodResolver(bannerSchema),
    mode: "onBlur",
    defaultValues: {
      title: existingBanner?.title || "",
      subtitle: existingBanner?.subtitle || "",
      link_url: existingBanner?.link_url || "",
      link_text: existingBanner?.link_text || "Shop Now",
      display_order: existingBanner?.display_order?.toString() || "0",
      is_active: existingBanner?.is_active ?? true,
    },
  });

  // Image state (separate from Zod - File objects can't be validated by Zod)
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(
    existingBanner?.image_url || null
  );
  const [imageError, setImageError] = useState(null);

  // Handle image change
  const handleImageChange = (file) => {
    setImageFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    setImageError(null);
  };

  // Handle image remove
  const handleImageRemove = () => {
    setImageFile(null);
    setPreviewUrl(isEditMode ? existingBanner?.image_url : null);
  };

  // Cleanup preview URL on unmount
  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  // Handle form submission
  const onSubmit = async (data) => {
    // Validate image (separate from Zod - File objects can't be validated by Zod)
    if (!imageFile && !previewUrl) {
      setImageError("Banner image is required");
      toast.error("Please upload a banner image");
      return;
    }

    const actionToUse = isEditMode ? updateBannerAction : createBannerAction;
    const loadingMessage = isEditMode
      ? "Updating banner..."
      : "Creating banner...";
    const toastId = toast.loading(loadingMessage);

    try {
      // Build FormData
      const formData = new FormData();

      formData.append("title", data.title);
      formData.append("subtitle", data.subtitle);
      formData.append("link_url", data.link_url);
      formData.append("link_text", data.link_text);
      formData.append("display_order", data.display_order.toString());
      formData.append("is_active", data.is_active.toString());

      if (isEditMode) {
        formData.append("id", existingBanner.id);
        formData.append("existing_image_url", existingBanner.image_url);
      }

      if (imageFile) {
        formData.append("image", imageFile);
      }

      // Submit
      const result = await actionToUse(formData);

      if (result.error) {
        toast.error(result.error, { id: toastId });
        return;
      }

      toast.success(result.message, { id: toastId });
      router.push("/admin/banners");
      router.refresh();
    } catch (error) {
      console.error("Form submission error:", error);
      toast.error("An unexpected error occurred", { id: toastId });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/admin/banners">
            <ChevronLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">
            {isEditMode ? "Edit Banner" : "Create New Banner"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {isEditMode
              ? "Update banner details and image"
              : "Add a new hero banner to the homepage"}
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle>Banner Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Image Upload */}
            <BannerImageUpload
              imageFile={imageFile}
              previewUrl={previewUrl}
              onFileChange={handleImageChange}
              onRemove={handleImageRemove}
              required={!isEditMode}
              error={imageError}
            />

            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">
                Title <span className="text-destructive">*</span>
              </Label>
              <Input
                id="title"
                {...register("title")}
                placeholder="e.g., Childhood Nostalgia"
                disabled={isSubmitting}
                className={cn(errors.title && "border-destructive")}
              />
              {errors.title && <FormError message={errors.title.message} />}
            </div>

            {/* Subtitle */}
            <div className="space-y-2">
              <Label htmlFor="subtitle">Subtitle (Optional)</Label>
              <Input
                id="subtitle"
                {...register("subtitle")}
                placeholder="e.g., Hoodies back for good!"
                disabled={isSubmitting}
                className={cn(errors.subtitle && "border-destructive")}
              />
              {errors.subtitle && (
                <FormError message={errors.subtitle.message} />
              )}
              <p className="text-xs text-muted-foreground">
                Supporting text displayed below the title
              </p>
            </div>

            {/* Link URL */}
            <div className="space-y-2">
              <Label htmlFor="link_url">Link URL (Optional)</Label>
              <Input
                id="link_url"
                {...register("link_url")}
                placeholder="/collections/new-products or https://..."
                disabled={isSubmitting}
                className={cn(errors.link_url && "border-destructive")}
              />
              {errors.link_url && (
                <FormError message={errors.link_url.message} />
              )}
              <p className="text-xs text-muted-foreground">
                Where the button should link to. Use /path for internal pages or
                full URL for external links
              </p>
            </div>

            {/* Link Text */}
            <div className="space-y-2">
              <Label htmlFor="link_text">Button Text</Label>
              <Input
                id="link_text"
                {...register("link_text")}
                placeholder="Shop Now"
                disabled={isSubmitting}
                className={cn(errors.link_text && "border-destructive")}
              />
              {errors.link_text && (
                <FormError message={errors.link_text.message} />
              )}
              <p className="text-xs text-muted-foreground">
                Text displayed on the call-to-action button
              </p>
            </div>

            {/* Display Order */}
            <div className="space-y-2">
              <Label htmlFor="display_order">Display Order</Label>
              <Input
                id="display_order"
                type="number"
                min="0"
                {...register("display_order")}
                placeholder="0"
                disabled={isSubmitting}
                className={cn(errors.display_order && "border-destructive")}
              />
              {errors.display_order && (
                <FormError message={errors.display_order.message} />
              )}
              <p className="text-xs text-muted-foreground">
                Lower numbers appear first in the carousel
              </p>
            </div>

            {/* Is Active */}
            <div className="flex items-center space-x-2">
              <Controller
                name="is_active"
                control={control}
                render={({ field }) => (
                  <Checkbox
                    id="is_active"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={isSubmitting}
                  />
                )}
              />
              <Label
                htmlFor="is_active"
                className="text-sm font-normal cursor-pointer"
              >
                Active (Show on homepage)
              </Label>
              {errors.is_active && (
                <FormError message={errors.is_active.message} />
              )}
            </div>

            {/* Form Actions */}
            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="min-w-[120px]"
              >
                {isSubmitting
                  ? isEditMode
                    ? "Updating..."
                    : "Creating..."
                  : isEditMode
                  ? "Update Banner"
                  : "Create Banner"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/admin/banners")}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
