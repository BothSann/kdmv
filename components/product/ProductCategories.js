"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TriangleAlert } from "lucide-react";
import { Label } from "../ui/label";
import { Badge } from "../ui/badge";

export default function ProductCategories({
  categories = [],
  subcategories = [],
  selectedCategory,
  selectedSubcategory,
  onCategoryChange,
  onSubcategoryChange,
}) {
  // Filter subcategories based on selected category
  const filteredSubcategories =
    subcategories?.filter((sub) => sub.category_id === selectedCategory) || [];

  const showPreview = selectedCategory && selectedSubcategory;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Categories</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Category Select */}
        <Select
          value={selectedCategory}
          onValueChange={onCategoryChange}
          required
        >
          <SelectTrigger className="w-full" required>
            <SelectValue placeholder="Select a category" />
          </SelectTrigger>
          <SelectContent required>
            {categories?.map((category) => (
              <SelectItem key={category.id} value={category.id} required>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Subcategory Select */}
        <Select
          value={selectedSubcategory}
          onValueChange={onSubcategoryChange}
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
        {selectedCategory && !selectedSubcategory && (
          <div className="flex items-center gap-2 text-warning">
            <TriangleAlert size={18} className="" />
            <span className="text-sm">Please select a subcategory</span>
          </div>
        )}

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
                <span className="text-muted-foreground">Subcategory</span>
                <span>&rarr;</span>
                <span className="font-medium">
                  {
                    filteredSubcategories.find(
                      (sub) => sub.id === selectedSubcategory
                    )?.name
                  }
                </span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
