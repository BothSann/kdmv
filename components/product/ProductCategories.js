"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "../ui/label";
import { Controller } from "react-hook-form";
import FormError from "@/components/FormError";
import { cn } from "@/lib/utils";

export default function ProductCategories({
  categories = [],
  subcategories = [],
  selectedCategory,
  subcategoryId,
  control,
  errors,
  isSubmitting,
  onCategoryChange,
}) {
  // Filter subcategories based on selected category
  const filteredSubcategories =
    subcategories?.filter((sub) => sub.category_id === selectedCategory) || [];

  const showPreview = selectedCategory && subcategoryId;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Categories</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Category Select (UI only - for filtering) */}
        <div className="space-y-2">
          <Label htmlFor="category">Category (for filtering)</Label>
          <Select
            value={selectedCategory}
            onValueChange={onCategoryChange}
            disabled={isSubmitting}
          >
            <SelectTrigger className="w-full" id="category">
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              {categories?.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Subcategory Select (actual form field) */}
        <div className="space-y-2">
          <Label htmlFor="subcategory_id">
            Subcategory<span className="text-destructive">*</span>
          </Label>
          <Controller
            name="subcategory_id"
            control={control}
            render={({ field }) => (
              <Select
                value={field.value}
                onValueChange={field.onChange}
                disabled={!selectedCategory || isSubmitting}
              >
                <SelectTrigger
                  className={cn(
                    "w-full",
                    errors.subcategory_id && "border-destructive"
                  )}
                  id="subcategory_id"
                >
                  <SelectValue placeholder="Select a subcategory" />
                </SelectTrigger>
                <SelectContent>
                  {filteredSubcategories.map((subcategory) => (
                    <SelectItem key={subcategory.id} value={subcategory.id}>
                      {subcategory.product_types?.name || subcategory.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.subcategory_id && (
            <FormError message={errors.subcategory_id.message} />
          )}
        </div>

        {/* Preview */}
        {showPreview && (
          <div className="bg-muted border border-border p-4 space-y-4 my-6">
            <Label className="text-muted-foreground">Current Selection:</Label>

            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">Category</span>
                <span>&rarr;</span>
                <span className="font-medium">
                  {categories.find((cat) => cat.id === selectedCategory)?.name}
                </span>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">Product Type</span>
                <span>&rarr;</span>
                <span className="font-medium">
                  {filteredSubcategories.find((sub) => sub.id === subcategoryId)
                    ?.product_types?.name ||
                    filteredSubcategories.find(
                      (sub) => sub.id === subcategoryId
                    )?.name}
                </span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
