import { create } from "zustand";
import { persist } from "zustand/middleware";
// import { updateCartItemAction } from "@/actions/cart";
// import { removeFromCartAction } from "@/actions/cart";

import { toast } from "sonner";
import useAuthStore from "./useAuthStore";

import { addToCartAction } from "@/actions/cart-action";
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

          toast.success("Updated quantity in bag!");
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
          toast.success("Added to bag!");
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

      // Fetch cart from database
      fetchCart: async () => {
        console.log("🛒 fetchCart called");
        const userId = useAuthStore.getState().user?.id;
        console.log("🛒 userId:", userId);

        if (!userId) {
          console.log("🛒 No userId, clearing cart");
          set({ items: [] });
          return;
        }

        set({ isLoading: true });
        console.log("🛒 Starting cart fetch...");

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
          console.error("🛒 Error:", error);
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

      // // Remove from cart
      // removeFromCart: async (cartItemId) => {
      //   // Optimistic update
      //   const previousItems = get().items;
      //   set((state) => ({
      //     items: state.items.filter((item) => item.id !== cartItemId),
      //   }));

      //   toast.success("Removed from bag");

      //   // Sync to database
      //   try {
      //     const result = await removeFromCartAction(cartItemId);

      //     if (result.error) {
      //       // Rollback
      //       set({ items: previousItems });
      //       toast.error(result.error);
      //     }
      //   } catch (error) {
      //     set({ items: previousItems });
      //     toast.error("Failed to remove item");
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
