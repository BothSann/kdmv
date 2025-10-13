"use server";

import {
  createCartItem,
  getCartItem,
  updateCartItemQuantity,
  removeFromCart,
} from "@/lib/api/server/carts";
import { createSupabaseServerClient } from "@/utils/supabase/server";

export async function addToCartAction(userId, variantId, quantity = 1) {
  try {
    // Check if item already exists
    const { cartItem: existingCartItem, error: getError } = await getCartItem(
      userId,
      variantId
    );

    if (getError) {
      return { error: getError };
    }

    // Get variant stock information
    const supabase = await createSupabaseServerClient();
    const { data: variant, error: variantError } = await supabase
      .from("product_variants")
      .select("quantity")
      .eq("id", variantId)
      .single();

    if (variantError || !variant) {
      return { error: "Product variant not found" };
    }

    const stockAvailable = variant.quantity;

    if (existingCartItem) {
      // Calculate new quantity
      const newQuantity = existingCartItem.quantity + quantity;

      // Check if new quantity exceeds stock
      if (newQuantity > stockAvailable) {
        return {
          error: `Cannot add ${quantity} more. Only ${stockAvailable} available and you already have ${existingCartItem.quantity} in cart.`,
          maxQuantity: stockAvailable,
          currentQuantity: existingCartItem.quantity,
        };
      }

      // Update quantity if already in cart
      const { cartItem, error } = await updateCartItemQuantity(
        existingCartItem.id,
        newQuantity,
        userId
      );

      if (error) return { error };

      return {
        success: true,
        message: "Cart item updated successfully",
        cartItem,
      };
    } else {
      // Check if initial quantity exceeds stock
      if (quantity > stockAvailable) {
        return {
          error: `Only ${stockAvailable} items available in stock`,
          maxQuantity: stockAvailable,
        };
      }

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

export async function removeFromCartAction(cartItemId, userId) {
  try {
    const { error: deleteError } = await removeFromCart(cartItemId, userId);

    if (deleteError) {
      return { error: deleteError };
    }

    return {
      success: true,
      message: "Item removed from cart",
    };
  } catch (error) {
    console.error("Error removing item from cart:", error);
    return { error: "Failed to remove item from cart" };
  }
}

export async function updateCartItemQuantityAction(
  cartItemId,
  newQuantity,
  userId
) {
  try {
    if (newQuantity < 1) {
      return { error: "Quantity cannot be less than 1" };
    }

    // Get cart item with variant stock information
    const supabase = await createSupabaseServerClient();
    const { data: cartItem, error: fetchError } = await supabase
      .from("shopping_cart")
      .select(
        `
        *,
        product_variants (
          quantity
        )
      `
      )
      .eq("id", cartItemId)
      .eq("customer_id", userId)
      .single();

    if (fetchError || !cartItem) {
      return { error: "Cart item not found" };
    }

    // Check stock availability
    const stockAvailable = cartItem.product_variants.quantity;

    if (newQuantity > stockAvailable) {
      return {
        error: `Only ${stockAvailable} items available in stock`,
        maxQuantity: stockAvailable,
      };
    }

    // Proceed with update
    const { cartItem: updatedItem, error } = await updateCartItemQuantity(
      cartItemId,
      newQuantity,
      userId
    );

    if (error) return { error };

    return {
      success: true,
      message: "Cart item quantity updated successfully",
      cartItem: updatedItem,
    };
  } catch (error) {
    console.error("Error updating cart item quantity:", error);
    return { error: "Failed to update cart item quantity" };
  }
}

export async function getUserCartAction(userId) {
  const supabase = await createSupabaseServerClient();

  const { data: cartItems, error: cartItemsError } = await supabase
    .from("shopping_cart")
    .select(
      `
      *,
      product_variants(
        id,
        sku,
        quantity,
        colors(id, name, slug, hex_code),
        sizes(id, name, slug, display_order),
        product:products(
          id,
          name,
          base_price,
          discount_percentage,
          banner_image_url
        )
      )
    `
    )
    .eq("customer_id", userId)
    .order("added_at", { ascending: false });

  if (cartItemsError) {
    console.error("Get user cart error:", cartItemsError);
    return { error: "Failed to fetch cart" };
  }

  return { success: true, cartItems };
}
