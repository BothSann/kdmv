"use client";

import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Upload, Trash } from "lucide-react";
import Image from "next/image";

export default function ProductImages({
  bannerPreviewUrl: initialBannerPreviewUrl, // only for existing banner in edit mode
  bannerFile: initialBannerFile, // not used directly, but can be kept if needed for reset logic
  existingImages = [],
  isEditing = false,
  onBannerFileChange,
  onAdditionalImagesChange,
  onRemoveBanner,
  onRemoveAdditionalImage,
  onClearAllAdditionalImages,
  onRemoveExistingImage,
}) {
  const fileInputRef = useRef(null);
  const additionalImagesInputRef = useRef(null);

  const [bannerPreviewUrl, setBannerPreviewUrl] = useState(
    initialBannerPreviewUrl
  );
  const [additionalImages, setAdditionalImages] = useState([]);

  // Sync previewUrl if parent changes it (e.g., during edit load)
  useEffect(() => {
    setBannerPreviewUrl(initialBannerPreviewUrl);
  }, [initialBannerPreviewUrl]);

  // Cleanup object URLs
  useEffect(() => {
    return () => {
      if (bannerPreviewUrl && bannerPreviewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(bannerPreviewUrl);
      }
      additionalImages.forEach((img) => {
        if (img.preview && img.preview.startsWith("blob:")) {
          URL.revokeObjectURL(img.preview);
        }
      });
    };
  }, [bannerPreviewUrl, additionalImages]);

  // Handle banner file change
  const handleBannerFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) {
      onBannerFileChange(null);
      setBannerPreviewUrl(null);
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setBannerPreviewUrl(objectUrl);
    onBannerFileChange(file);
  };

  // Handle additional images
  const handleAdditionalImagesChangeInternal = (e) => {
    const files = Array.from(e.target.files);

    // Create preview URLs and store files
    const newImages = files.map((file, index) => ({
      id: Date.now() + index, // temporary ID
      file,
      preview: URL.createObjectURL(file),
      display_order: additionalImages.length + index,
    }));

    setAdditionalImages((prev) => [...prev, ...newImages]);
    onAdditionalImagesChange(files);
  };

  // Remove banner
  const handleRemoveBanner = () => {
    setBannerPreviewUrl(null);
    onRemoveBanner();
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Remove one additional image
  const handleRemoveAdditionalImage = (imageId) => {
    const imageToRemove = additionalImages.find((img) => img.id === imageId);
    const updatedImages = additionalImages.filter((img) => img.id !== imageId);

    setAdditionalImages(updatedImages);
    onRemoveAdditionalImage(imageToRemove?.file);

    // Reset file input if no images remain
    if (updatedImages.length === 0 && additionalImagesInputRef.current) {
      additionalImagesInputRef.current.value = "";
    }
  };

  // Clear all additional images
  const handleClearAll = () => {
    setAdditionalImages([]);
    onClearAllAdditionalImages();

    if (additionalImagesInputRef.current) {
      additionalImagesInputRef.current.value = "";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Product Images</CardTitle>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Banner Image URL */}
        <div className="border-2 border-dashed p-8 text-center">
          <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h4 className="text-lg font-semibold mb-3">
            Upload your banner image here
          </h4>
          <p className="text-sm text-muted-foreground mb-4">
            PNG or JPG (max. 5MB)
          </p>
          <Input
            type="file"
            accept="image/*"
            name="banner_image_url"
            className="text-muted-foreground"
            onChange={handleBannerFileChange}
            ref={fileInputRef}
          />

          {bannerPreviewUrl && (
            <div className="flex items-end justify-between mt-4">
              <div className="relative w-26 h-26 aspect-square border border-border">
                <Image
                  src={bannerPreviewUrl}
                  alt="Product Banner Image Preview"
                  fill
                  sizes="104px"
                  quality={50}
                  loading="lazy"
                  className="object-cover object-center"
                />
              </div>
              {!isEditing && (
                <div>
                  <Button
                    variant="destructive"
                    onClick={handleRemoveBanner}
                    size="icon"
                  >
                    <Trash />
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Additional Images with Preview */}
        <div className="space-y-4">
          <Label>Additional Images for Slider</Label>

          {/* Upload Input */}
          <Input
            className={`text-muted-foreground ${
              additionalImages.length > 0 ? "hidden" : ""
            }`}
            type="file"
            multiple
            accept="image/*"
            onChange={handleAdditionalImagesChangeInternal}
            ref={additionalImagesInputRef}
          />

          {/* Image Previews */}
          {additionalImages.length > 0 && (
            <>
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground font-medium">
                  {additionalImages.length} file
                  {additionalImages.length !== 1 ? "s" : ""} selected
                </p>
                <Button
                  variant="destructive"
                  onClick={handleClearAll}
                  size="sm"
                >
                  Clear All
                </Button>
              </div>
              <div className="grid grid-cols-6 gap-4">
                {additionalImages.map((image, index) => (
                  <div key={image.id} className="relative group">
                    <div className="relative aspect-square border border-border">
                      <Image
                        src={image.preview}
                        alt={`Additional image ${index + 1}`}
                        fill
                        sizes="(max-width: 640px) 33vw, (max-width: 1024px) 16vw, 12vw"
                        quality={50}
                        className="object-cover object-center"
                      />
                    </div>

                    {/* Controls */}
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        type="button"
                        size="icon"
                        variant="destructive"
                        onClick={() => handleRemoveAdditionalImage(image.id)}
                      >
                        <Trash />
                      </Button>
                    </div>

                    {/* Order indicator */}
                    <div className="absolute bottom-2 left-2 bg-background/80 px-3 py-1.5 text-xs">
                      {index + 1}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Existing Images (Edit Mode Only) */}
        {isEditing && existingImages.length > 0 && (
          <div className="space-y-4">
            <Label>Current Gallery Images</Label>
            <div className="grid grid-cols-6 gap-4">
              {existingImages.map((image, index) => (
                <div key={image.id} className="relative group">
                  <div className="relative aspect-square border border-border">
                    <Image
                      src={image.image_url}
                      alt={`Existing image ${index + 1}`}
                      fill
                      sizes="(max-width: 640px) 33vw, (max-width: 1024px) 16vw, 12vw"
                      quality={50}
                      className="object-cover object-center"
                    />
                  </div>

                  {/* Delete existing image button */}
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      type="button"
                      size="icon"
                      variant="destructive"
                      onClick={() => onRemoveExistingImage(image.id)}
                    >
                      <Trash />
                    </Button>
                  </div>

                  {/* Existing indicator */}
                  <div className="absolute bottom-2 left-2 bg-chart-3/80 px-2 py-1 text-xs text-background">
                    Current
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
