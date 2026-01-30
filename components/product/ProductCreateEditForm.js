"use client";

import { useState, useEffect } from "react";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  createNewProductAction,
  updateProductAction,
} from "@/server/actions/product-action";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Spinner from "../Spinner";
import { productWithVariantsSchema } from "@/lib/validations/product";
import FormError from "@/components/FormError";
import { cn } from "@/lib/utils";
import ProductDetail from "./ProductDetail";
import ProductPricing from "./ProductPricing";
import ProductTypeAndGender from "./ProductTypeAndGender";
import ProductCollection from "./ProductCollection";
import ProductVariantEditor from "./ProductVariantEditor";
import ProductImages from "./ProductImages";

export default function ProductCreateEditForm({
  productTypes,
  genders,
  colors,
  sizes,
  collections,
  existingProduct = null,
  isEditing = false,
}) {
  const router = useRouter();

  // React Hook Form setup with Zod validation
  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(productWithVariantsSchema),
    mode: "onBlur", // Validate when user leaves field
    defaultValues: {
      name: existingProduct?.name || "",
      description: existingProduct?.description || "",
      base_price: existingProduct?.base_price?.toString() || "",
      discount_percentage:
        existingProduct?.discount_percentage?.toString() || "",
      product_type_id: existingProduct?.product_type_id || "",
      gender_id: existingProduct?.gender_id || "",
      is_active: existingProduct?.is_active ?? true,
      collection_id: existingProduct?.collection_id || "",
      variants:
        existingProduct?.product_variants?.length > 0
          ? existingProduct.product_variants.map((variant) => ({
              id: variant.id,
              color_id: variant.colors?.id || "",
              size_id: variant.sizes?.id || "",
              quantity: variant.quantity || 0,
              sku: variant.sku || "",
            }))
          : [{ color_id: "", size_id: "", quantity: 0, sku: "" }],
    },
  });

  // useFieldArray for dynamic variants management
  const { fields, append, remove } = useFieldArray({
    control,
    name: "variants",
  });

  // Keep these for file uploads (not in schema)
  const [bannerFile, setBannerFile] = useState(null);
  const [imageFiles, setImageFiles] = useState([]);
  const [existingImages, setExistingImages] = useState(
    existingProduct?.product_images || []
  );

  // File upload error state
  const [bannerError, setBannerError] = useState(null);
  const [additionalImagesError, setAdditionalImagesError] = useState(null);

  // Keep these for UI state
  const [isInitialized, setIsInitialized] = useState(false);

  // Watch form values
  const productTypeId = watch("product_type_id");
  const genderId = watch("gender_id");
  const formName = watch("name");

  // Initialize form data and control loading state
  useEffect(() => {
    if (isEditing && existingProduct) {
      setIsInitialized(true);
    }

    if (!isEditing) {
      setIsInitialized(true);
    }
  }, [isEditing, existingProduct]);


  // Variant management functions
  const addVariant = () => {
    append({ color_id: "", size_id: "", quantity: 0, sku: "" });
  };

  const removeVariant = (index) => {
    if (fields.length > 1) {
      remove(index);
    }
  };

  const handleRemoveExistingImage = (imageId) => {
    setExistingImages(existingImages.filter((image) => image.id !== imageId));
  };

  const handleWheel = (e) => {
    e.target.blur();
  };

  // Form submission handler (validated by Zod)
  const onSubmit = async (data) => {
    // Reset file upload errors
    setBannerError(null);
    setAdditionalImagesError(null);

    // File upload validation (not in schema)
    let hasFileErrors = false;

    if (!isEditing && !bannerFile) {
      setBannerError("Banner image is required");
      hasFileErrors = true;
    }

    if (!isEditing && imageFiles.length === 0) {
      setAdditionalImagesError("At least one additional image is required");
      hasFileErrors = true;
    }

    if (hasFileErrors) {
      toast.warning("Please fix the file upload errors");
      return;
    }

    // Prepare product data with validated form data
    const productData = {
      ...(isEditing && { id: existingProduct.id }),
      ...(isEditing && {
        existing_banner_image_url: existingProduct.banner_image_url,
      }),
      ...(isEditing && {
        existing_image_ids: existingImages.map((image) => image.id),
      }),
      ...data, // Spread all validated data
      banner_file: bannerFile,
      image_files: imageFiles,
    };

    const actionToUse = isEditing
      ? updateProductAction
      : createNewProductAction;

    const loadingMessage = isEditing
      ? "Updating product..."
      : "Creating product...";

    const toastId = toast.loading(loadingMessage);

    try {
      const { success, error, message } = await actionToUse(productData);

      if (error) {
        toast.error(error, { id: toastId });
        return;
      }

      if (success) {
        toast.success(message, { id: toastId });

        // After editing: redirect to the specific product details page
        if (isEditing) router.push(`/admin/products/${existingProduct.id}`);
        // Otherwise (After creating): redirect to products list
        else router.push("/admin/products");
      }
    } catch (err) {
      toast.error(err.message, {
        id: toastId,
      });
    }
  };

  // Loading state - only show form when initialized
  if (!isInitialized) {
    return <Spinner message={isEditing ?? "Loading product data..."} />;
  }

  return (
    <form className="mt-10" onSubmit={handleSubmit(onSubmit)}>
      <div className="max-w-7xl mx-auto space-y-10">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" asChild>
              <Link href="/admin/products">
                <ChevronLeft />
              </Link>
            </Button>
            <h1 className="text-4xl font-bold">
              {isEditing ? `Editing ${formName}` : "Add Products"}
            </h1>
          </div>

          <div className="flex gap-3">
            <Button
              className="px-4 py-2"
              variant="outline"
              type="button"
              asChild
            >
              <Link href="/admin/products">Cancel</Link>
            </Button>
            <SubmitButton isEditing={isEditing} isSubmitting={isSubmitting} />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1.75fr_1fr] gap-6">
          {/* Left Column */}
          <div className="space-y-8">
            {/* Product Details */}
            <ProductDetail
              register={register}
              errors={errors}
              isSubmitting={isSubmitting}
            />

            {/* Product Images */}
            <ProductImages
              bannerPreviewUrl={
                isEditing ? existingProduct?.banner_image_url : null
              }
              bannerFile={bannerFile}
              existingImages={existingImages}
              isEditing={isEditing}
              onBannerFileChange={(file) => {
                setBannerFile(file);
                if (file) setBannerError(null); // Clear error when file is selected
              }}
              onAdditionalImagesChange={(files) => {
                setImageFiles((prev) => [...prev, ...files]);
                if (files.length > 0) setAdditionalImagesError(null); // Clear error when files are added
              }}
              onRemoveBanner={() => {
                setBannerFile(null);
              }}
              onRemoveAdditionalImage={(fileToRemove) => {
                setImageFiles((prev) =>
                  prev.filter((file) => file !== fileToRemove)
                );
              }}
              onClearAllAdditionalImages={() => {
                setImageFiles([]);
              }}
              onRemoveExistingImage={handleRemoveExistingImage}
              bannerError={bannerError}
              additionalImagesError={additionalImagesError}
            />

            {/* Variants */}
            <ProductVariantEditor
              fields={fields}
              colors={colors}
              sizes={sizes}
              control={control}
              register={register}
              errors={errors}
              isSubmitting={isSubmitting}
              onAddVariant={addVariant}
              onRemoveVariant={removeVariant}
            />
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            {/* Pricing */}
            <ProductPricing
              register={register}
              control={control}
              errors={errors}
              isSubmitting={isSubmitting}
              onWheel={handleWheel}
            />

            {/* Product Type & Gender */}
            <ProductTypeAndGender
              productTypes={productTypes}
              genders={genders}
              control={control}
              errors={errors}
              isSubmitting={isSubmitting}
              productTypeId={productTypeId}
              genderId={genderId}
            />

            {/* Collections */}
            <ProductCollection
              collections={collections}
              control={control}
              errors={errors}
              isSubmitting={isSubmitting}
              isEditing={isEditing}
            />
          </div>
        </div>
      </div>
    </form>
  );
}

function SubmitButton({ isEditing, isSubmitting }) {
  return (
    <Button type="submit" className="px-4 py-2" disabled={isSubmitting}>
      {isSubmitting
        ? isEditing
          ? "Updating..."
          : "Creating..."
        : isEditing
        ? "Update Product"
        : "Create Product"}
    </Button>
  );
}
