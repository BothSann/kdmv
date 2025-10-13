import { create } from "zustand";
import { persist } from "zustand/middleware";

import { toast } from "sonner";
import useAuthStore from "./useAuthStore";

import {
  addToCartAction,
  getUserCartAction,
  removeFromCartAction,
  updateCartItemQuantityAction,
} from "@/actions/cart-action";

const useCartStore = create(
  persist(
    (set, get) => ({
      // State
      items: [],
      isLoading: false,
      isDrawerOpen: false,
      _hasHydrated: false, // Internal flag
      pendingOperations: new Set(), // Track ongoing operations

      // Computed values
      itemCount: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },

      totalPrice: () => {
        return get().items.reduce((total, item) => {
          const product = item.variant.product;
          const basePrice = product.base_price;
          const discountPercentage = product.discount_percentage; // Can be 0 or null if no discount
          const quantity = item.quantity;

          // Calculate the price per unit considering the discount
          let pricePerUnit = basePrice;
          if (discountPercentage && discountPercentage > 0) {
            pricePerUnit = basePrice * (1 - discountPercentage / 100);
          }

          // Add the cost of this item type (price per unit * quantity) to the total
          return total + pricePerUnit * quantity;
        }, 0);
      },

      // Actions
      setDrawerOpen: (isOpen) => set({ isDrawerOpen: isOpen }),

      // Add to cart with optimistic update
      addToCart: async (variant, quantity = 1) => {
        const userId = useAuthStore.getState().user?.id;
        if (!userId) {
          toast.error("Please login to add items to cart");
          return { success: false };
        }

        // Show loading state
        const loadingToast = toast.loading("Adding to cart...");

        try {
          const result = await addToCartAction(userId, variant.id, quantity);

          if (result.error) {
            toast.error(result.error, { id: loadingToast });
            return { success: false, error: result.error };
          }

          // Fetch fresh cart from server
          await get().fetchCart();

          toast.success("Item added to cart", { id: loadingToast });
          set({ isDrawerOpen: true });

          return { success: true };
        } catch (error) {
          console.error("Error adding item to cart:", error);
          toast.error("Failed to add item to cart", { id: loadingToast });
          return { success: false, error: error.message };
        }
      },

      // Remove from cart
      removeFromCart: async (cartItemId) => {
        const userId = useAuthStore.getState().user?.id;
        if (!userId) {
          toast.error("Please login to remove items from cart");
          return { success: false };
        }

        // Prevent duplicate operations
        if (get().pendingOperations.has(cartItemId)) {
          return { success: false, error: "Operation in progress" };
        }

        // Mark as pending
        set((state) => ({
          pendingOperations: new Set(state.pendingOperations).add(cartItemId),
        }));

        const loadingToast = toast.loading("Removing item...");

        try {
          const result = await removeFromCartAction(cartItemId, userId);

          if (result.error) {
            toast.error(result.error, { id: loadingToast });
            return { success: false, error: result.error };
          }

          // ✅ Fetch fresh cart from server
          await get().fetchCart();

          toast.success("Item removed from cart", { id: loadingToast });

          return { success: true };
        } catch (error) {
          console.error("Error removing item:", error);
          toast.error("Failed to remove item", { id: loadingToast });
          return { success: false, error: error.message };
        } finally {
          // Remove from pending
          set((state) => {
            const newPending = new Set(state.pendingOperations);
            newPending.delete(cartItemId);
            return { pendingOperations: newPending };
          });
        }
      },

      // Update cart item quantity
      updateQuantity: async (cartItemId, newQuantity) => {
        if (newQuantity < 1) {
          toast.error("Quantity cannot be less than 1");
          return { success: false };
        }

        const userId = useAuthStore.getState().user?.id;
        if (!userId) {
          toast.error("Please login to update quantity");
          return { success: false };
        }

        // Prevent duplicate operations
        if (get().pendingOperations.has(cartItemId)) {
          return { success: false, error: "Operation in progress" };
        }

        // Mark as pending
        set((state) => ({
          pendingOperations: new Set(state.pendingOperations).add(cartItemId),
        }));

        try {
          const result = await updateCartItemQuantityAction(
            cartItemId,
            newQuantity,
            userId
          );

          if (result.error) {
            if (result.maxQuantity !== undefined) {
              toast.error(result.error, {
                duration: 5000,
                action: {
                  label: `Set to ${result.maxQuantity}`,
                  onClick: () => {
                    get().updateQuantity(cartItemId, result.maxQuantity);
                  },
                },
              });
            } else {
              toast.error(result.error);
            }
            return { success: false, error: result.error };
          }

          // Fetch fresh cart from server
          await get().fetchCart();

          return { success: true };
        } catch (error) {
          console.error("Error updating quantity:", error);
          toast.error("Failed to update quantity");
          return { success: false, error: error.message };
        } finally {
          // Remove from pending
          set((state) => {
            const newPending = new Set(state.pendingOperations);
            newPending.delete(cartItemId);
            return { pendingOperations: newPending };
          });
        }
      },

      // Fetch cart from database
      fetchCart: async () => {
        const userId = useAuthStore.getState().user?.id;

        if (!userId) {
          set({ items: [], isLoading: false });
          return;
        }

        set({ isLoading: true });

        try {
          const result = await getUserCartAction(userId);

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
          console.error("Error fetching cart:", error);
          set({ isLoading: false });
        }
      },

      // Check if operation is pending
      isOperationPending: (cartItemId) => {
        return get().pendingOperations.has(cartItemId);
      },

      // Clear cart
      clearCart: () => set({ items: [] }),
    }),
    {
      name: "cart-storage", // LocalStorage key
      partialize: (state) => ({ items: state.items }), // Only persist items
      onRehydrateStorage: () => (state) => {
        state._hasHydrated = true;

        // ✅ IMPORTANT: Fetch fresh data from server after hydration
        const userId = useAuthStore.getState().user?.id;
        if (userId) {
          // Delay to ensure auth is ready
          setTimeout(() => {
            state.fetchCart();
          }, 100);
        }
      },
    }
  )
);

export default useCartStore;
