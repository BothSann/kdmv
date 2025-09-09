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
import { createNewProductAction } from "@/lib/actions";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function ProductCreateForm({
  categories,
  subcategories,
  colors,
  sizes,
}) {
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSubcategory, setSelectedSubcategory] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [variants, setVariants] = useState([
    { color_id: "", size_id: "", quantity: 0, sku: "" },
  ]);
  const router = useRouter();

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
      name: formData.get("name"),
      description: formData.get("description"),
      base_price: formData.get("base_price"),
      discount_percentage: formData.get("discount_percentage"),
      subcategory_id: selectedSubcategory,
      banner_image_url: formData.get("banner_image_url"),
      is_active: isActive,
      variants: variants.filter((v) => v.color_id && v.size_id),
    };

    // console.log(productData);

    const toastId = toast.loading("Creating product...");
    try {
      const { success, error, message } = await createNewProductAction(
        productData
      );

      if (error) {
        toast.error(error, { id: toastId });
      }

      if (success) {
        toast.success(message, { id: toastId });
        router.push("/admin/products");
      }
    } catch (err) {
      toast.error(err.message, { id: toastId });
    }
  };

  return (
    <form className="min-h-screen bg-gray-50 p-6" onSubmit={handleSubmit}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button variant="outline" asChild>
              <Link href="/admin/products">
                <ChevronLeft className="w-5 h-5" />
              </Link>
            </Button>
            <h1 className="text-2xl font-semibold text-gray-900">
              Add Products
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
            <SubmitButton />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Product Details */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h2 className="text-lg font-medium text-gray-900 mb-6">
                Product Details
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Name
                  </label>
                  <Input type="text" name="name" required />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description (Optional)
                  </label>
                  <Textarea
                    name="description"
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md "
                  />
                </div>
              </div>
            </div>

            {/* Product Images */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="mb-6">
                <h2 className="text-lg font-medium text-gray-900">
                  Product Images
                </h2>
              </div>

              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-700 mb-2">
                  Drop your images here
                </h3>
                <p className="text-sm text-gray-500 mb-4">
                  PNG or JPG (max. 5MB)
                </p>
                <Input type="file" multiple />
              </div>

              {/* Banner Image URL */}
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload Banner Image
                </label>
                <Input type="file" name="banner_image_url" />
              </div>
            </div>

            {/* Variants */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-medium text-gray-900">
                  Product Variants
                </h2>
                <Button type="button" variant="outline" onClick={addVariant}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Variant
                </Button>
              </div>

              <div className="space-y-4">
                {/* Header */}
                <div className="grid grid-cols-5 gap-4 text-sm font-medium text-gray-700">
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
                  <div className="text-red-600 text-sm flex items-center">
                    ⚠️ Duplicate color/size combinations detected!
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Pricing */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h2 className="text-lg font-medium text-gray-900 mb-6">
                Pricing
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price ($)
                  </label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    name="base_price"
                    required
                    placeholder="0.00"
                    onWheel={handleWheel}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Discount Percentage (%)
                  </label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    name="discount_percentage"
                    placeholder="0%"
                    onWheel={handleWheel}
                  />
                </div>

                <div className="flex items-center gap-4">
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
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h2 className="text-lg font-medium text-gray-900 mb-6">
                Categories
              </h2>

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

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" className="px-4 py-2" disabled={pending}>
      {pending ? "Creating..." : "Create"}
    </Button>
  );
}
