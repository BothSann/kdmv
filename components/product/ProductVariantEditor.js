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
import { Controller } from "react-hook-form";
import FormError from "@/components/FormError";
import { cn } from "@/lib/utils";

export default function ProductVariantEditor({
  fields,
  colors = [],
  sizes = [],
  control,
  register,
  errors,
  isSubmitting,
  onAddVariant,
  onRemoveVariant,
}) {
  // Check for variant-level errors
  const hasVariantErrors = errors.variants && Array.isArray(errors.variants);

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
        {fields.map((field, index) => (
          <div key={field.id} className="space-y-3">
            <div className="grid grid-cols-5 gap-2">
              {/* Color Select */}
              <div className="space-y-1">
                <Controller
                  name={`variants.${index}.color_id`}
                  control={control}
                  render={({ field: controllerField }) => (
                    <Select
                      value={controllerField.value}
                      onValueChange={controllerField.onChange}
                      disabled={isSubmitting}
                    >
                      <SelectTrigger
                        className={cn(
                          errors.variants?.[index]?.color_id &&
                            "border-destructive"
                        )}
                      >
                        <SelectValue placeholder="Color" />
                      </SelectTrigger>
                      <SelectContent>
                        {colors?.map((color) => (
                          <SelectItem key={color.id} value={color.id}>
                            {color.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              {/* Size Select */}
              <div className="space-y-1">
                <Controller
                  name={`variants.${index}.size_id`}
                  control={control}
                  render={({ field: controllerField }) => (
                    <Select
                      value={controllerField.value}
                      onValueChange={controllerField.onChange}
                      disabled={isSubmitting}
                    >
                      <SelectTrigger
                        className={cn(
                          errors.variants?.[index]?.size_id &&
                            "border-destructive"
                        )}
                      >
                        <SelectValue placeholder="Size" />
                      </SelectTrigger>
                      <SelectContent>
                        {sizes?.map((size) => (
                          <SelectItem key={size.id} value={size.id}>
                            {size.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              {/* Quantity Input */}
              <div className="space-y-1">
                <Input
                  {...register(`variants.${index}.quantity`, {
                    valueAsNumber: true,
                  })}
                  type="number"
                  className={cn(
                    "max-w-24",
                    errors.variants?.[index]?.quantity && "border-destructive"
                  )}
                  min="0"
                  placeholder="0"
                  disabled={isSubmitting}
                />
              </div>

              {/* SKU Input */}
              <div className="space-y-1">
                <Input
                  {...register(`variants.${index}.sku`)}
                  type="text"
                  placeholder="Auto-generated"
                  disabled={isSubmitting}
                  className={cn(
                    errors.variants?.[index]?.sku && "border-destructive"
                  )}
                />
              </div>

              {/* Remove Button */}
              <Button
                className="justify-self-end"
                type="button"
                variant="destructive"
                size="sm"
                onClick={() => onRemoveVariant(index)}
                disabled={fields.length === 1 || isSubmitting}
              >
                <Trash />
              </Button>
            </div>

            {/* Individual variant errors */}
            <div className="grid grid-cols-5 gap-2 text-sm">
              <div>
                {errors.variants?.[index]?.color_id && (
                  <FormError
                    message={errors.variants[index].color_id.message}
                  />
                )}
              </div>
              <div>
                {errors.variants?.[index]?.size_id && (
                  <FormError message={errors.variants[index].size_id.message} />
                )}
              </div>
              <div>
                {errors.variants?.[index]?.quantity && (
                  <FormError
                    message={errors.variants[index].quantity.message}
                  />
                )}
              </div>
              <div>
                {errors.variants?.[index]?.sku && (
                  <FormError message={errors.variants[index].sku.message} />
                )}
              </div>
            </div>
          </div>
        ))}

        {/* Variant Array-level Errors (e.g., duplicates) */}
        {errors.variants && (
          <div className="bg-warning/10 border border-warning text-warning p-4 flex items-center gap-2">
            <span className="font-bold">⚠️</span>
            <span className="text-sm">
              {typeof errors.variants.message === "string"
                ? errors.variants.message
                : errors.variants.root?.message ||
                  "Please fix the variant errors above"}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
