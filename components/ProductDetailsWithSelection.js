"use client";

import { useState, useMemo } from "react";
import { CircleDollarSign, LayoutGrid, Package, Tag } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { formatCurrency } from "@/lib/utils";

export default function ProductDetailsWithSelection({ product }) {
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

  // Get the specific variant SKU for selected color and size
  const selectedVariantSKU = useMemo(() => {
    if (!selectedColor || !selectedSize) return null;

    const variant = product.variants_lookup.find(
      (variant) =>
        variant.colors?.id === selectedColor &&
        variant.sizes?.id === selectedSize
    );

    return variant?.sku || null;
  }, [selectedColor, selectedSize, product.variants_lookup]);

  const handleColorChange = (colorId) => {
    setSelectedColor(colorId);
    setSelectedSize(null); // Reset size when color changes
  };

  // Determine what stock to display
  const displayStock =
    selectedVariantQuantity !== null
      ? selectedVariantQuantity
      : product.total_stock;
  const stockLabel =
    selectedVariantQuantity !== null
      ? "Selected Variant Stock"
      : "Total Available Stock";

  return (
    <div>
      <div className="grid grid-cols-4 gap-4 items-start mb-4 text-base">
        {/* Price */}
        <div className="hover:border-primary/30 bg-muted grid auto-cols-max grid-flow-col gap-4 rounded-lg border p-4">
          <CircleDollarSign className="text-muted-foreground" />
          <div className="flex flex-col gap-1">
            <span className="text-muted-foreground">Base Price</span>
            <span className="text-lg text-zinc-800 font-semibold">
              {formatCurrency(product.base_price)}
            </span>
          </div>
        </div>

        <div className="hover:border-primary/30 bg-muted grid auto-cols-max grid-flow-col gap-4 rounded-lg border p-4">
          <Tag className="text-muted-foreground" />
          <div className="flex flex-col gap-1">
            <span className="text-muted-foreground">Discount</span>
            <span className="text-lg text-zinc-800 font-semibold">
              {product.has_discount ? (
                <>
                  {formatCurrency(product.discounted_price)}{" "}
                  <span className="text-muted-foreground font-normal">
                    (-{product.discount_percentage}%)
                  </span>
                </>
              ) : (
                "No discount"
              )}
            </span>
          </div>
        </div>

        {/* Dynamic Stock Display */}
        <div className="hover:border-primary/30 bg-muted grid auto-cols-max grid-flow-col gap-4 rounded-lg border p-4">
          <Package className="text-muted-foreground" />
          <div className="flex flex-col gap-1">
            <span className="text-muted-foreground">{stockLabel}</span>
            <span className="text-lg text-zinc-800 font-semibold">
              {displayStock}
            </span>
          </div>
        </div>

        {/* Category / Subcategory */}
        <div className="hover:border-primary/30 bg-muted grid auto-cols-max grid-flow-col gap-4 rounded-lg border p-4">
          <LayoutGrid className="text-muted-foreground" />
          <div className="flex flex-col gap-1">
            <span className="text-muted-foreground">
              Category / Subcategory
            </span>
            <span className="text-lg text-zinc-800 font-semibold">
              {product.category_name} / {product.subcategory_name}
            </span>
          </div>
        </div>
      </div>

      {/* Below the grid */}
      <Card>
        <CardContent>
          <div className="grid grid-cols-[2fr_1fr] gap-4">
            {/* Product Description */}
            <div className="flex flex-col gap-2">
              <h3 className="text-xl font-semibold">Product Description:</h3>
              <p className="text-base text-muted-foreground">
                {product.description}
              </p>
            </div>

            {/* Product Code, Subcategory, Slug using table */}
            <div className="rounded-md border">
              <Table>
                <TableBody className="text-base">
                  <TableRow>
                    <TableCell className="font-medium">Product Code</TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {product.product_code}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Subcategory</TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {product.subcategory_name}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Total Stock</TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {product.total_stock}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Slug</TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {product.slug}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Variant Selection */}
          <div className="grid grid-cols-max gap-4 gap-y-8 mt-6">
            {/* Available Colors */}
            <div className="flex flex-col gap-2">
              <h3 className="text-xl font-semibold">Available Colors:</h3>
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
                      className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-base font-medium cursor-pointer hover:bg-gray-50 peer-data-[state=checked]:bg-black peer-data-[state=checked]:text-white peer-data-[state=checked]:border-black [&:has([data-state=checked])]:bg-black [&:has([data-state=checked])]:text-white [&:has([data-state=checked])]:border-black transition-colors "
                    >
                      {color.name}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            {/* Available Sizes - Only show sizes for selected color */}
            <div className="flex flex-col gap-2">
              <h3 className="text-xl font-semibold">Available Sizes:</h3>
              {selectedColor ? (
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
                        className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-base font-medium cursor-pointer hover:bg-gray-50 peer-data-[state=checked]:bg-black peer-data-[state=checked]:text-white peer-data-[state=checked]:border-black [&:has([data-state=checked])]:bg-black [&:has([data-state=checked])]:text-white [&:has([data-state=checked])]:border-black transition-colors"
                      >
                        {size.name}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              ) : (
                <p className="text-base text-muted-foreground">
                  Please select a color first to see available sizes
                </p>
              )}
            </div>

            {/* Selected Variant Info */}
            {selectedColor && selectedSize && (
              <div className="flex flex-col gap-2 p-4 bg-muted">
                <h3 className="text-lg font-semibold">Product Details:</h3>
                <div className="grid grid-cols-2 text-base">
                  <div>
                    <span className="font-medium">Color:</span>{" "}
                    {
                      product.available_colors.find(
                        (c) => c.id === selectedColor
                      )?.name
                    }
                  </div>
                  <div>
                    <span className="font-medium">Size:</span>{" "}
                    {
                      availableSizesForColor.find((s) => s.id === selectedSize)
                        ?.name
                    }
                  </div>
                </div>

                <div className="grid grid-cols-2 text-base">
                  <div>
                    <span className="font-medium ">Stock Quantity:</span>{" "}
                    {selectedVariantQuantity > 0 ? (
                      <span className="text-green-600">
                        {selectedVariantQuantity} available
                      </span>
                    ) : (
                      <span className="text-red-500">Out of stock</span>
                    )}
                  </div>

                  {/* SKU */}
                  <div>
                    <span className="font-medium">SKU:</span>{" "}
                    <span className="text-muted-foreground font-mono">
                      {selectedVariantSKU || "N/A"}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
