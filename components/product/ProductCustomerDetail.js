"use client";

import { Label } from "../ui/label";
import { useMemo, useState, useEffect, useCallback } from "react";
import { Button } from "../ui/button";
import { ShoppingBag, ShoppingCart } from "lucide-react";
import Link from "next/link";
import { FaFacebookF, FaInstagram } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { formatCurrency } from "@/lib/utils";
import ProductVariantSelector from "./ProductVariantSelector";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import useCartStore from "@/store/useCartStore";
import { toast } from "sonner";
import { Badge } from "../ui/badge";

export default function ProductCustomerDetail({ product }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [selectedVariantId, setSelectedVariantId] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const addToCart = useCartStore((state) => state.addToCart);

  // Get the selected variant object
  const selectedVariant = useMemo(() => {
    if (!selectedVariantId) return null;
    return product.variants_lookup.find((v) => v.id === selectedVariantId);
  }, [selectedVariantId, product.variants_lookup]);

  // Update URL with variant_id
  const updateURL = useCallback(
    (variantId) => {
      const params = new URLSearchParams();

      if (variantId) {
        params.set("variant", variantId);
      }

      // Build the new URL
      const newUrl = params.toString()
        ? `${pathname}?${params.toString()}`
        : pathname;

      // Only update if URL actually changed
      const currentUrl = `${pathname}${window.location.search}`;
      if (currentUrl !== newUrl) {
        router.replace(newUrl, { scroll: false });
      }
    },
    [pathname, router]
  );

  // Handle variant selection from child component
  const handleVariantChange = useCallback((variant) => {
    setSelectedVariantId(variant?.id || null);
  }, []);

  // Read variant_id from URL on mount
  useEffect(() => {
    const variantIdParam = searchParams.get("variant");

    let validVariantId = null;

    // Validate variant exists in product
    if (variantIdParam) {
      const variantExists = product.variants_lookup.find(
        (v) => v.id === variantIdParam
      );
      if (variantExists) {
        validVariantId = variantIdParam;
      }
    }

    // Set initial state (null if no valid variant in URL)
    setSelectedVariantId(validVariantId);
    setIsInitialized(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  // Sync state changes to URL (after initialization)
  useEffect(() => {
    if (!isInitialized) return;
    updateURL(selectedVariantId);
  }, [selectedVariantId, isInitialized, updateURL]);

  const handleAddToBag = async () => {
    if (!selectedVariant) {
      toast.error("Please select a color and size");
      return;
    }

    if (selectedVariant.quantity <= 0) {
      toast.error("This variant is out of stock");
      return;
    }

    const variantWithProduct = {
      ...selectedVariant,
      product: {
        id: product.id,
        name: product.name,
        base_price: product.base_price,
        discount_percentage: product.discount_percentage,
        banner_image_url: product.banner_image_url,
      },
    };

    await addToCart(variantWithProduct, 1);
  };

  return (
    <div>
      <div className="space-y-4">
        <h1 className="text-5xl font-bold font-poppins leading-14">
          {product.name}
        </h1>
        <div className="flex items-center gap-4">
          <span className="text-2xl text-foreground/80 tracking-wide">
            {formatCurrency(product.base_price)}
          </span>
          {selectedVariant?.quantity <= 0 && (
            <Badge variant="destructive">Sold Out</Badge>
          )}
        </div>
      </div>

      <hr className="my-8 border-border" />

      <div className="space-y-6">
        {/* Color & Size selection with variant_id URL sync */}
        <ProductVariantSelector
          product={product}
          variant="customer"
          showTitle={true}
          selectedVariantId={selectedVariantId}
          onVariantChange={handleVariantChange}
        />

        {/* Description */}
        <div className="space-y-2.5 mt-4">
          <Label className="text-sm font-bold font-poppins uppercase tracking-widest">
            Description
          </Label>
          <p className="text-foreground">{product.description}</p>
        </div>

        {/* Add to Cart */}
        <Button
          className="w-full py-6 font-semibold font-poppins disabled:cursor-not-allowed"
          size="lg"
          variant="outline"
          disabled={!selectedVariant || selectedVariant.quantity <= 0}
          onClick={handleAddToBag}
        >
          <ShoppingCart />
          {selectedVariant?.quantity <= 0 ? "Out of Stock" : "Add to Cart"}
        </Button>

        {/* Shop more */}
        <Button className="w-full py-6 font-semibold font-poppins">
          <ShoppingBag />
          Shop more
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
