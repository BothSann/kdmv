"use client";
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
import { useState } from "react";
import { ChevronLeft, Upload, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import Link from "next/link";

export default function AdminAddProductPage() {
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    description: "",
    price: "",
    discount_percentage: 0,
    is_active: true,
    status: "Draft",
    category: "",
    subCategory: "",
    banner_image_url: "",
  });

  // Variants for color/size combinations with quantity
  const [variants, setVariants] = useState([
    { color: "", size: "", quantity: 0, id: 1 },
    { color: "", size: "", quantity: 0, id: 2 },
  ]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const updateVariant = (id, field, value) => {
    setVariants(
      variants.map((variant) =>
        variant.id === id ? { ...variant, [field]: value } : variant
      )
    );
  };

  const addVariant = () => {
    setVariants([
      ...variants,
      { color: "", size: "", quantity: 0, id: Date.now() },
    ]);
  };

  const removeVariant = (id) => {
    if (variants.length > 1) {
      setVariants(variants.filter((variant) => variant.id !== id));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
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
            <Button className="px-4 py-2" variant="outline">
              Cancel
            </Button>
            <Button className="px-4 py-2" variant="default">
              Create
            </Button>
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
                  <Input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Product Code
                    </label>
                    <Input
                      type="text"
                      name="code"
                      value={formData.code}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description (Optional)
                  </label>
                  <Textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Product Images */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-medium text-gray-900">
                  Product Images
                </h2>
                <Button>Add media from URL</Button>
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
                <Input
                  type="file"
                  name="banner_image_url"
                  onChange={handleInputChange}
                />
              </div>
            </div>

            {/* Variants */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-medium text-gray-900">
                  Product Variants
                </h2>
                <Button type="button" onClick={addVariant} variant="outline">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Variant
                </Button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-4 gap-4 text-sm font-medium text-gray-700">
                  <div>Color</div>
                  <div>Size</div>
                  <div>Quantity</div>
                  <div>Actions</div>
                </div>

                {variants.map((variant, index) => (
                  <div key={variant.id} className="grid grid-cols-4 gap-4">
                    <div>
                      <Select
                        value={variant.color}
                        onValueChange={(value) =>
                          updateVariant(variant.id, "color", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select color" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="red">Red</SelectItem>
                          <SelectItem value="blue">Blue</SelectItem>
                          <SelectItem value="black">Black</SelectItem>
                          <SelectItem value="white">White</SelectItem>
                          <SelectItem value="green">Green</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Select
                        value={variant.size}
                        onValueChange={(value) =>
                          updateVariant(variant.id, "size", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select size" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="xs">XS</SelectItem>
                          <SelectItem value="s">S</SelectItem>
                          <SelectItem value="m">M</SelectItem>
                          <SelectItem value="l">L</SelectItem>
                          <SelectItem value="xl">XL</SelectItem>
                          <SelectItem value="xxl">XXL</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Input
                        type="number"
                        min="0"
                        value={variant.quantity}
                        onChange={(e) =>
                          updateVariant(
                            variant.id,
                            "quantity",
                            parseInt(e.target.value) || 0
                          )
                        }
                      />
                    </div>

                    <div>
                      {variants.length > 1 && (
                        <Button
                          type="button"
                          onClick={() => removeVariant(variant.id)}
                          variant="destructive"
                          size="sm"
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
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
                    step="0.01"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Discount Percentage
                  </label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    name="discount_percentage"
                    value={formData.discount_percentage}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="flex items-center gap-4">
                  <Checkbox
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) =>
                      setFormData((prev) => ({ ...prev, is_active: checked }))
                    }
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
                  <div className="relative">
                    <Select
                      name="category"
                      value={formData.category}
                      onValueChange={(value) =>
                        setFormData((prev) => ({ ...prev, category: value }))
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="men">Men</SelectItem>
                        <SelectItem value="women">Women</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <div className="relative">
                    <Select
                      name="subCategory"
                      value={formData.subCategory}
                      onValueChange={(value) =>
                        setFormData((prev) => ({ ...prev, subCategory: value }))
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a sub category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="shirts">Shirts</SelectItem>
                        <SelectItem value="trousers">Trousers</SelectItem>
                        <SelectItem value="jeans">Jeans</SelectItem>
                        <SelectItem value="hoodies">Hoodies</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
