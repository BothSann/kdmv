"use client";

import { Label } from "../ui/label";
import { useMemo, useState, useEffect, useCallback } from "react";
import { Button } from "../ui/button";
import { Loader2, MoveRight, ShoppingBag, ShoppingCart } from "lucide-react";
import Link from "next/link";
import { FaFacebookF, FaInstagram } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { formatCurrency } from "@/lib/utils";
import ProductVariantSelector from "./ProductVariantSelector";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import useCartStore from "@/store/useCartStore";
import { toast } from "sonner";
import { Badge } from "../ui/badge";
import MiniSpinner from "../MiniSpinner";

export default function ProductCustomerDetail({ product }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [selectedVariantId, setSelectedVariantId] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  const addToCart = useCartStore((state) => state.addToCart);
  const items = useCartStore((state) => state.items);

  const hasDiscount = product.discount_percentage > 0;
  const discountedPrice = product.discounted_price;

  // Get the selected variant object
  const selectedVariant = useMemo(() => {
    if (!selectedVariantId) return null;
    return product.variants_lookup.find((v) => v.id === selectedVariantId);
  }, [selectedVariantId, product.variants_lookup]);

  // Check how many of this variant are already in cart
  const quantityInCart = useMemo(() => {
    if (!selectedVariantId) return 0;

    const cartItem = items.find(
      (item) => item.product_variant_id === selectedVariantId
    );

    return cartItem ? cartItem.quantity : 0;
  }, [items, selectedVariantId]);

  // Calculate remaining stock
  const remainingStock = useMemo(() => {
    if (!selectedVariant) return 0;
    return selectedVariant.quantity - quantityInCart;
  }, [selectedVariant, quantityInCart]);

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
    setIsAddingToCart(true);
    if (!selectedVariant) {
      toast.error("Please select a color and size");
      return;
    }

    // Check if out of stock
    if (selectedVariant.quantity <= 0) {
      toast.error("This variant is out of stock");
      return;
    }

    // NEW: Check if adding more would exceed stock
    if (quantityInCart >= selectedVariant.quantity) {
      toast.error(
        `You already have the maximum available quantity (${selectedVariant.quantity}) in your cart`
      );
      return;
    }

    // NEW: Check remaining stock
    if (remainingStock <= 0) {
      toast.error("No more stock available for this variant");
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
    setIsAddingToCart(false);
  };

  return (
    <div>
      <div className="space-y-3 lg:space-y-4.5">
        <h1 className="text-5xl font-bold font-poppins leading-14">
          {product.name}
        </h1>
        <div className="flex items-center gap-4">
          {hasDiscount > 0 && (
            <span className="text-[1.4rem] lg:text-2xl text-foreground/80 tracking-wide flex items-center gap-2">
              <span className="line-through">
                {formatCurrency(product.base_price)}
              </span>
              <MoveRight />
              <span>{formatCurrency(discountedPrice)}</span>
            </span>
          )}

          {!hasDiscount && (
            <span className="text-2xl text-foreground/80 tracking-wide flex items-center gap-2">
              <span>{formatCurrency(product.base_price)}</span>
            </span>
          )}

          {selectedVariant?.quantity <= 0 && (
            <Badge variant="destructive">Sold Out</Badge>
          )}

          {selectedVariant && quantityInCart > 0 && remainingStock <= 10 && (
            <Badge variant="secondary">
              {quantityInCart} in cart ({remainingStock} left)
            </Badge>
          )}

          {selectedVariant &&
            remainingStock <= 0 &&
            selectedVariant.quantity > 0 && (
              <Badge variant="outline" className="border-warning text-warning">
                Max quantity in cart
              </Badge>
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

        {selectedVariant && remainingStock > 0 && remainingStock <= 3 && (
          <div className="bg-warning-bg dark:bg-warning-dark-bg border border-warning-border dark:border-warning-dark-border p-3">
            <p className="text-sm text-warning dark:text-warning-dark-text">
              Only {remainingStock} more can be added to cart
              {quantityInCart > 0 && ` (${quantityInCart} already in cart)`}
            </p>
          </div>
        )}

        {/* Description */}
        {product.description && (
          <div className="space-y-2.5 mt-4">
            <Label className="text-sm font-bold font-poppins uppercase tracking-widest">
              Description
            </Label>
            <p className="text-foreground text-sm lg:text-base">
              {product.description}
            </p>
          </div>
        )}

        {/* Add to Cart Button */}
        <Button
          className="w-full py-6 font-semibold font-poppins disabled:cursor-not-allowed"
          size="lg"
          variant="outline"
          disabled={
            !selectedVariant ||
            selectedVariant.quantity <= 0 ||
            remainingStock <= 0 ||
            isAddingToCart
          }
          onClick={handleAddToBag}
        >
          <ShoppingCart />
          {!selectedVariant && "Select variant"}
          {selectedVariant?.quantity <= 0 && "Out of Stock"}
          {selectedVariant &&
            selectedVariant.quantity > 0 &&
            remainingStock <= 0 &&
            "Max in Cart"}
          {selectedVariant &&
            selectedVariant.quantity > 0 &&
            remainingStock > 0 &&
            "Add to Cart"}
          {isAddingToCart && <Loader2 className="animate-spin" />}
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
