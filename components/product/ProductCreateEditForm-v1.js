"use client";

import { useState, useEffect } from "react";

import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  createNewProductAction,
  updateProductAction,
} from "@/actions/products";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Spinner from "../Spinner";
import { hasDuplicateVariants } from "@/lib/utils";
import ProductDetails from "./ProductDetails";
import ProductPricing from "./ProductPricing";
import ProductCategories from "./ProductCategories";
import ProductCollection from "./ProductCollection";
import ProductVariantsEditor from "./ProductVariantsEditor";
import ProductImages from "./ProductImages";

export default function ProductCreateEditFormV1({
  categories,
  subcategories,
  colors,
  sizes,
  collections,
  existingProduct = null,
  isEditing = false,
}) {
  const [name, setName] = useState(existingProduct?.name || "");
  const [description, setDescription] = useState(
    existingProduct?.description || ""
  );
  const [basePrice, setBasePrice] = useState(existingProduct?.base_price || "");
  const [discountPercentage, setDiscountPercentage] = useState(
    existingProduct?.discount_percentage || ""
  );
  const [isActive, setIsActive] = useState(existingProduct?.is_active || true);
  const [selectedCollection, setSelectedCollection] = useState(
    existingProduct?.collection_id || ""
  );

  const [isInitialized, setIsInitialized] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSubcategory, setSelectedSubcategory] = useState("");
  const [bannerFile, setBannerFile] = useState(null);
  const [imageFiles, setImageFiles] = useState([]);
  const [existingImages, setExistingImages] = useState(
    existingProduct?.product_images || []
  );

  const [variants, setVariants] = useState([
    { color_id: "", size_id: "", quantity: 0, sku: "" },
  ]);
  const router = useRouter();

  // Initialize form data and control loading state
  useEffect(() => {
    if (isEditing && existingProduct) {
      // EDIT MODE: Initialize all data from existing product

      // Find the category ID from the subcategory relationship
      const categoryId = existingProduct.subcategories?.categories?.id;
      if (categoryId) {
        setSelectedCategory(categoryId);
      }

      // Set Subcategory
      if (existingProduct.subcategory_id) {
        setSelectedSubcategory(existingProduct.subcategory_id);
      }

      // Set Collection (if product belongs to a collection)
      if (existingProduct.collection_id) {
        setSelectedCollection(existingProduct.collection_id);
      }

      // Set active status
      setIsActive(existingProduct.is_active || false);

      // Set variants from existing product
      if (
        existingProduct.product_variants &&
        existingProduct.product_variants.length > 0
      ) {
        const formattedVariants = existingProduct.product_variants.map(
          (variant) => ({
            color_id: variant.colors?.id || "",
            size_id: variant.sizes?.id || "",
            quantity: variant.quantity || 0,
            sku: variant.sku || "",
          })
        );
        setVariants(formattedVariants);
      }

      // Mark as initialized AFTER all data is set
      setIsInitialized(true);
    }

    if (!isEditing) setIsInitialized(true);
  }, [isEditing, existingProduct]);

  useEffect(() => {
    if (selectedCategory && subcategories && categories) {
      // Find category by ID to get its slug
      const selectedCategoryData = categories?.find(
        (cat) => cat.id === selectedCategory
      );

      if (selectedCategoryData?.slug === "unisex") {
        // Find subcategory by slug (more reliable than ID)
        const allGendersSub = subcategories.find(
          (sub) =>
            sub.category_id === selectedCategory && sub.slug === "all-genders"
        );

        if (allGendersSub && !selectedSubcategory) {
          // Only if nothing selected
          setSelectedSubcategory(allGendersSub.id);
        }
      }
    }
  }, [selectedCategory, subcategories, categories, selectedSubcategory]);

  const addVariant = () => {
    setVariants([
      ...variants,
      { color_id: "", size_id: "", quantity: 0, sku: "" },
    ]);
  };

  const removeVariant = (index) => {
    if (variants.length > 1) {
      setVariants(variants.filter((_, i) => i !== index));
    }
  };

  const updateVariant = (index, field, value) => {
    setVariants(
      variants.map((variant, i) =>
        i === index ? { ...variant, [field]: value } : variant
      )
    );
  };

  const validateVariants = () => {
    return variants.every(
      (variant) => variant.color_id && variant.size_id && variant.quantity >= 0
    );
  };

  const handleRemoveExistingImage = (imageId) => {
    setExistingImages(existingImages.filter((image) => image.id !== imageId));
  };

  const handleWheel = (e) => {
    e.target.blur();
  };

  // Reset subcategory when category changes
  const handleCategoryChange = (categoryId) => {
    setSelectedCategory(categoryId);
    setSelectedSubcategory(""); // Reset subcategory selection
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    // Image validation - required for new products, optional for edits
    if (!isEditing && !bannerFile) {
      toast.warning("Please upload a banner image");
      return;
    }

    // Add category/subcategory validation
    if (!selectedCategory) {
      toast.warning("Please select a category");
      return;
    }

    if (!selectedSubcategory) {
      toast.warning("Please select a subcategory");
      return;
    }

    // Validate variants
    if (!validateVariants()) {
      toast.warning("Please fill in all variant fields");
      return;
    }

    if (hasDuplicateVariants(variants)) {
      toast.warning("Duplicate color/size combinations are not allowed");
      return;
    }

    const formData = new FormData(event.target);
    const productData = {
      ...(isEditing && { id: existingProduct.id }),
      ...(isEditing && {
        existing_banner_image_url: existingProduct.banner_image_url,
      }),
      ...(isEditing && {
        existing_image_ids: existingImages.map((image) => image.id),
      }),

      name: formData.get("name"),
      description: formData.get("description"),
      base_price: formData.get("base_price"),
      discount_percentage: formData.get("discount_percentage"),
      subcategory_id: selectedSubcategory,
      banner_file: bannerFile,
      image_files: imageFiles,
      is_active: isActive,
      collection_id: selectedCollection || null,
      variants: variants.filter((v) => v.color_id && v.size_id),
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
    <form className="mt-10" onSubmit={handleSubmit}>
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
              {isEditing ? `Editing ${name}` : "Add Products"}
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
            <SubmitButton isEditing={isEditing} />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1.75fr_1fr] gap-6">
          {/* Left Column */}
          <div className="space-y-8">
            {/* Product Details */}
            <ProductDetails
              name={name}
              description={description}
              onNameChange={setName}
              onDescriptionChange={setDescription}
            />

            {/* Product Images */}
            <ProductImages
              bannerPreviewUrl={
                isEditing ? existingProduct?.banner_image_url : null
              }
              bannerFile={bannerFile}
              existingImages={existingImages}
              isEditing={isEditing}
              onBannerFileChange={setBannerFile}
              onAdditionalImagesChange={(files) => {
                setImageFiles((prev) => [...prev, ...files]);
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
            />

            {/* Variants */}
            <ProductVariantsEditor
              variants={variants}
              colors={colors}
              sizes={sizes}
              onAddVariant={addVariant}
              onRemoveVariant={removeVariant}
              onUpdateVariant={updateVariant}
            />
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            {/* Pricing */}
            <ProductPricing
              basePrice={basePrice}
              discountPercentage={discountPercentage}
              isActive={isActive}
              onBasePriceChange={setBasePrice}
              onDiscountPercentageChange={setDiscountPercentage}
              onIsActiveChange={setIsActive}
              onWheel={handleWheel}
            />

            {/* Categories */}
            <ProductCategories
              categories={categories}
              subcategories={subcategories}
              selectedCategory={selectedCategory}
              selectedSubcategory={selectedSubcategory}
              onCategoryChange={handleCategoryChange}
              onSubcategoryChange={setSelectedSubcategory}
            />

            {/* Collections */}
            <ProductCollection
              collections={collections}
              selectedCollection={selectedCollection}
              onCollectionChange={setSelectedCollection}
              isEditing={isEditing}
            />
          </div>
        </div>
      </div>
    </form>
  );
}

function SubmitButton({ isEditing }) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" className="px-4 py-2" disabled={pending}>
      {pending
        ? isEditing
          ? "Updating..."
          : "Creating..."
        : isEditing
        ? "Update Product"
        : "Create Product"}
    </Button>
  );
}
