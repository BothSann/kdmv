import { supabaseAdmin } from "@/utils/supabase/supabaseAdmin";
import { generateSKU } from "./helpers";

/**
 * Product Variant Service
 * Handles all variant-related operations for product updates
 *
 * This service manages:
 * - Fetching existing variants
 * - Categorizing variant operations (UPDATE/INSERT/DELETE)
 * - Updating existing variants with SKU regeneration
 * - Inserting new variants
 * - Safe deletion (preserves variants used in orders)
 */

/**
 * Main orchestrator function
 * Syncs product variants with database
 * Handles UPDATE, INSERT, and DELETE operations intelligently
 *
 * @param {string} productId - Product UUID
 * @param {string} productCode - Product code for SKU generation
 * @param {Array} formVariants - Variants from form submission
 * @returns {Object} { success: boolean, error?: string }
 */
export async function syncProductVariants(
  productId,
  productCode,
  formVariants
) {
  try {
    // Step 1: Fetch existing variants from database
    const existingVariantsResult = await fetchExistingVariants(productId);
    if (existingVariantsResult.error) {
      return { error: existingVariantsResult.error };
    }

    // Step 2: Categorize operations (UPDATE/INSERT/DELETE)
    const operations = await categorizeVariantOperations(
      formVariants,
      existingVariantsResult.data,
      productCode,
      productId
    );

    // Step 3: Execute updates
    if (operations.toUpdate.length > 0) {
      const { error } = await updateVariants(operations.toUpdate);
      if (error) return { error };
    }

    // Step 4: Execute inserts
    if (operations.toInsert.length > 0) {
      const { error } = await insertVariants(operations.toInsert);
      if (error) return { error };
    }

    // Step 5: Execute safe deletes (only variants not in orders)
    if (operations.toDelete.length > 0) {
      await safeDeleteVariants(operations.toDelete);
      // Don't fail if delete fails - just log warning
    }

    return { success: true };
  } catch (err) {
    console.error("Error in syncProductVariants:", err);
    return { error: "Failed to sync product variants" };
  }
}

/**
 * Fetches existing variants for a product
 *
 * @param {string} productId - Product UUID
 * @returns {Object} { data?: Array, error?: string }
 */
async function fetchExistingVariants(productId) {
  const { data, error } = await supabaseAdmin
    .from("product_variants")
    .select("id, color_id, size_id, sku")
    .eq("product_id", productId);

  if (error) {
    console.error("Fetch variants error:", error);
    return { error: error.message };
  }

  return { data };
}

/**
 * Categorizes variants into update/insert/delete operations
 * Handles SKU regeneration when color or size changes
 *
 * @param {Array} formVariants - Variants from form
 * @param {Array} existingVariants - Current variants in database
 * @param {string} productCode - Product code for SKU generation
 * @param {string} productId - Product UUID for inserts
 * @returns {Object} { toUpdate: Array, toInsert: Array, toDelete: Array }
 */
async function categorizeVariantOperations(
  formVariants,
  existingVariants,
  productCode,
  productId
) {
  const toUpdate = [];
  const toInsert = [];
  const variantIdsToKeep = [];

  for (const formVariant of formVariants) {
    if (formVariant.id) {
      // Existing variant - UPDATE
      const existing = existingVariants.find((v) => v.id === formVariant.id);

      if (existing) {
        // Check if color or size changed (need to regenerate SKU)
        const needsNewSKU =
          existing.color_id !== formVariant.color_id ||
          existing.size_id !== formVariant.size_id;

        // Generate new SKU if color/size changed
        const newSKU = needsNewSKU
          ? await generateSKU(
              productCode,
              formVariant.color_id,
              formVariant.size_id
            )
          : existing.sku;

        toUpdate.push({
          id: existing.id,
          color_id: formVariant.color_id,
          size_id: formVariant.size_id,
          quantity: parseInt(formVariant.quantity),
          // ✅ FIX: Prioritize generated SKU when attributes change
          sku: needsNewSKU ? newSKU : formVariant.sku || existing.sku,
        });
        variantIdsToKeep.push(existing.id);
      } else {
        // Variant ID not found - shouldn't happen, but treat as new
        console.warn(
          `Variant ID ${formVariant.id} not found in existing variants`
        );
        toInsert.push(
          await prepareVariantForInsert(formVariant, productCode, productId)
        );
      }
    } else {
      // No ID = NEW variant - INSERT
      toInsert.push(
        await prepareVariantForInsert(formVariant, productCode, productId)
      );
    }
  }

  // Determine which variants to delete (not in form submission)
  const toDelete = existingVariants
    .filter((v) => !variantIdsToKeep.includes(v.id))
    .map((v) => v.id);

  return { toUpdate, toInsert, toDelete };
}

