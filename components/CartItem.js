import Image from "next/image";
import { Button } from "./ui/button";
import { Loader2, Minus, Plus, Trash } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { Input } from "./ui/input";
import useCartStore from "@/store/useCartStore";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { useDebouncedCallback } from "use-debounce";
import MiniSpinner from "./MiniSpinner";

export default function CartItem({ item }) {
  const variant = item.variant;
  const product = variant.product;
  const stockAvailable = variant.quantity;

  const removeFromCart = useCartStore((state) => state.removeFromCart);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const isOperationPending = useCartStore((state) => state.isOperationPending);

  const hasDiscount = product.discount_percentage > 0;
  const discountPercentage = product.discount_percentage;
  const discountedPrice = product.base_price * (1 - discountPercentage / 100);

  // LOCAL STATE - allows temporary invalid values
  const [inputValue, setInputValue] = useState(item.quantity.toString());
  const [isUpdating, setIsUpdating] = useState(false);

  const isPending = isOperationPending(item.id);

  // Sync local state when store updates (e.g., from server)
  useEffect(() => {
    setInputValue(item.quantity.toString());
  }, [item.quantity]);

  const debouncedUpdate = useDebouncedCallback(async (itemId, newQuantity) => {
    setIsUpdating(true);

    try {
      await updateQuantity(itemId, newQuantity);
    } finally {
      setIsUpdating(false);
    }
  }, 500);

  const canIncrease = item.quantity < stockAvailable;
  const isLowStock = stockAvailable <= 5 && stockAvailable > 0;
  const isOutOfStock = stockAvailable === 0;

  const handleIncrease = () => {
    if (item.quantity < stockAvailable) {
      const newQuantity = item.quantity + 1;
      setInputValue(newQuantity.toString());
      setIsUpdating(true);

      // Cancel previous debounced call, schedule new one
      debouncedUpdate(item.id, newQuantity);
    }
  };

  const handleDecrease = () => {
    if (item.quantity > 1) {
      const newQuantity = item.quantity - 1;
      setInputValue(newQuantity.toString());
      setIsUpdating(true);

      // Cancel previous debounced call, schedule new one
      debouncedUpdate(item.id, newQuantity);
    }
  };
  const handleInputChange = (e) => {
    const rawValue = e.target.value;

    // Allow empty input (user is typing)
    setInputValue(rawValue);

    // Don't validate/update until user enters a valid number
    const value = parseInt(rawValue);

    if (rawValue === "" || isNaN(value)) {
      // User is typing or cleared input - allow it
      return;
    }

    // Now validate the number
    if (value < 1) {
      toast.error("Quantity must be at least 1");
      return;
    }

    if (value > stockAvailable) {
      toast.error(`Only ${stockAvailable} items available in stock`);
      return;
    }

    // Valid number - update store
    updateQuantity(item.id, value);
  };

  // Handle when user leaves input (blur)
  const handleBlur = () => {
    const value = parseInt(inputValue);

    // If empty or invalid, reset to current quantity
    if (inputValue === "" || isNaN(value) || value < 1) {
      setInputValue(item.quantity.toString());
      toast.error("Invalid quantity - reset to previous value");
      return;
    }

    // If exceeds stock, cap it
    if (value > stockAvailable) {
      updateQuantity(item.id, stockAvailable);
      toast.warning(
        `Only ${stockAvailable} items available. Quantity adjusted.`
      );
      return;
    }

    // Valid - ensure store is updated
    if (value !== item.quantity) {
      updateQuantity(item.id, value);
    }
  };

  const handleRemove = async () => {
    if (isPending) return; // Prevent double-click
    await removeFromCart(item.id);
  };

  return (
    <div className="flex gap-4 relative">
      {/* Product Image */}
      <div className="relative w-24 h-24 flex-shrink-0">
        <Image
          src={product.banner_image_url}
          alt={product.name}
          fill
          className="object-cover object-center"
        />
      </div>

      {/* Product Info */}
      <div className="flex-1 space-y-2">
        <h4 className="font-jost text-lg line-clamp-1">
          {product.name}{" "}
          <span className="text-sm text-muted-foreground">
            (&minus;{discountPercentage}%)
          </span>
        </h4>

        {/* Color and Size */}
        <div className="text-sm text-muted-foreground flex flex-col">
          <span>Color: {variant.colors?.name}</span>
          <span>Size: {variant.sizes?.name}</span>
        </div>

        {/* Stock Warning */}
        {isLowStock && (
          <p className="text-xs text-warning font-medium">
            Only {stockAvailable} left in stock!
          </p>
        )}

        {isOutOfStock && (
          <p className="text-xs text-destructive font-medium">
            Out of stock - Please remove from cart
          </p>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Button
              variant="outline"
              size="sm"
              onClick={handleDecrease}
              disabled={item.quantity <= 1 || isOutOfStock || isUpdating}
            >
              <Minus className="scale-80" />
            </Button>
            <Input
              type="number"
              min="1"
              max={stockAvailable}
              value={inputValue} // ← Use local state
              onChange={handleInputChange}
              onBlur={handleBlur} // ← Validate on blur
              disabled={isOutOfStock}
              className="w-16 focus-visible:ring-0 text-center md:text-base no-spin-buttons"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={handleIncrease}
              disabled={isOutOfStock || !canIncrease || isUpdating}
            >
              <Plus className="scale-80 " />
            </Button>
          </div>

          <span className="text-lg font-jost">
            {hasDiscount ? (
              <div className="flex flex-col items-end">
                <span className="text-sm text-muted-foreground line-through">
                  {formatCurrency(product.base_price * item.quantity)}
                </span>

                <span>{formatCurrency(discountedPrice * item.quantity)}</span>
              </div>
            ) : (
              <span className="text-lg font-jost">
                {formatCurrency(
                  item.variant.product.base_price * item.quantity
                )}
              </span>
            )}
          </span>
        </div>
      </div>

      <Button
        variant="ghost"
        size="sm"
        className="absolute -right-2 top-0"
        onClick={handleRemove}
        disabled={isPending}
      >
        {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash />}
      </Button>
    </div>
  );
}
