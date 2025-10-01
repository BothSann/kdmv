"use client";

import { useState } from "react";
import { CircleDollarSign, LayoutGrid, Package, Tag } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency } from "@/lib/utils";
import ProductVariantSelector from "./ProductVariantSelector";

export default function ProductAdminDetail({ product }) {
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);

  // Handle selection changes from the ProductVariantSelector component
  const handleSelectionChange = (selection) => {
    if (selection) {
      setSelectedColor(selection.color);
      setSelectedSize(selection.size);
      setSelectedVariant(selection.variant);
    } else {
      setSelectedColor(null);
      setSelectedSize(null);
      setSelectedVariant(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
        {/* Price */}
        <div className="hover:border-primary/30 bg-muted border p-4 flex items-center gap-4">
          <CircleDollarSign className="text-muted-foreground self-start" />
          <div className="flex flex-col gap-1">
            <span className="text-sm text-muted-foreground">Base Price</span>
            <span className="font-semibold">
              {formatCurrency(product.base_price)}
            </span>
          </div>
        </div>

        <div className="hover:border-primary/30 bg-muted border p-4 flex items-center gap-4">
          <Tag className="text-muted-foreground self-start" />
          <div className="flex flex-col gap-1">
            <span className="text-sm text-muted-foreground">Discount</span>
            <span className="font-semibold">
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

        {/* Total Stock */}
        <div className="hover:border-primary/30 bg-muted border p-4 flex items-center gap-4">
          <Package className="text-muted-foreground self-start" />
          <div className="flex flex-col gap-1">
            <span className="text-sm text-muted-foreground">Total Stock</span>
            <span className="font-semibold">{product.total_stock}</span>
          </div>
        </div>

        {/* Category */}
        <div className="hover:border-primary/30 bg-muted border p-4 flex items-center gap-4">
          <LayoutGrid className="text-muted-foreground self-start" />
          <div className="flex flex-col gap-1">
            <span className="text-sm text-muted-foreground">Category</span>
            <span className="font-semibold">{product.category_name}</span>
          </div>
        </div>
      </div>

      {/* Below the grid */}
      <Card>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_2fr] gap-8">
            {/* Product Description */}
            <div className="flex flex-col gap-2">
              <h3 className="text-lg font-semibold">Product Description:</h3>
              <p className="text-sm text-muted-foreground">
                {product.description}
              </p>
            </div>

            {/* Product Code, Subcategory, Slug using table */}

            <Table className="border">
              <TableBody className="text-sm">
                <TableRow>
                  <TableCell className="font-medium ">Product Code</TableCell>
                  <TableCell className="text-right text-base font-mono text-muted-foreground">
                    {product.product_code}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Subcategory</TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {product.subcategory_name}
                  </TableCell>
                </TableRow>
                {/* Collection - Only show if product belongs to a collection */}
                {product.collection_name && (
                  <TableRow>
                    <TableCell className="font-medium">Collection</TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {product.collection_name}
                    </TableCell>
                  </TableRow>
                )}
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

          {/* Product Quantity Details With All Color/Size x Quantity */}
          <div className="space-y-2 mt-10">
            <h3 className="text-lg font-semibold">
              Inventory by Color & Size:
            </h3>

            <Table className="border">
              <TableHeader>
                <TableRow className="bg-muted">
                  <TableHead className="font-semibold">Color</TableHead>
                  {product.available_sizes.map((size) => (
                    <TableHead
                      key={size.id}
                      className="text-center font-medium"
                    >
                      {size.name}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>

              <TableBody>
                {product.available_colors.map((color) => (
                  <TableRow key={color.id} className="text-sm">
                    <TableCell className="font-medium">{color.name}</TableCell>
                    {product.available_sizes.map((size) => {
                      const variant = product.variants_lookup.find(
                        (v) =>
                          v.colors?.id === color.id && v.sizes?.id === size.id
                      );
                      return (
                        <TableCell
                          key={`${color.id}-${size.id}`}
                          className="text-center"
                        >
                          {variant ? variant.quantity : "N/A"}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Variant Selection using ProductVariantSelector */}
          <div className="mt-10">
            <ProductVariantSelector
              product={product}
              variant="admin"
              showTitle={true}
              onSelectionChange={handleSelectionChange}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
