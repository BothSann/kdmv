"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
      </CardContent>
    </Card>
  );
}
