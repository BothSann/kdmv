"use server";

import {
  createCartItem,
  getCartItem,
  updateCartItemQuantity,
} from "@/lib/api/server/carts";

export async function addToCartAction(userId, variantId, quantity = 1) {
  try {
    // Check if item already exists
    const { cartItem: existingCartItem, error: getError } = await getCartItem(
      userId,
      variantId
    );

    console.log("existingCartItem", existingCartItem);

    if (getError) {
      return { error: getError };
    }

    if (existingCartItem) {
      // Update quantity if already in cart
      const { cartItem, error } = await updateCartItemQuantity(
        existingCartItem.id,
        existingCartItem.quantity + quantity
      );

      if (error) return { error };

      return {
        success: true,
        message: "Cart item updated successfully",
        cartItem,
      };
    } else {
      // Insert new cart item
      const { cartItem, error } = await createCartItem(
        userId,
        variantId,
        quantity
      );

      if (error) return { error };

      return {
        success: true,
        message: "Cart item added successfully",
        cartItem,
      };
    }
  } catch (error) {
    console.error("Error adding item to cart:", error);
    return { error: "Failed to add item to cart" };
  }
}
