import { supabaseAdmin } from "@/utils/supabase/supabaseAdmin";

/**
 * Cleans up a product (hard delete) - used for rollback on creation failure
 * WARNING: This is a hard delete, use only for cleanup scenarios
 *
 * @param {string} productId - Product UUID to delete
 * @returns {Promise<Object>} { success: boolean, message?: string, error?: string }
 */
export async function cleanUpCreatedProduct(productId) {
  try {
    const { error: deleteError } = await supabaseAdmin
      .from("products")
      .delete()
      .eq("id", productId);

    if (deleteError) {
      console.error("Delete error:", deleteError);
      return { error: "Failed to delete product" };
    }

    return { success: true, message: "Product cleaned up successfully" };
  } catch (err) {
    console.error("Unexpected error:", err);
    return { error: "An unexpected error occurred during product cleanup" };
  }
}
