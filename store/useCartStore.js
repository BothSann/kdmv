import { create } from "zustand";
import { persist } from "zustand/middleware";

import { toast } from "sonner";
import useAuthStore from "./useAuthStore";

import { addToCartAction, removeFromCartAction } from "@/actions/cart-action";
import { getUserCart } from "@/lib/api/client/carts";

const useCartStore = create(
  persist(
    (set, get) => ({
      // State
      items: [],
      isLoading: false,
      isDrawerOpen: false,
      _hasHydrated: false, // Internal flag

      // Computed values
      itemCount: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },

      totalPrice: () => {
        return get().items.reduce(
          (total, item) =>
            total + item.variant.product.base_price * item.quantity,
          0
        );
      },

      // Actions
      setDrawerOpen: (isOpen) => set({ isDrawerOpen: isOpen }),

      // Add to cart with optimistic update
      addToCart: async (variant, quantity = 1) => {
        const userId = useAuthStore.getState().user?.id;
        const isAuthenticated =
          useAuthStore.getState().user?.role === "authenticated";

        if (!userId && !isAuthenticated) {
          toast.error("Please login to add items to cart");
          return;
        }

        // Check if variant already exists in cart
        const existingItem = get().items.find(
          (item) => item.product_variant_id === variant.id
        );

        if (existingItem) {
          // Update quantity of existing item
          set((state) => ({
            items: state.items.map((item) =>
              item.product_variant_id === variant.id
                ? { ...item, quantity: item.quantity + quantity }
                : item
            ),
          }));

          toast.success("Updated quantity in your cart");
        } else {
          // Add new item
          const optimisticItem = {
            id: `temp-${Date.now()}`,
            product_variant_id: variant.id,
            quantity,
            variant, // Full variant object with colors, sizes, product info
          };

          set((state) => ({
            items: [...state.items, optimisticItem],
            isDrawerOpen: true,
          }));
          toast.success("Item successfully added to your cart");
        }

        // Sync to database
        try {
          const result = await addToCartAction(userId, variant.id, quantity);

          if (result.error) {
            // Rollback on error - revert the optimistic update
            if (existingItem) {
              set((state) => ({
                items: state.items.map((item) =>
                  item.product_variant_id === variant.id
                    ? { ...item, quantity: existingItem.quantity }
                    : item
                ),
              }));
            } else {
              set((state) => ({
                // Remove temp item
                items: state.items.filter(
                  (item) => !item.id.startsWith("temp-")
                ),
              }));
            }

            toast.error(result.error);
          } else if (!existingItem) {
            // Replace temp ID with real ID only for new items
            set((state) => ({
              items: state.items.map((item) =>
                item.id.startsWith("temp-")
                  ? { ...item, id: result.cartItem.id }
                  : item
              ),
            }));
          }
        } catch (error) {
          // Rollback on error
          if (existingItem) {
            set((state) => ({
              items: state.items.map((item) =>
                item.product_variant_id === variant.id
                  ? { ...item, quantity: existingItem.quantity }
                  : item
              ),
            }));
          } else {
            set((state) => ({
              items: state.items.filter((item) => !item.id.startsWith("temp-")),
            }));
          }
          toast.error("Failed to add item to cart");
        }
      },

      // Remove from cart
      removeFromCart: async (cartItemId) => {
        // 1. Get user info
        const userId = useAuthStore.getState().user?.id;
        const isAuthenticated =
          useAuthStore.getState().user?.role === "authenticated";

        // 2. Guard: Must be authenticated to remove from cart
        if (!userId && !isAuthenticated) {
          toast.error("Please login to remove items from cart");
          return;
        }

        // 3. Save current state (for rollback if error)
        const previousItems = get().items;

        // 4. OPTIMISTIC UPDATE - Remove immediately from U
        set((state) => ({
          items: state.items.filter((item) => item.id !== cartItemId),
        }));

        // 5. Show success toast immediately
        toast.success("Item successfully removed from your cart");

        // 6. Sync to database (background operation)
        try {
          const result = await removeFromCartAction(cartItemId, userId);

          if (result.error) {
            // 7a. ERROR: Rollback - restore item
            set({ items: previousItems });
            toast.error(result.error);
          }
          // 7b. SUCCESS: Item stays removed (already done in step 4)
        } catch (error) {
          set({ items: previousItems });
          toast.error("Failed to remove item");
        }
      },

      // Fetch cart from database
      fetchCart: async () => {
        const userId = useAuthStore.getState().user?.id;

        if (!userId) {
          set({ items: [] });
          return;
        }

        set({ isLoading: true });

        try {
          const result = await getUserCart(userId);

          if (result.success) {
            const transformedItems = result.cartItems.map((item) => ({
              id: item.id,
              product_variant_id: item.product_variant_id,
              quantity: item.quantity,
              variant: item.product_variants,
              added_at: item.added_at,
            }));

            set({ items: transformedItems, isLoading: false });
          } else {
            set({ isLoading: false });
            console.error("Failed to fetch cart:", result.error);
          }
        } catch (error) {
          console.error("Error:", error);
          set({ isLoading: false });
        }
      },

      // // Update quantity
      // updateQuantity: async (cartItemId, newQuantity) => {
      //   if (newQuantity < 1) return;

      //   // Optimistic update
      //   const previousItems = get().items;
      //   set((state) => ({
      //     items: state.items.map((item) =>
      //       item.id === cartItemId ? { ...item, quantity: newQuantity } : item
      //     ),
      //   }));

      //   // Sync to database
      //   try {
      //     const result = await updateCartItemAction(cartItemId, newQuantity);

      //     if (result.error) {
      //       // Rollback
      //       set({ items: previousItems });
      //       toast.error(result.error);
      //     }
      //   } catch (error) {
      //     set({ items: previousItems });
      //     toast.error("Failed to update quantity");
      //   }
      // },

      // Clear cart
      clearCart: () => set({ items: [] }),
    }),
    {
      name: "cart-storage", // LocalStorage key
      partialize: (state) => ({ items: state.items }), // Only persist items
      onRehydrateStorage: () => (state) => {
        state._hasHydrated = true;
      },
    }
  )
);

export default useCartStore;
