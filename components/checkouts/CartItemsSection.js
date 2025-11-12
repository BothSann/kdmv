"use client";

import CheckoutItem from "@/components/CheckoutItem";
import useCartStore from "@/store/useCartStore";

/**
 * Client Component - Displays cart items (read-only)
 * Uses cart store for item count
 */
export default function CartItemsSection({ items }) {
  const count = useCartStore((state) => state.itemCount());

  return (
    <div>
      <h2 className="text-2xl font-bold mb-8 font-poppins">
        Your Items ({count})
      </h2>
      <div className="space-y-6 max-h-[28rem] overflow-y-auto scrollbar-hide">
        {items.map((item) => (
          <CheckoutItem key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}
