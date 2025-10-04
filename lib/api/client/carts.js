import { createSupabaseFrontendClient } from "@/utils/supabase/client";

export async function getUserCart(userId) {
  const supabase = createSupabaseFrontendClient();

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
    console.error("Get user cart (client) error:", cartItemsError);
    return { error: "Failed to fetch cart" };
  }

  return { success: true, cartItems };
}
// export async function updateCartItemQuantity(cartItemId, newQuantity) {
//   const supabase = await createSupabaseServerClient();

//   const { data: updatedCartItem, error: updatedCartItemError } = await supabase
//     .from("shopping_cart")
//     .update({
//       quantity: newQuantity,
//       updated_at: new Date().toISOString(),
//     })
//     .eq("id", cartItemId)
//     .select()
//     .single();

//   if (updatedCartItemError) {
//     console.error("Update cart item error:", updatedCartItemError);
//     return { error: "Failed to update cart item" };
//   }

//   return { success: true, cartItem: updatedCartItem };
// }

// export async function createCartItem(userId, variantId, quantity) {
//   const supabase = await createSupabaseServerClient();

//   const { data: newCartItem, error: newCartItemError } = await supabase
//     .from("shopping_cart")
//     .insert([{ customer_id: userId, product_variant_id: variantId, quantity }])
//     .select()
//     .single();

//   if (newCartItemError) {
//     console.error("Create cart item error:", newCartItemError);
//     return { error: "Failed to create cart item" };
//   }

//   return { success: true, cartItem: newCartItem };
// }
