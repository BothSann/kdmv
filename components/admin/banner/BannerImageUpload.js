"use client";

import { Upload, X, Image as ImageIcon } from "lucide-react";
import Image from "next/image";
import { useRef, useState } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * BannerImageUpload Component
 * Handles image upload with drag-and-drop, preview, and validation
 *
 * @param {Object} props
 * @param {File|null} props.imageFile - Current image file
 * @param {string|null} props.previewUrl - Preview URL (from existing banner or new file)
 * @param {Function} props.onFileChange - Callback when file changes
 * @param {Function} props.onRemove - Callback to remove image
 * @param {boolean} props.required - Whether image is required
 * @param {string} props.error - Error message to display
 */
export default function BannerImageUpload({
  imageFile,
  previewUrl,
  onFileChange,
  onRemove,
  required = false,
  error = null,
}) {
  const fileInputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileSelect = (file) => {
    if (!file) return;

    // Validate file type
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      alert("Please upload a valid image file (JPEG, PNG, or WebP)");
      return;
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      alert("Image size must be less than 5MB");
      return;
    }

    onFileChange(file);
  };

  const handleFileInputChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleRemoveClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    onRemove();
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="banner-image">
        Banner Image {required && <span className="text-destructive">*</span>}
      </Label>

      {/* Upload Area */}
      {!previewUrl ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={cn(
            "relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
            isDragging
              ? "border-primary bg-primary/5"
              : "border-border hover:border-primary/50 hover:bg-accent/50",
            error && "border-destructive"
          )}
        >
          <div className="flex flex-col items-center gap-4">
            <div className="p-4 rounded-full bg-accent">
              <Upload className="h-8 w-8 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm font-medium">
                Click to upload or drag and drop
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Recommended: 1920×800px • Max 5MB
              </p>
              <p className="text-xs text-muted-foreground">
                Supports: JPEG, PNG, WebP
              </p>
            </div>
          </div>
        </div>
      ) : (
        /* Preview Area */
        <div className="relative border rounded-lg overflow-hidden bg-accent/20">
          <div className="relative aspect-[16/6] w-full">
            <Image
              src={previewUrl}
              alt="Banner preview"
              fill
              className="object-cover"
            />
          </div>

          {/* Remove Button */}
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2 h-8 w-8"
            onClick={handleRemoveClick}
          >
            <X className="h-4 w-4" />
          </Button>

          {/* Image Info Overlay */}
          <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white p-3 text-xs">
            <div className="flex items-center gap-2">
              <ImageIcon className="h-4 w-4" />
              <span className="font-medium">
                {imageFile?.name || "Existing banner image"}
              </span>
              {imageFile && (
                <span className="text-white/80">
                  ({(imageFile.size / 1024 / 1024).toFixed(2)} MB)
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        id="banner-image"
        name="image"
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        onChange={handleFileInputChange}
        className="hidden"
      />

      {/* Error Message */}
      {error && (
        <p className="text-sm text-destructive font-medium">{error}</p>
      )}

      {/* Helper Text */}
      {!error && previewUrl && (
        <p className="text-xs text-muted-foreground">
          Click the × button to change the image
        </p>
      )}
    </div>
  );
}
