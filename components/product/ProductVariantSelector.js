"use client";

import { useState, useMemo, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

/**
 * Reusable variant selector for product color/size combinations.
 *
 * @param {Object} props
 * @param {Object} props.product - Product object with variants_lookup, available_colors, available_sizes
 * @param {"customer" | "admin"} [props.variant="customer"] - Styling and labeling variant
 * @param {boolean} [props.showTitle=true] - Whether to show section titles
 * @param {string} [props.className] - Additional container classes
 * @param {function} [props.onSelectionChange] - Callback when selection changes: (selection) => void
 * @param {Object} [props.selection] - Optional controlled selection { color: string, size: string }
 * @param {function} [props.onColorChange] - Required if controlled
 * @param {function} [props.onSizeChange] - Required if controlled
 */
export default function ProductVariantSelector({
  product,
  variant = "customer",
  showTitle = true,
  className = "",
  onSelectionChange,
  // Controlled props (optional)
  selection,
  onColorChange,
  onSizeChange,
}) {
  const isControlled = selection != null;

  const [internalColor, setInternalColor] = useState(null);
  const [internalSize, setInternalSize] = useState(null);

  const selectedColor = isControlled ? selection.color : internalColor;
  const selectedSize = isControlled ? selection.size : internalSize;

  const setSelectedColor = isControlled ? onColorChange : setInternalColor;
  const setSelectedSize = isControlled ? onSizeChange : setInternalSize;

  const isCustomer = variant === "customer";
  const isAdmin = variant === "admin";

  // Compute available sizes for selected color
  const availableSizesForColor = useMemo(() => {
    if (!selectedColor) return [];
    return product.variants_lookup
      .filter((v) => v.colors?.id === selectedColor)
      .map((v) => v.sizes)
      .filter(Boolean);
  }, [selectedColor, product.variants_lookup]);

  // Compute full selected variant object
  const selectedVariant = useMemo(() => {
    if (!selectedColor || !selectedSize) return null;
    return product.variants_lookup.find(
      (v) => v.colors?.id === selectedColor && v.sizes?.id === selectedSize
    );
  }, [selectedColor, selectedSize, product.variants_lookup]);

  // Notify parent of changes
  useEffect(() => {
    if (onSelectionChange) {
      if (selectedVariant) {
        onSelectionChange({
          color: selectedColor,
          size: selectedSize,
          quantity: selectedVariant.quantity ?? 0,
          variant: selectedVariant,
        });
      } else {
        onSelectionChange(null);
      }
    }
  }, [selectedColor, selectedSize, selectedVariant, onSelectionChange]);

  const handleColorChange = (colorId) => {
    setSelectedColor(colorId);
    setSelectedSize(null); // Reset size when color changes
  };

  // Styling config based on variant
  const config = useMemo(() => {
    if (variant === "admin") {
      return {
        colorLabel: "Available Colors:",
        sizeLabel: "Available Sizes:",
        labelClassName: "text-lg font-semibold text-foreground/90",
      };
    }
    // customer variant
    return {
      colorLabel: "Color",
      sizeLabel: "Size",
      labelClassName:
        "text-sm font-bold font-poppins uppercase tracking-[0.2em]",
    };
  }, [variant]);

  return (
    <div className={className}>
      {/* Color Selection */}
      <div className="space-y-2.5">
        {showTitle && (
          <Label className={config.labelClassName}>{config.colorLabel}</Label>
        )}
        <RadioGroup
          className="flex gap-2 flex-wrap"
          value={selectedColor}
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
                className={`flex items-center justify-center px-5 py-2.5 text-base text-foreground cursor-pointer border border-border transition-colors hover:bg-muted ${
                  selectedColor === color.id
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
          value={selectedSize}
          onValueChange={setSelectedSize}
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
                  className={`flex items-center justify-center px-5 py-2.5 text-base text-foreground cursor-pointer border border-border transition-colors hover:bg-muted ${
                    selectedSize === size.id
                      ? "bg-foreground text-background hover:bg-primary/90"
                      : ""
                  }`}
                >
                  {size.name}
                </Label>
              </div>
            ))
          ) : (
            <p className="text-base text-muted-foreground">
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
              {/* First column */}
              <div className="flex items-center gap-2">
                <span className="font-medium">Color:</span>
                <span>
                  {product.available_colors.find((c) => c.id === selectedColor)
                    ?.name || "N/A"}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="font-medium">Size:</span>
                <span>
                  {availableSizesForColor.find((s) => s.id === selectedSize)
                    ?.name || "N/A"}
                </span>
              </div>
            </div>

            {/* Second column */}
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
