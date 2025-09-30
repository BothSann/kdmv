"use client";

import { formatCurrency } from "@/lib/utils";
import { Label } from "../ui/label";
import { RadioGroup } from "../ui/radio-group";
import { RadioGroupItem } from "../ui/radio-group";
import { useMemo, useState } from "react";
import { Button } from "../ui/button";
import { Handbag, ShoppingCart } from "lucide-react";
import Link from "next/link";

export default function ProductCustomerDetail({ product }) {
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);

  // Get available sizes for the selected color
  const availableSizesForColor = useMemo(() => {
    if (!selectedColor) return [];

    const colorVariants = product.variants_lookup.filter(
      (variant) => variant.colors?.id === selectedColor
    );

    return colorVariants.map((variant) => variant.sizes).filter(Boolean);
  }, [selectedColor, product.variants_lookup]);

  // Get the specific variant quantity for selected color and size
  const selectedVariantQuantity = useMemo(() => {
    if (!selectedColor || !selectedSize) return null;

    const variant = product.variants_lookup.find(
      (variant) =>
        variant.colors?.id === selectedColor &&
        variant.sizes?.id === selectedSize
    );

    return variant?.quantity || 0;
  }, [selectedColor, selectedSize, product.variants_lookup]);

  const handleColorChange = (colorId) => {
    setSelectedColor(colorId);
    setSelectedSize(null); // Reset size when color changes
  };

  console.log(product);
  console.log("selectedColor", selectedColor);
  console.log("selectedVariantQuantity", selectedVariantQuantity);

  return (
    <div>
      <div className="space-y-4">
        <h1 className="text-5xl font-bold font-poppins leading-14">
          {product.name}
        </h1>
        <span className="text-2xl text-foreground/80 tracking-wide">
          {formatCurrency(product.base_price)}
        </span>
      </div>

      <hr className="my-10 border-border" />

      <div className="space-y-6">
        <div className="space-y-2.5">
          <Label className="text-xs font-bold font-poppins uppercase tracking-widest">
            Color
          </Label>

          <RadioGroup
            className="flex gap-2"
            value={selectedColor}
            onValueChange={handleColorChange}
          >
            {product.available_colors.map((color) => (
              <div key={color.id}>
                <RadioGroupItem
                  value={color.id}
                  id={color.id}
                  className="sr-only peer"
                />
                <Label
                  htmlFor={color.id}
                  className={`text-base flex items-center justify-center px-5 py-1.5 font-normal cursor-pointer border border-border transition-colors hover:bg-muted ${
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

        <div className="space-y-2.5">
          <Label className="text-xs font-bold font-poppins uppercase tracking-widest">
            Size
          </Label>

          <RadioGroup
            className="flex gap-2 flex-wrap"
            value={selectedSize}
            onValueChange={setSelectedSize}
          >
            {availableSizesForColor.map((size) => (
              <div key={size.id}>
                <RadioGroupItem
                  value={size.id}
                  id={size.id}
                  className="sr-only peer"
                />
                <Label
                  htmlFor={size.id}
                  className={`text-base flex items-center justify-center px-5 py-1.5 font-normal cursor-pointer border border-border hover:bg-muted transition-colors ${
                    selectedSize === size.id
                      ? "bg-foreground text-background hover:bg-primary/90"
                      : ""
                  }`}
                  s
                >
                  {size.name}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        <Button
          className="w-full py-6 font-semibold font-poppins"
          size="lg"
          variant="outline"
        >
          <Handbag />
          Add to bag
        </Button>

        <Button className="w-full py-6 font-semibold font-poppins" asChild>
          <Link href="/">
            <ShoppingCart />
            Shop more
          </Link>
        </Button>
      </div>
    </div>
  );
}