/**
 * Prepares variant data for insertion
 * Generates SKU if not provided
 *
 * @param {Object} variant - Variant data from form
 * @param {string} productCode - Product code for SKU generation
 * @param {string} productId - Product UUID
 * @returns {Object} Variant data ready for database insertion
 */
async function prepareVariantForInsert(variant, productCode, productId) {
  return {
    product_id: productId,
    color_id: variant.color_id,
    size_id: variant.size_id,
    quantity: parseInt(variant.quantity),
    sku:
      variant.sku ||
      (await generateSKU(productCode, variant.color_id, variant.size_id)),
  };
}

/**
 * Updates existing variants in database
 * Updates color, size, quantity, and SKU
 *
 * @param {Array} variants - Array of variants to update
 * @returns {Object} { success: boolean, error?: string }
 */
async function updateVariants(variants) {
  for (const variant of variants) {
    const { error } = await supabaseAdmin
      .from("product_variants")
      .update({
        color_id: variant.color_id,
        size_id: variant.size_id,
        quantity: variant.quantity,
        sku: variant.sku,
        updated_at: new Date().toISOString(),
      })
      .eq("id", variant.id);

    if (error) {
      console.error("Update variant error:", error);
      return { error: error.message };
    }
  }

  return { success: true };
}

/**
 * Inserts new variants into database
 *
 * @param {Array} variants - Array of variants to insert
 * @returns {Object} { success: boolean, error?: string }
 */
async function insertVariants(variants) {
  const { error } = await supabaseAdmin
    .from("product_variants")
    .insert(variants);

  if (error) {
    console.error("Insert variants error:", error);
    return { error: error.message };
  }

  return { success: true };
}

/**
 * Safely deletes variants (only if not referenced in orders)
 * Preserves variants that exist in order_items to maintain order history
 *
 * @param {Array} variantIds - Array of variant UUIDs to delete
 */
async function safeDeleteVariants(variantIds) {
  if (variantIds.length === 0) return;

  try {
    // Check which variants are used in orders
    const { data: usedInOrders } = await supabaseAdmin
      .from("order_items")
      .select("product_variant_id")
      .in("product_variant_id", variantIds);

    const usedVariantIds =
      usedInOrders?.map((item) => item.product_variant_id) || [];

    // Delete ONLY variants NOT used in orders
    const safeToDelete = variantIds.filter(
      (id) => !usedVariantIds.includes(id)
    );

    if (safeToDelete.length > 0) {
      const { error } = await supabaseAdmin
        .from("product_variants")
        .delete()
        .in("id", safeToDelete);

      if (error) {
        console.error("Delete variants error:", error);
        // Don't throw - just log (deletion is optional)
      }
    }

    // Log variants that couldn't be deleted
    const protectedCount = usedVariantIds.length;
    if (protectedCount > 0) {
      console.warn(
        `Note: ${protectedCount} variant(s) could not be deleted because they are referenced in past orders. These variants are preserved for order history.`
      );
    }
  } catch (err) {
    console.error("Error in safeDeleteVariants:", err);
    // Don't throw - variant deletion is optional
  }
}
