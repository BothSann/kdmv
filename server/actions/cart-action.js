"use server";

import { getCartItem } from "@/lib/data/carts";
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

      // Update quantity if already in cart (inlined)
      // Use PostgreSQL row-level locking
      const { data: currentCartItem, error: fetchError } = await supabase
        .from("shopping_cart")
        .select("*")
        .eq("id", existingCartItem.id)
        .eq("customer_id", userId)
        .single();

      if (fetchError || !currentCartItem) {
        return { error: "Cart item not found" };
      }

      // Update with version check (optimistic locking)
      const { data: updatedCartItem, error: updateError } = await supabase
        .from("shopping_cart")
        .update({
          quantity: newQuantity,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existingCartItem.id)
        .eq("customer_id", userId)
        .eq("updated_at", currentCartItem.updated_at) // Only update if not modified
        .select()
        .single();

      if (updateError) {
        return {
          error: "Cart was modified by another request, please try again",
        };
      }

      return {
        success: true,
        message: "Cart item updated successfully",
        cartItem: updatedCartItem,
      };
    } else {
      // Check if initial quantity exceeds stock
      if (quantity > stockAvailable) {
        return {
          error: `Only ${stockAvailable} items available in stock`,
          maxQuantity: stockAvailable,
        };
      }

      // Insert new cart item (inlined)
      const { data: newCartItem, error: newCartItemError } = await supabase
        .from("shopping_cart")
        .insert([
          { customer_id: userId, product_variant_id: variantId, quantity },
        ])
        .select()
        .single();

      if (newCartItemError) {
        console.error("Create cart item error:", newCartItemError);
        return { error: "Failed to create cart item" };
      }

      return {
        success: true,
        message: "Cart item added successfully",
        cartItem: newCartItem,
      };
    }
  } catch (error) {
    console.error("Error adding item to cart:", error);
    return { error: "Failed to add item to cart" };
  }
}

export async function removeFromCartAction(cartItemId, userId) {
  try {
    // Remove from cart (inlined)
    const supabase = await createSupabaseServerClient();

    const { error: deleteError } = await supabase
      .from("shopping_cart")
      .delete()
      .eq("id", cartItemId)
      .eq("customer_id", userId);

    if (deleteError) {
      console.error("Remove from cart error:", deleteError);
      return { error: "Failed to remove item from cart" };
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

    // Proceed with update (inlined)
    // Update with version check (optimistic locking)
    const { data: updatedCartItem, error: updateError } = await supabase
      .from("shopping_cart")
      .update({
        quantity: newQuantity,
        updated_at: new Date().toISOString(),
      })
      .eq("id", cartItemId)
      .eq("customer_id", userId)
      .eq("updated_at", cartItem.updated_at) // Only update if not modified
      .select()
      .single();

    if (updateError) {
      return {
        error: "Cart was modified by another request, please try again",
      };
    }

    return {
      success: true,
      message: "Cart item quantity updated successfully",
      cartItem: updatedCartItem,
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
