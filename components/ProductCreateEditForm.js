"use client";

import { useState, useEffect } from "react";
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
import { createNewProductAction, updateProductAction } from "@/lib/actions";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Spinner from "./Spinner";

export default function ProductCreateEditForm({
  categories,
  subcategories,
  colors,
  sizes,
  existingProduct = null,
  isEditing = false,
}) {
  const [isInitialized, setIsInitialized] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSubcategory, setSelectedSubcategory] = useState("");
  const [isActive, setIsActive] = useState(true);
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

      // Set subcategory
      if (existingProduct.subcategory_id) {
        setSelectedSubcategory(existingProduct.subcategory_id);
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

    // Add category/subcategory validation
    if (!selectedCategory) {
      toast.error("Please select a category");
      return;
    }

    if (!selectedSubcategory) {
      toast.error("Please select a subcategory");
      return;
    }

    // Validate variants
    if (!validateVariants()) {
      toast.error("Please fill in all variant fields");
      return;
    }

    if (hasDuplicateVariants()) {
      toast.error("Duplicate color/size combinations are not allowed");
      return;
    }

    const formData = new FormData(event.target);
    const productData = {
      ...(isEditing && { id: existingProduct.id }),
      ...(isEditing && {
        existing_banner_image_url: existingProduct.banner_image_url,
      }),

      name: formData.get("name"),
      description: formData.get("description"),
      base_price: formData.get("base_price"),
      discount_percentage: formData.get("discount_percentage"),
      subcategory_id: selectedSubcategory,
      banner_image_url: formData.get("banner_image_url"),
      is_active: isActive,
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
        router.push("/admin/products");
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
    <form className="text-base" onSubmit={handleSubmit}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button variant="outline" asChild>
              <Link href="/admin/products">
                <ChevronLeft />
              </Link>
            </Button>

            <h2 className="text-3xl font-bold">
              {isEditing ? "Edit Product" : "Add Products"}
            </h2>
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Product Details */}
            <div className="rounded-lg space-y-8 p-6 shadow-sm border border-border bg-card">
              <h3 className="text-xl font-semibold">Product Details</h3>

              <div className="space-y-8">
                <div className="space-y-3">
                  <Label>Name</Label>
                  <Input
                    type="text"
                    name="name"
                    defaultValue={existingProduct?.name || ""}
                    required
                  />
                </div>

                <div className="space-y-3">
                  <Label>Description (Optional)</Label>
                  <Textarea
                    name="description"
                    rows={4}
                    defaultValue={existingProduct?.description || ""}
                  />
                </div>
              </div>
            </div>

            {/* Product Images */}
            <div className="rounded-lg space-y-8 p-6 shadow-sm border border-border bg-card">
              <div className="">
                <h3 className="text-xl font-semibold">Product Images</h3>
              </div>

              <div className="border-2 border-dashed rounded-lg p-8 text-center">
                <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h4 className="text-lg font-semibold mb-3">
                  Drop your images here
                </h4>
                <p className="text-sm text-muted-foreground mb-4">
                  PNG or JPG (max. 5MB)
                </p>
                <Input
                  type="file"
                  multiple
                  accept="image/*"
                  className="text-muted-foreground"
                />
              </div>

              {/* Banner Image URL */}
              <div className="space-y-3">
                <Label>Upload Banner Image</Label>
                <Input
                  type="file"
                  accept="image/*"
                  name="banner_image_url"
                  className="text-muted-foreground"
                />
              </div>
            </div>

            {/* Variants */}
            <div className="rounded-lg p-6 shadow-sm border border-border bg-card space-y-8">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold">Product Variants</h3>
                <Button type="button" onClick={addVariant}>
                  <Plus />
                  Add Variant
                </Button>
              </div>

              <div className="space-y-4">
                {/* Header */}
                <div className="grid grid-cols-5 gap-4 font-medium">
                  <div>Color</div>
                  <div>Size</div>
                  <div>Quantity</div>
                  <div>SKU (Optional)</div>
                  <div>Actions</div>
                </div>

                {/* Variant Rows */}
                {variants.map((variant, index) => (
                  <div key={index} className="grid grid-cols-5 gap-4 items-end">
                    {/* Color Select */}
                    <div>
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
                    </div>

                    {/* Size Select */}
                    <div>
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
                    </div>

                    {/* Quantity Input */}
                    <div>
                      <Input
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
                    </div>

                    {/* SKU Input */}
                    <div>
                      <Input
                        type="text"
                        value={variant.sku}
                        onChange={(e) =>
                          updateVariant(index, "sku", e.target.value)
                        }
                        placeholder="Auto-generated"
                        disabled
                      />
                    </div>

                    {/* Remove Button */}
                    <div>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => removeVariant(index)}
                        disabled={variants.length === 1}
                      >
                        <Trash />
                      </Button>
                    </div>
                  </div>
                ))}

                {/* Validation Messages */}
                {hasDuplicateVariants() && (
                  <div className="text-red-600 flex items-center">
                    ⚠️ Duplicate color/size combinations detected!
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            {/* Pricing */}
            <div className="rounded-lg p-6 shadow-sm border border-border bg-card space-y-8">
              <h3 className="text-xl font-semibold">Pricing</h3>

              <div className="space-y-8">
                <div className="space-y-3">
                  <Label>Price ($)</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    name="base_price"
                    defaultValue={existingProduct?.base_price || ""}
                    required
                    placeholder="0.00"
                    onWheel={handleWheel}
                  />
                </div>

                <div className="space-y-3">
                  <Label>Discount Percentage (%)</Label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    name="discount_percentage"
                    defaultValue={existingProduct?.discount_percentage || ""}
                    placeholder="0%"
                    onWheel={handleWheel}
                  />
                </div>

                <div className="flex items-center gap-2">
                  <Checkbox
                    id="is_active"
                    name="is_active"
                    checked={isActive}
                    onCheckedChange={setIsActive}
                  />
                  <Label htmlFor="is_active">Active Product</Label>
                </div>
              </div>
            </div>

            {/* Categories */}
            <div className="rounded-lg p-6 shadow-sm border border-border bg-card space-y-8">
              <h3 className="text-xl font-semibold">Categories</h3>

              <div className="space-y-4">
                <div>
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
                </div>

                <div>
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
                </div>
              </div>
            </div>
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
