"use client";

import { useState, useMemo, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

/**
 * ProductVariantSelector v2 - Simplified version using variant IDs
 *
 * @param {Object} props
 * @param {Object} props.product - Product object with variants_lookup, available_colors, available_sizes
 * @param {"customer" | "admin"} [props.variant="customer"] - Styling and labeling variant
 * @param {boolean} [props.showTitle=true] - Whether to show section titles
 * @param {string} [props.className] - Additional container classes
 * @param {function} [props.onVariantChange] - Callback when variant changes: (variant) => void
 * @param {string} [props.selectedVariantId] - Optional controlled variant ID
 */
export default function ProductVariantSelector({
  product,
  variant = "customer",
  showTitle = true,
  className = "",
  onVariantChange,
  selectedVariantId,
}) {
  const isControlled = selectedVariantId !== undefined;

  const [internalVariantId, setInternalVariantId] = useState(null);
  const currentVariantId = isControlled ? selectedVariantId : internalVariantId;

  const isCustomer = variant === "customer";
  const isAdmin = variant === "admin";

  // Get selected variant object
  const selectedVariant = useMemo(() => {
    if (!currentVariantId) return null;
    return product.variants_lookup.find((v) => v.id === currentVariantId);
  }, [currentVariantId, product.variants_lookup]);

  // Extract selected color and size from variant
  const selectedColorId = selectedVariant?.colors?.id || null;
  const selectedSizeId = selectedVariant?.sizes?.id || null;

  // Get available sizes for the selected color
  const availableSizesForColor = useMemo(() => {
    if (!selectedColorId) return [];
    return product.variants_lookup
      .filter((v) => v.colors?.id === selectedColorId)
      .map((v) => v.sizes)
      .filter(Boolean)
      .sort((a, b) => a.display_order - b.display_order);
  }, [selectedColorId, product.variants_lookup]);

  // Notify parent when variant changes
  useEffect(() => {
    if (onVariantChange) {
      onVariantChange(selectedVariant);
    }
  }, [selectedVariant, onVariantChange]);

  // Handle color selection - find first variant with this color
  const handleColorChange = (colorId) => {
    const firstVariantWithColor = product.variants_lookup.find(
      (v) => v.colors?.id === colorId
    );

    const newVariantId = firstVariantWithColor?.id || null;

    if (isControlled) {
      onVariantChange?.(firstVariantWithColor || null);
    } else {
      setInternalVariantId(newVariantId);
    }
  };

  // Handle size selection - find variant with current color + this size
  const handleSizeChange = (sizeId) => {
    if (!selectedColorId) return;

    const variantWithColorAndSize = product.variants_lookup.find(
      (v) => v.colors?.id === selectedColorId && v.sizes?.id === sizeId
    );

    const newVariantId = variantWithColorAndSize?.id || null;

    if (isControlled) {
      onVariantChange?.(variantWithColorAndSize || null);
    } else {
      setInternalVariantId(newVariantId);
    }
  };

  // Styling config
  const config = useMemo(() => {
    if (variant === "admin") {
      return {
        colorLabel: "Available Colors:",
        sizeLabel: "Available Sizes:",
        labelClassName: "text-lg font-semibold text-foreground/95",
      };
    }
    return {
      colorLabel: "Color",
      sizeLabel: "Size",
      labelClassName:
        "text-sm font-bold font-poppins uppercase tracking-[0.2em] text-muted-foreground",
    };
  }, [variant]);

  return (
    <div className={`${className} space-y-6`}>
      {/* Color Selection */}
      <div className="space-y-2.5">
        {showTitle && (
          <Label className={config.labelClassName}>{config.colorLabel}</Label>
        )}
        <RadioGroup
          className="flex gap-2 flex-wrap"
          value={selectedColorId || ""}
          onValueChange={handleColorChange}
        >
          {product.available_colors.map((color) => (
            <div key={color.id}>
              <RadioGroupItem
                value={color.id}
                id={`color-${color.id}`}
                className="sr-only peer"
              />
              <Label
                htmlFor={`color-${color.id}`}
                className={`flex items-center justify-center px-6 py-2 text-base text-foreground cursor-pointer border border-border transition-colors hover:bg-muted ${
                  selectedColorId === color.id
                    ? "bg-foreground text-background hover:bg-primary/90"
                    : ""
                }`}
              >
                {color.name}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      {/* Size Selection */}
      <div className="space-y-2.5 mt-4">
        {showTitle && (
          <Label className={config.labelClassName}>{config.sizeLabel}</Label>
        )}
        <RadioGroup
          className="flex gap-2 flex-wrap"
          value={selectedSizeId || ""}
          onValueChange={handleSizeChange}
        >
          {availableSizesForColor.length > 0 ? (
            availableSizesForColor.map((size) => (
              <div key={size.id}>
                <RadioGroupItem
                  value={size.id}
                  id={`size-${size.id}`}
                  className="sr-only peer"
                />
                <Label
                  htmlFor={`size-${size.id}`}
                  className={`flex items-center justify-center px-6 py-2 text-base text-foreground cursor-pointer border border-border transition-colors hover:bg-muted ${
                    selectedSizeId === size.id
                      ? "bg-foreground text-background hover:bg-primary/90"
                      : ""
                  }`}
                >
                  {size.name}
                </Label>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">
              {isCustomer
                ? "Please select a color first"
                : "Please select a color first to see available sizes"}
            </p>
          )}
        </RadioGroup>
      </div>

      {/* Selected Variant Info - Admin Only */}
      {isAdmin && selectedVariant && (
        <div className="flex flex-col gap-2.5 p-4 bg-muted mt-6">
          <h3 className="text-lg font-semibold">Product Details:</h3>
          <div className="space-y-2 text-sm">
            <div className="grid grid-cols-[1fr_1fr]">
              <div className="flex items-center gap-2">
                <span className="font-medium">Color:</span>
                <span>{selectedVariant.colors?.name || "N/A"}</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="font-medium">Size:</span>
                <span>{selectedVariant.sizes?.name || "N/A"}</span>
              </div>
            </div>

            <div className="grid grid-cols-[1fr_1fr]">
              <div className="flex items-center gap-2">
                <span className="font-medium">Stock Quantity:</span>
                {selectedVariant.quantity > 0 ? (
                  <span className="text-success">
                    {selectedVariant.quantity} available
                  </span>
                ) : (
                  <span className="text-destructive">Out of stock</span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <span className="font-medium">SKU:</span>
                <span className="px-2 py-0.5 font-mono bg-muted-foreground/10">
                  {selectedVariant.sku || "N/A"}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
