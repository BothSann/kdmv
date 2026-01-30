import { supabaseAdmin } from "@/utils/supabase/supabaseAdmin";

/**
 * Product Helpers - QUERIES ONLY
 * The cleanUpCreatedProduct mutation has been moved to server/services/products/helpers.js
 */

/**
 * Generates SKU from product code, color, and size
 * Format: {productCode}-{COLOR_SLUG}-{SIZE_SLUG}
 *
 * @param {string} productCode - Product code (e.g., "09032922652")
 * @param {string} colorId - Color UUID
 * @param {string} sizeId - Size UUID
 * @returns {Promise<string>} Generated SKU (e.g., "09032922652-DARK-GREEN-MEDIUM")
 */
export async function generateSKU(productCode, colorId, sizeId) {
  try {
    const [colorResult, sizeResult] = await Promise.all([
      supabaseAdmin
        .from("colors")
        .select("slug, name")
        .eq("id", colorId)
        .single(),
      supabaseAdmin
        .from("sizes")
        .select("slug, name")
        .eq("id", sizeId)
        .single(),
    ]);

    const colorCode =
      (
        colorResult.data?.slug || colorResult.data?.name?.substring(0, 3)
      )?.toUpperCase() || "UNK";

    const sizeCode =
      (sizeResult.data?.slug || sizeResult.data?.name)?.toUpperCase() || "UNK";

    return `${productCode}-${colorCode}-${sizeCode}`;
  } catch (err) {
    console.error("Error generating SKU:", err);
    return `${productCode}-${colorId.slice(-8)}-${sizeId.slice(-8)}`;
  }
}

/**
 * Generates unique 11-digit product code
 * Checks database to ensure uniqueness
 *
 * @returns {Promise<string>} Unique product code (e.g., "09032922652")
 */
export async function generateUniqueProductCode() {
  try {
    const maxAttempts = 5;
    let attempts = 0;

    while (attempts < maxAttempts) {
      const code = Math.floor(Math.random() * 10000000000)
        .toString()
        .padStart(11, "0");

      // Check if code exists in database
      const { data: existingProduct } = await supabaseAdmin
        .from("products")
        .select("id")
        .eq("product_code", code)
        .maybeSingle();

      if (!existingProduct) {
        return code; // Code is unique
      }

      attempts++;
    }
  } catch (err) {
    console.error("Error generating unique product code:", err);
    return `${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  }
}
