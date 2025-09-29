"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Plus, Trash } from "lucide-react";

import { hasDuplicateVariants } from "@/lib/utils";

export default function ProductVariantsEditor({
  variants,
  colors = [],
  sizes = [],
  onAddVariant,
  onRemoveVariant,
  onUpdateVariant,
}) {
  const duplicateDetected = hasDuplicateVariants(variants);

  return (
    <Card>
      <CardHeader className="grid-cols-2">
        <CardTitle>Product Variants</CardTitle>

        <Button
          className="justify-self-end"
          type="button"
          onClick={onAddVariant}
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
                onUpdateVariant(index, "color_id", value)
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
                onUpdateVariant(index, "size_id", value)
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
                onUpdateVariant(
                  index,
                  "quantity",
                  parseInt(e.target.value) || 0
                )
              }
              required
              disabled={duplicateDetected}
            />

            {/* SKU Input */}
            <Input
              type="text"
              value={variant.sku}
              onChange={(e) => onUpdateVariant(index, "sku", e.target.value)}
              placeholder="Auto-generated"
              disabled
            />

            {/* Remove Button */}
            <Button
              className="justify-self-end"
              type="button"
              variant="destructive"
              size="sm"
              onClick={() => onRemoveVariant(index)}
              disabled={variants.length === 1}
            >
              <Trash />
            </Button>
          </div>
        ))}

        {/* Duplicate Warning */}
        {duplicateDetected && (
          <div className="text-destructive flex items-center gap-2">
            ⚠️ Duplicate color/size combinations detected!
          </div>
        )}
      </CardContent>
    </Card>
  );
}
