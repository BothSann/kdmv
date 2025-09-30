"use client";

import { Label } from "../ui/label";
import { useMemo, useState } from "react";
import { Button } from "../ui/button";
import { Handbag, ShoppingCart } from "lucide-react";
import Link from "next/link";
import { FaFacebookF, FaInstagram } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { formatCurrency } from "@/lib/utils";
import ProductVariantSelector from "./ProductVariantSelector";

export default function ProductCustomerDetail({ product }) {
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);

  // Optional: derive selected variant info if needed for buttons/disabled state
  const selectedVariant = useMemo(() => {
    if (!selectedColor || !selectedSize) return null;

    return product.variants_lookup.find(
      (v) => v.colors?.id === selectedColor && v.sizes?.id === selectedSize
    );
  }, [selectedColor, selectedSize, product.variants_lookup]);

  const handleSelectionChange = (selection) => {
    if (selection) {
      setSelectedColor(selection.color);
      setSelectedSize(selection.size);
    } else {
      setSelectedColor(null);
      setSelectedSize(null);
    }
  };

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

      <hr className="my-8 border-border" />

      <div className="space-y-6">
        {/* ✅ REPLACED: Color & Size selection */}
        <ProductVariantSelector
          product={product}
          variant="customer"
          showTitle={true}
          onSelectionChange={handleSelectionChange}
          className="space-y-6"
        />

        {/* Description */}
        <div className="space-y-2.5 mt-4">
          <Label className="text-sm font-bold font-poppins uppercase tracking-widest">
            Description
          </Label>
          <p className="text-foreground">{product.description}</p>
        </div>

        {/* Add to bag */}
        <Button
          className="w-full py-6 font-semibold font-poppins"
          size="lg"
          variant="outline"
          disabled={!selectedVariant || selectedVariant.quantity <= 0}
        >
          <Handbag />
          {selectedVariant?.quantity <= 0 ? "Out of Stock" : "Add to Bag"}
        </Button>

        {/* Shop more */}
        <Button className="w-full py-6 font-semibold font-poppins" asChild>
          <Link href="/">
            <ShoppingCart />
            Shop more
          </Link>
        </Button>

        {/* Share */}
        <div className="space-x-2 mt-4">
          <Button variant="link" asChild>
            <Link href="/">
              <FaFacebookF className="mr-1" />
              <span className="text-base">Share</span>
            </Link>
          </Button>

          <Button variant="link" asChild>
            <Link href="/">
              <FaInstagram className="mr-1" />
              <span className="text-base">Share</span>
            </Link>
          </Button>

          <Button variant="link" asChild>
            <Link href="/">
              <FaXTwitter className="mr-1" />
              <span className="text-base">Tweet</span>
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
