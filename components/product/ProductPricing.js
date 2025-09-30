"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { TriangleAlert } from "lucide-react";

export default function ProductPricing({
  basePrice,
  discountPercentage,
  isActive,
  onBasePriceChange,
  onDiscountPercentageChange,
  onIsActiveChange,
  onWheel,
}) {
  // Validation logic
  const price = parseFloat(basePrice) || 0;
  const discount = parseInt(discountPercentage) || 0;

  const basePriceError = price <= 0 ? "Price must be greater than 0" : null;
  const discountError =
    (discount < 0 || discount > 100) && discountPercentage !== ""
      ? "Discount must be between 0-100%"
      : null;

  // Calculate discounted price
  const discountedPrice = discount > 0 ? price * (1 - discount / 100) : price;

  // Show preview only if valid inputs
  const showPreview =
    basePrice &&
    discountPercentage &&
    price > 0 &&
    discount > 0 &&
    discount <= 100;

  return (
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
            onChange={(e) => onBasePriceChange(e.target.value)}
            required
            placeholder="0.00"
            onWheel={onWheel}
          />
          {basePriceError && (
            <div className="flex items-center gap-2 text-warning">
              <TriangleAlert size={18} className="" />
              <p className="text-sm">{basePriceError}</p>
            </div>
          )}
        </div>

        {/* Discount Percentage */}
        <div className="space-y-3">
          <Label>Discount Percentage (%)</Label>
          <Input
            type="number"
            min="0"
            max="100"
            name="discount_percentage"
            value={discountPercentage}
            onChange={(e) => onDiscountPercentageChange(e.target.value)}
            placeholder="0%"
            onWheel={onWheel}
          />
          {discountError && (
            <div className="flex items-center gap-2 text-warning">
              <TriangleAlert size={18} className="" />
              <p className="text-sm">{discountError}</p>
            </div>
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
          <Checkbox
            id="is_active"
            name="is_active"
            checked={isActive}
            onCheckedChange={onIsActiveChange}
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
  );
}
