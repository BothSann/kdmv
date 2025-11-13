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
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import BannerImageUpload from "./BannerImageUpload";
import {
  createBannerAction,
  updateBannerAction,
} from "@/server/actions/banner-action";

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

  // Form state
  const [title, setTitle] = useState(existingBanner?.title || "");
  const [subtitle, setSubtitle] = useState(existingBanner?.subtitle || "");
  const [linkUrl, setLinkUrl] = useState(existingBanner?.link_url || "");
  const [linkText, setLinkText] = useState(
    existingBanner?.link_text || "Shop Now"
  );
  const [displayOrder, setDisplayOrder] = useState(
    existingBanner?.display_order ?? 0
  );
  const [isActive, setIsActive] = useState(existingBanner?.is_active ?? true);

  // Image state
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(
    existingBanner?.image_url || null
  );

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  // Handle image change
  const handleImageChange = (file) => {
    setImageFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    setErrors((prev) => ({ ...prev, image: null }));
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

  // Form validation
  const validateForm = () => {
    const newErrors = {};

    if (!title.trim()) {
      newErrors.title = "Title is required";
    }

    if (!previewUrl && !isEditMode) {
      newErrors.image = "Banner image is required";
    }

    if (linkUrl && !linkUrl.startsWith("/") && !linkUrl.startsWith("http")) {
      newErrors.linkUrl =
        "Link must start with / (internal) or http:// (external)";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate
    if (!validateForm()) {
      toast.error("Please fix the form errors");
      return;
    }

    setIsSubmitting(true);

    const actionToUse = isEditMode ? updateBannerAction : createBannerAction;
    const loadingMessage = isEditMode
      ? "Updating banner..."
      : "Creating banner...";
    const toastId = toast.loading(loadingMessage);

    try {
      // Build FormData
      const formData = new FormData();

      formData.append("title", title.trim());
      formData.append("subtitle", subtitle.trim());
      formData.append("link_url", linkUrl.trim());
      formData.append("link_text", linkText.trim());
      formData.append("display_order", displayOrder.toString());
      formData.append("is_active", isActive.toString());

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
    } finally {
      setIsSubmitting(false);
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
      <form onSubmit={handleSubmit}>
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
              error={errors.image}
            />

            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">
                Title <span className="text-destructive">*</span>
              </Label>
              <Input
                id="title"
                name="title"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  setErrors((prev) => ({ ...prev, title: null }));
                }}
                placeholder="e.g., Childhood Nostalgia"
                className={errors.title && "border-destructive"}
              />
              {errors.title && (
                <p className="text-sm text-destructive">{errors.title}</p>
              )}
            </div>

            {/* Subtitle */}
            <div className="space-y-2">
              <Label htmlFor="subtitle">Subtitle (Optional)</Label>
              <Input
                id="subtitle"
                name="subtitle"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                placeholder="e.g., Hoodies back for good!"
              />
              <p className="text-xs text-muted-foreground">
                Supporting text displayed below the title
              </p>
            </div>

            {/* Link URL */}
            <div className="space-y-2">
              <Label htmlFor="link_url">Link URL (Optional)</Label>
              <Input
                id="link_url"
                name="link_url"
                value={linkUrl}
                onChange={(e) => {
                  setLinkUrl(e.target.value);
                  setErrors((prev) => ({ ...prev, linkUrl: null }));
                }}
                placeholder="/collections/new-products or https://..."
                className={errors.linkUrl && "border-destructive"}
              />
              {errors.linkUrl && (
                <p className="text-sm text-destructive">{errors.linkUrl}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Where the button should link to. Use /path for internal pages
                or full URL for external links
              </p>
            </div>

            {/* Link Text */}
            <div className="space-y-2">
              <Label htmlFor="link_text">Button Text</Label>
              <Input
                id="link_text"
                name="link_text"
                value={linkText}
                onChange={(e) => setLinkText(e.target.value)}
                placeholder="Shop Now"
              />
              <p className="text-xs text-muted-foreground">
                Text displayed on the call-to-action button
              </p>
            </div>

            {/* Display Order */}
            <div className="space-y-2">
              <Label htmlFor="display_order">Display Order</Label>
              <Input
                id="display_order"
                name="display_order"
                type="number"
                min="0"
                value={displayOrder}
                onChange={(e) => setDisplayOrder(parseInt(e.target.value) || 0)}
                placeholder="0"
              />
              <p className="text-xs text-muted-foreground">
                Lower numbers appear first in the carousel
              </p>
            </div>

            {/* Is Active */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="is_active"
                name="is_active"
                checked={isActive}
                onCheckedChange={setIsActive}
              />
              <Label
                htmlFor="is_active"
                className="text-sm font-normal cursor-pointer"
              >
                Active (Show on homepage)
              </Label>
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
