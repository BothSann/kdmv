"use client";

import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ChevronLeft, Upload, Plus, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  createNewProductAction,
  updateProductAction,
} from "@/actions/products";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Spinner from "../Spinner";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import Image from "next/image";
import { formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export default function ProductCreateEditFormV1({
  categories,
  subcategories,
  colors,
  sizes,
  collections,
  existingProduct = null,
  isEditing = false,
}) {
  const fileInputRef = useRef(null);
  const additionalImagesInputRef = useRef(null);

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
  const [additionalImages, setAdditionalImages] = useState([]);
  const [imageFiles, setImageFiles] = useState([]);
  const [existingImages, setExistingImages] = useState(
    existingProduct?.product_images || []
  );
  const [previewUrl, setPreviewUrl] = useState(
    existingProduct?.banner_image_url || null
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
    if (selectedCategory && subcategories) {
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

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

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

  const hasDuplicateVariants = () => {
    const combinations = variants.map((v) => `${v.color_id}-${v.size_id}`);
    return combinations.length !== new Set(combinations).size;
  };

  // Validation functions
  const validatePricing = () => {
    const price = parseFloat(basePrice);
    const discount = parseInt(discountPercentage) || 0;

    return {
      isValid: price > 0 && discount >= 0 && discount <= 100,
      errors: {
        basePrice: !price || price <= 0 ? "Price must be greater than 0" : null,
        discountPercentage:
          discount < 0 || discount > 100
            ? "Discount must be between 0-100%"
            : null,
      },
    };
  };

  // Calculate discounted price for preview
  const getDiscountedPrice = () => {
    const price = parseFloat(basePrice) || 0;
    const discount = parseInt(discountPercentage) || 0;
    return discount > 0 ? price * (1 - discount / 100) : price;
  };

  const validation = validatePricing();
  const discountedPrice = getDiscountedPrice();

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

  const handleAdditionalImagesChange = (e) => {
    const files = Array.from(e.target.files);

    // Create preview URLs and store files
    const newImages = files.map((file, index) => ({
      id: Date.now() + index, // temporary ID
      file,
      preview: URL.createObjectURL(file),
      display_order: additionalImages.length + index,
    }));

    setAdditionalImages((prev) => [...prev, ...newImages]);
    setImageFiles((prev) => [...prev, ...files]);
  };

  const handleRemoveAdditionalImage = (imageId) => {
    setAdditionalImages((prev) => prev.filter((image) => image.id !== imageId));
    // Also update imageFiles state to remove the corresponding file
    setImageFiles((prev) => {
      const imageToRemove = additionalImages.find((img) => img.id === imageId);
      if (imageToRemove) {
        return prev.filter((file) => file !== imageToRemove.file);
      }
      return prev;
    });

    // Clear the file input if no images remain
    if (additionalImages.length <= 1) {
      // <= 1 because we're filtering out one item
      if (additionalImagesInputRef.current) {
        additionalImagesInputRef.current.value = "";
      }
    }
  };

  const handleClearAllAdditionalImages = () => {
    setAdditionalImages([]);
    setImageFiles([]);

    if (additionalImagesInputRef.current) {
      additionalImagesInputRef.current.value = "";
    }
  };

  const handleRemoveImage = () => {
    setPreviewUrl(null);
    setBannerFile(null);

    // Reset the file input fields
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRemoveExistingImage = (imageId) => {
    setExistingImages(existingImages.filter((image) => image.id !== imageId));
  };

  const handleWheel = (e) => {
    e.target.blur();
  };

  // Filter subcategories based on selected category
  const filteredSubcategories =
    subcategories?.filter((sub) => sub.category_id === selectedCategory) || [];

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

    if (hasDuplicateVariants()) {
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
            <Card>
              <CardHeader>
                <CardTitle>Product Details</CardTitle>
              </CardHeader>

              <CardContent className="space-y-8">
                <div className="space-y-3">
                  <Label>Name</Label>
                  <Input
                    type="text"
                    name="name"
                    value={name}
                    required
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>

                <div className="space-y-3">
                  <Label>Description (Optional)</Label>
                  <Textarea
                    name="description"
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Product Images */}
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
                    onChange={handleFileChange}
                    ref={fileInputRef}
                  />

                  {previewUrl && (
                    <div className="flex items-end justify-between mt-4">
                      <div className="relative w-26 h-26 aspect-square border border-border">
                        <Image
                          src={previewUrl}
                          alt="Product Banner Image Preview"
                          fill
                          sizes="100vw"
                          className="object-cover object-center"
                        />
                      </div>
                      {!isEditing && (
                        <div>
                          <Button
                            variant="destructive"
                            onClick={handleRemoveImage}
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
                    onChange={handleAdditionalImagesChange}
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
                          onClick={handleClearAllAdditionalImages}
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
                                className="object-cover object-center"
                              />
                            </div>

                            {/* Controls */}
                            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button
                                type="button"
                                size="icon"
                                variant="destructive"
                                onClick={() =>
                                  handleRemoveAdditionalImage(image.id)
                                }
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
                              className="object-cover object-center"
                            />
                          </div>

                          {/* Delete existing image button */}
                          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              type="button"
                              size="icon"
                              variant="destructive"
                              onClick={() =>
                                handleRemoveExistingImage(image.id)
                              }
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

            {/* Variants */}
            <Card>
              <CardHeader className="grid-cols-2">
                <CardTitle>Product Variants</CardTitle>

                <Button
                  className="justify-self-end"
                  type="button"
                  onClick={addVariant}
                >
                  <Plus />
                  Add Variant
                </Button>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Header */}
                <div className="grid grid-cols-5">
                  <Label>Color</Label>
                  <Label>Size</Label>
                  <Label>Quantity</Label>
                  <Label>SKU</Label>
                  <Label className="justify-self-end">Action</Label>
                </div>

                {/* Variant Rows */}
                {variants.map((variant, index) => (
                  <div key={index} className="grid grid-cols-5">
                    {/* Color Select */}

                    <Select
                      value={variant.color_id}
                      onValueChange={(value) =>
                        updateVariant(index, "color_id", value)
                      }
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select color" />
                      </SelectTrigger>
                      <SelectContent>
                        {colors?.map((color) => (
                          <SelectItem key={color.id} value={color.id}>
                            {color.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {/* Size Select */}

                    <Select
                      value={variant.size_id}
                      onValueChange={(value) =>
                        updateVariant(index, "size_id", value)
                      }
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select size" />
                      </SelectTrigger>
                      <SelectContent>
                        {sizes?.map((size) => (
                          <SelectItem key={size.id} value={size.id}>
                            {size.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {/* Quantity Input */}
                    <Input
                      className="max-w-24"
                      min="0"
                      value={variant.quantity}
                      onChange={(e) =>
                        updateVariant(
                          index,
                          "quantity",
                          parseInt(e.target.value) || 0
                        )
                      }
                      required
                      disabled={hasDuplicateVariants()}
                    />

                    {/* SKU Input */}
                    <Input
                      type="text"
                      value={variant.sku}
                      onChange={(e) =>
                        updateVariant(index, "sku", e.target.value)
                      }
                      placeholder="Auto-generated"
                      disabled
                    />

                    {/* Remove Button */}
                    <Button
                      className="justify-self-end"
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => removeVariant(index)}
                      disabled={variants.length === 1}
                    >
                      <Trash />
                    </Button>
                  </div>
                ))}

                {/* Validation Messages */}
                {hasDuplicateVariants() && (
                  <div className="text-destructive flex items-center">
                    ⚠️ Duplicate color/size combinations detected!
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            {/* Pricing */}
            <Card>
              <CardHeader>
                <CardTitle>Pricing</CardTitle>
              </CardHeader>
              <CardContent className="space-y-8">
                <div className="space-y-3">
                  <Label>Price ($)</Label>
                  <Input
                    type="number"
                    min="0.01"
                    step="0.01"
                    name="base_price"
                    value={basePrice}
                    onChange={(e) => setBasePrice(e.target.value)}
                    required
                    placeholder="0.00"
                    onWheel={handleWheel}
                  />
                  {validation.errors.basePrice && (
                    <p className="text-sm text-warning">
                      {validation.errors.basePrice}
                    </p>
                  )}
                </div>

                <div className="space-y-3">
                  <Label>Discount Percentage (%)</Label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    name="discount_percentage"
                    value={discountPercentage}
                    onChange={(e) => setDiscountPercentage(e.target.value)}
                    placeholder="0%"
                    onWheel={handleWheel}
                  />
                  {validation.errors.discountPercentage && (
                    <p className="text-sm text-destructive">
                      {validation.errors.discountPercentage}
                    </p>
                  )}

                  {/* Price Preview */}
                  {basePrice &&
                    discountPercentage &&
                    parseFloat(basePrice) > 0 &&
                    parseInt(discountPercentage) > 0 && (
                      <div className="bg-muted border border-border p-4 space-y-3 my-6">
                        <Label className="text-muted-foreground">
                          Price Preview:
                        </Label>
                        <div className="flex items-center gap-2">
                          <span className="line-through text-muted-foreground">
                            {formatCurrency(parseFloat(basePrice))}
                          </span>

                          <span>&rarr;</span>

                          <span className="font-semibold">
                            {formatCurrency(discountedPrice)}
                          </span>

                          <Badge
                            variant={"destructive"}
                            className="text-sm ml-auto"
                          >
                            -{discountPercentage}%
                          </Badge>
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
                  <Label htmlFor="is_active">Active Product</Label>
                  {!isActive && (
                    <span className="text-xs text-muted-foreground">
                      (Product will be hidden from customers)
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Categories */}
            <Card>
              <CardHeader>
                <CardTitle>Categories</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Select
                  value={selectedCategory}
                  onValueChange={handleCategoryChange}
                  required
                >
                  <SelectTrigger className="w-full" required>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent required>
                    {categories?.map((category) => (
                      <SelectItem
                        key={category.id}
                        value={category.id}
                        required
                      >
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Subcategories */}
                <Select
                  value={selectedSubcategory}
                  onValueChange={setSelectedSubcategory}
                  disabled={!selectedCategory}
                  required
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a sub category" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredSubcategories.map((subcategory) => (
                      <SelectItem key={subcategory.id} value={subcategory.id}>
                        {subcategory.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {/* Collections */}
            {collections && collections.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Collection (Optional)</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Select
                    value={selectedCollection}
                    onValueChange={setSelectedCollection}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a collection (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      {collections.map((collection) => (
                        <SelectItem key={collection.id} value={collection.id}>
                          {collection.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {isEditing && selectedCollection && (
                    <p className="text-sm text-warning">
                      <span className="font-bold">Note: </span>Removing this
                      product from the collection must be done inside the
                      collection itself.
                    </p>
                  )}
                </CardContent>
              </Card>
            )}
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
