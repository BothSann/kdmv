"use client";

import { ChevronLeft, Trash } from "lucide-react";
import Link from "next/link";
import { Button } from "../ui/button";

import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";

import { toast } from "sonner";
import {
  createNewCollectionAction,
  updateCollectionAction,
} from "@/server/actions/collection-action";
import { useRouter } from "next/navigation";
import { useProductTableStore } from "@/store/useTableSelectionStore";

export default function CollectionCreateEditForm({
  children,
  existingCollection = null,
}) {
  const isEditMode = !!existingCollection;

  const [name, setName] = useState(existingCollection?.name || "");
  const [description, setDescription] = useState(
    existingCollection?.description || ""
  );
  const [bannerFile, setBannerFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(
    existingCollection?.banner_image_url || null
  );
  const [isActive, setIsActive] = useState(
    existingCollection?.is_active ?? true
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const { getSelectedItems, clearSelection } = useProductTableStore();

  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];

    if (!file) {
      setBannerFile(null);
      setPreviewUrl(null);
      return;
    }

    setBannerFile(file);

    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
  };

  const handleRemoveImage = () => {
    setPreviewUrl(null);
    setBannerFile(null);

    // Reset the file input fields
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleSubmit = async (e) => {
    setIsSubmitting(true);
    e.preventDefault();

    const selectedProductIds = getSelectedItems();

    const actionToUse = isEditMode
      ? updateCollectionAction
      : createNewCollectionAction;

    const loadingMessage = isEditMode
      ? "Updating collection..."
      : "Creating collection...";

    const toastId = toast.loading(loadingMessage);

    const formData = new FormData(e.target);
    const collectionData = {
      ...(isEditMode && { id: existingCollection.id }),
      ...(isEditMode && {
        existing_banner_image_url: existingCollection.banner_image_url,
      }),
      name: formData.get("name"),
      description: formData.get("description"),
      banner_file: bannerFile,
      is_active: isActive,
      selected_product_ids: selectedProductIds,
    };

    try {
      const { success, error, message } = await actionToUse(collectionData);

      if (error) {
        toast.error(error, { id: toastId });
        return;
      }

      if (success) {
        toast.success(message, { id: toastId });

        if (isEditMode) {
          router.push(`/admin/collections/${existingCollection.id}`);
        } else {
          router.push("/admin/collections");
        }
      }
    } catch (error) {
      toast.error(error.message, { id: toastId });
    } finally {
      setIsSubmitting(false);
      clearSelection();
    }
  };

  return (
    <form className="mt-10" onSubmit={handleSubmit}>
      <div className="max-w-7xl mx-auto space-y-10">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" asChild disabled={isSubmitting}>
              <Link href="/admin/collections">
                <ChevronLeft />
              </Link>
            </Button>

            <h1 className="text-4xl font-bold">
              {isEditMode
                ? `Editing ${existingCollection.name}`
                : "Create Collection"}
            </h1>
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="outline" asChild disabled={isSubmitting}>
              <Link href="/admin/collections">Cancel</Link>
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? isEditMode
                  ? "Updating..."
                  : "Creating..."
                : isEditMode
                ? "Update Collection"
                : "Create Collection"}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_1fr] gap-6 lg:items-start">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Collection Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-8">
                  <div className="space-y-3">
                    <Label>Collection Name</Label>
                    <Input
                      type="text"
                      name="name"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      disabled={isSubmitting}
                    />
                  </div>

                  <div className="space-y-3">
                    <Label>Collection Description</Label>
                    <Textarea
                      name="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      disabled={isSubmitting}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Collection Images (Optional)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-8">
                  <div className="space-y-3">
                    <Label>Upload Collection Banner Image</Label>
                    <Input
                      type="file"
                      accept="image/*"
                      name="banner_image_url"
                      className="text-muted-foreground"
                      onChange={handleFileChange}
                      ref={fileInputRef}
                      disabled={isSubmitting}
                    />
                    {previewUrl && (
                      <div className="flex items-end justify-between">
                        <div className="relative w-24 h-24 aspect-square border border-border">
                          <Image
                            src={previewUrl}
                            alt="Collection Banner Image Preview"
                            fill
                            quality={80}
                            sizes="100vw"
                            className="object-cover object-center"
                          />
                        </div>
                        <div>
                          <Button
                            variant="destructive"
                            onClick={handleRemoveImage}
                            size="icon"
                            disabled={isSubmitting}
                          >
                            <Trash />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="is_active"
                      name="is_active"
                      checked={isActive}
                      onCheckedChange={setIsActive}
                    />
                    <Label htmlFor="is_active">Active Collection</Label>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Collection Products (Optional)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Label>Add Existing Products</Label>
                {/* children is the CollectionProductSelector component */}
                <div className="max-h-96 overflow-y-auto">{children}</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  );
}
