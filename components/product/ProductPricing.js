"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, cn } from "@/lib/utils";
import { Controller } from "react-hook-form";
import FormError from "@/components/FormError";

export default function ProductPricing({
  register,
  control,
  errors,
  isSubmitting,
  onWheel,
}) {
  // Watch values for price preview
  const basePrice = control._formValues?.base_price || "";
  const discountPercentage = control._formValues?.discount_percentage || "";

  // Calculate discounted price for preview
  const price = parseFloat(basePrice) || 0;
  const discount = parseFloat(discountPercentage) || 0;
  const discountedPrice = discount > 0 ? price * (1 - discount / 100) : price;

  // Show preview only if valid inputs
  const showPreview =
    basePrice && discountPercentage && price > 0 && discount > 0 && discount <= 100;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pricing</CardTitle>
      </CardHeader>
      <CardContent className="space-y-8">
        <div className="space-y-3">
          <Label htmlFor="base_price">
            Price ($)<span className="text-destructive">*</span>
          </Label>
          <Input
            {...register("base_price")}
            id="base_price"
            type="number"
            min="0.01"
            step="0.01"
            placeholder="0.00"
            disabled={isSubmitting}
            onWheel={onWheel}
            className={cn("w-full", errors.base_price && "border-destructive")}
          />
          {errors.base_price && (
            <FormError message={errors.base_price.message} />
          )}
        </div>

        {/* Discount Percentage */}
        <div className="space-y-3">
          <Label htmlFor="discount_percentage">
            Discount Percentage (%)
          </Label>
          <Input
            {...register("discount_percentage")}
            id="discount_percentage"
            type="number"
            min="0"
            max="100"
            placeholder="0"
            disabled={isSubmitting}
            onWheel={onWheel}
            className={cn(
              "w-full",
              errors.discount_percentage && "border-destructive"
            )}
          />
          {errors.discount_percentage && (
            <FormError message={errors.discount_percentage.message} />
          )}

          {/* Price Preview */}
          {showPreview && (
            <div className="bg-muted border border-border p-4 space-y-4 my-6">
              <Label className="text-muted-foreground">Price Preview:</Label>

              <div className="flex items-center gap-2">
                <span className="line-through text-muted-foreground">
                  {formatCurrency(parseFloat(basePrice))}
                </span>

                <span>&rarr;</span>

                <span className="font-semibold">
                  {formatCurrency(discountedPrice)}
                </span>

                <Badge variant={"destructive"} className="text-sm ml-auto">
                  -{discountPercentage}%
                </Badge>
              </div>
            </div>
          )}
        </div>

        {/* Active Toggle */}
        <div className="flex items-center gap-2">
          <Controller
            name="is_active"
            control={control}
            render={({ field }) => (
              <Checkbox
                id="is_active"
                checked={field.value}
                onCheckedChange={field.onChange}
                disabled={isSubmitting}
              />
            )}
          />
          <Label htmlFor="is_active">Active Product</Label>
          {!control._formValues?.is_active && (
            <span className="text-xs text-muted-foreground">
              (Product will be hidden from customers)
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
