import { createSupabaseServerClient } from "@/utils/supabase/server";

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

  const { data: updatedCartItem, error: updatedCartItemError } = await supabase
    .from("shopping_cart")
    .update({
      quantity: newQuantity,
      updated_at: new Date().toISOString(),
    })
    .eq("id", cartItemId)
    .eq("customer_id", userId)
    .select()
    .single();

  if (updatedCartItemError) {
    console.error("Update cart item error:", updatedCartItemError);
    return { error: "Failed to update cart item" };
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
