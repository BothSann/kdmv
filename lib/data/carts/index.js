import { createSupabaseServerClient } from "@/utils/supabase/server";
import { supabaseAdmin } from "@/utils/supabase/supabaseAdmin";

/**
 * Cart Data Layer - QUERIES ONLY
 * All mutations have been moved to server/actions/cart-action.js
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
