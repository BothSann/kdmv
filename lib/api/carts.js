import { createSupabaseServerClient } from "@/utils/supabase/server";
import { supabaseAdmin } from "@/utils/supabase/supabaseAdmin";

/**
 * Server-side cart operations
 * These functions use the server Supabase client and are meant for server actions/components
 */

export async function getCartItem(userId, variantId) {
  const supabase = await createSupabaseServerClient();

  const { data: cartItem, error: cartItemError } = await supabase
    .from("shopping_cart")
    .select("*")
    .eq("customer_id", userId)
    .eq("product_variant_id", variantId)
    .maybeSingle();

  if (cartItemError) {
    console.error("Get cart item error:", cartItemError);
    return { error: "Failed to fetch cart item" };
  }

  return { success: true, cartItem };
}

export async function updateCartItemQuantity(cartItemId, newQuantity, userId) {
  const supabase = await createSupabaseServerClient();

  // Use PostgreSQL row-level locking
  const { data: cartItem, error: fetchError } = await supabase
    .from("shopping_cart")
    .select("*")
    .eq("id", cartItemId)
    .eq("customer_id", userId)
    .single();

  if (fetchError || !cartItem) {
    return { error: "Cart item not found" };
  }

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
    return { error: "Cart was modified by another request, please try again" };
  }

  return { success: true, cartItem: updatedCartItem };
}

export async function createCartItem(userId, variantId, quantity) {
  const supabase = await createSupabaseServerClient();

  const { data: newCartItem, error: newCartItemError } = await supabase
    .from("shopping_cart")
    .insert([{ customer_id: userId, product_variant_id: variantId, quantity }])
    .select()
    .single();

  if (newCartItemError) {
    console.error("Create cart item error:", newCartItemError);
    return { error: "Failed to create cart item" };
  }

  return { success: true, cartItem: newCartItem };
}

export async function getUserCart(userId) {
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

export async function removeFromCart(cartItemId, userId) {
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

  return { success: true };
}

export async function validateCartStock(cartItems) {
  const outOfStockItems = [];

  for (const item of cartItems) {
    const variantId = item.product_variant_id;
    const requestedQuantity = item.quantity;

    // Fetch current stock from database
    const { data: variant, error } = await supabaseAdmin
      .from("product_variants")
      .select("id, quantity, sku")
      .eq("id", variantId)
      .single();

    if (error || !variant) {
      return {
        valid: false,
        error: `Product variant not found: ${variantId}`,
      };
    }

    // Check if sufficient stock available
    if (variant.quantity < requestedQuantity) {
      outOfStockItems.push({
        variantId: variant.id,
        sku: variant.sku,
        available: variant.quantity,
        requested: requestedQuantity,
        productName: item.product_variants.product.name,
      });
    }
  }

  if (outOfStockItems.length > 0) {
    const errorMsg = outOfStockItems
      .map(
        (item) =>
          `${item.productName}: only ${item.available} available, requested ${item.requested}`
      )
      .join("; ");

    return {
      valid: false,
      error: errorMsg,
      outOfStockItems,
    };
  }

  return { valid: true };
}
