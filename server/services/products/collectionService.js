import { supabaseAdmin } from "@/utils/supabase/supabaseAdmin";

/**
 * Product Collection Service
 * Handles product-to-collection assignment operations
 *
 * This service manages:
 * - Removing products from existing collections
 * - Adding products to new collections
 * - Handling "no collection" scenarios
 * - Collection reassignment (moving between collections)
 */

/**
 * Updates product collection assignments
 * Removes product from old collection(s) and adds to new collection
 *
 * @param {string} productId - Product UUID
 * @param {string|null|undefined} newCollectionId - New collection UUID (null = no collection, undefined = no change)
 * @returns {Object} { success: boolean, error?: string }
 *
 * @example
 * // Add product to a collection
 * const result = await updateProductCollections(productId, collectionId);
 *
 * @example
 * // Remove product from all collections
 * const result = await updateProductCollections(productId, null);
 *
 * @example
 * // No change to collections
 * const result = await updateProductCollections(productId, undefined);
 *
 * @example
 * // Move product to different collection
 * // From: "Summer Sale"
 * // To: "Winter Sale"
 * const result = await updateProductCollections(productId, winterSaleId);
 */
export async function updateProductCollections(productId, newCollectionId) {
  try {
    // undefined = no collection change requested, skip processing
    if (newCollectionId === undefined) {
      return { success: true };
    }

    // STEP 1: Remove from existing collections
    // This handles both reassignment and removal scenarios
    const { error: removeError } = await supabaseAdmin
      .from("collection_products")
      .delete()
      .eq("product_id", productId);

    if (removeError) {
      console.error("Remove from collections error:", removeError);
      return { error: removeError.message };
    }

    // STEP 2: Add to new collection (if specified)
    // null or empty string = remove from all collections (already done in step 1)
    if (newCollectionId) {
      const { error: addError } = await supabaseAdmin
        .from("collection_products")
        .insert({
          collection_id: newCollectionId,
          product_id: productId,
        });

      if (addError) {
        console.error("Add to collection error:", addError);
        return { error: addError.message };
      }
    }

    return { success: true };
  } catch (err) {
    console.error("Error in updateProductCollections:", err);
    return { error: "Failed to update product collections" };
  }
}
