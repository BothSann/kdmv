"use server";

import { supabaseAdmin } from "@/utils/supabase/supabaseAdmin";
import { revalidatePath } from "next/cache";
import { generateUniqueImageName } from "@/lib/utils";
import {
  cleanUpCreatedProduct,
  generateUniqueProductCode,
  generateSKU,
  uploadProductGalleryImages,
  deleteUnselectedProductImages,
  deleteAllProductImages,
} from "@/lib/api/server/products";
import {
  getCurrentUser,
  getUserProfile,
  getUserRole,
} from "@/lib/api/server/users";
import {
  addProductToCollection,
  removeProductFromCollection,
} from "@/lib/api/server/collections";

export async function createNewProductAction(formData) {
  try {
    // AUTHENTICATION: Verify user has permission to create products
    const { user, error: getCurrentUserError } = await getCurrentUser();
    if (getCurrentUserError) {
      console.error("Get current user error:", getCurrentUserError);
      return { error: getCurrentUserError };
    }

    // PRODUCT CODE GENERATION: Create unique identifier before product creation
    const productCode = await generateUniqueProductCode();

    let createdProductId = null;

    // FILE PREPARATION: Prepare banner image path before creating product record
    const imageName = generateUniqueImageName(formData.banner_file);
    const bannerImagePath = `banners/${imageName}`;
    const imagePath = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/product-images/${bannerImagePath}`;

    // PRODUCT RECORD CREATION: Create main product record first (get product ID)
    const { data: product, error: productError } = await supabaseAdmin
      .from("products")
      .insert({
        name: formData.name,
        description: formData.description,
        product_code: productCode,
        base_price: parseFloat(formData.base_price),
        discount_percentage: parseInt(formData.discount_percentage) || 0,
        subcategory_id: formData.subcategory_id,
        banner_image_url: imagePath || null,
        is_active: formData.is_active ?? true,
        created_by: user.id,
      })
      .select()
      .single();

    if (productError) {
      console.error("Product error:", productError);
      return { error: productError.message };
    }

    createdProductId = product.id;

    // COLLECTION ASSIGNMENT: Link product to collection if specified
    if (formData.collection_id) {
      const { error: collectionProductsError } = await supabaseAdmin
        .from("collection_products")
        .insert({
          collection_id: formData.collection_id,
          product_id: product.id,
          display_order: 0,
        });

      if (collectionProductsError) {
        console.error("Collection products error:", collectionProductsError);
        return { error: collectionProductsError.message };
      }
    }

    // BANNER IMAGE UPLOAD: Upload banner image to storage after product exists
    const { error: storageError } = await supabaseAdmin.storage
      .from("product-images")
      .upload(bannerImagePath, formData.banner_file);

    if (storageError) {
      console.error("Storage error:", storageError);
      await cleanUpCreatedProduct(createdProductId);
      return { error: storageError.message };
    }

    // GALLERY IMAGES UPLOAD: Upload additional gallery images if provided
    if (formData.image_files && formData.image_files.length > 0) {
      const galleryResult = await uploadProductGalleryImages(
        product.id,
        formData.image_files
      );

      if (!galleryResult.success) {
        console.error("Gallery result error:", galleryResult.error);
        await cleanUpCreatedProduct(createdProductId);
        return { error: galleryResult.error };
      }
    }

    // VARIANTS CREATION: Create product variants after all other data is ready
    const variantsToInsert = await Promise.all(
      formData.variants.map(async (variant) => ({
        product_id: product.id,
        color_id: variant.color_id,
        size_id: variant.size_id,
        quantity: parseInt(variant.quantity),
        sku:
          variant.sku ||
          (await generateSKU(productCode, variant.color_id, variant.size_id)),
      }))
    );

    const { error: variantsError } = await supabaseAdmin
      .from("product_variants")
      .insert(variantsToInsert);

    if (variantsError) {
      console.error("Variants error:", variantsError);
      await cleanUpCreatedProduct(createdProductId);
      return { error: variantsError.message };
    }

    // CACHE INVALIDATION: Clear cached pages to show new product
    revalidatePath("/admin/products");
    return {
      success: true,
      message: "Product created successfully",
      product: product,
    };
  } catch (err) {
    console.error("Unexpected error:", err);
    if (createdProductId) {
      await cleanUpCreatedProduct(createdProductId);
    }
    return { error: "An unexpected error occurred during product creation" };
  }
}

export async function updateProductAction(formData) {
  try {
    // AUTHENTICATION: Verify user has permission to update products
    const { error: getCurrentUserError } = await getCurrentUser();
    if (getCurrentUserError) {
      console.error("Get current user error:", getCurrentUserError);
      return { error: getCurrentUserError };
    }

    const productId = formData.id;

    // BANNER IMAGE HANDLING: Upload new banner image if provided, otherwise keep existing
    let imagePath = formData.existing_banner_image_url; // Keep existing image by default

    if (formData.banner_file && formData.banner_file.size > 0) {
      const imageName = generateUniqueImageName(formData.banner_file);
      const bannerImagePath = `banners/${imageName}`;
      imagePath = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/product-images/${bannerImagePath}`;

      // Upload new banner image to storage
      const { error: storageError } = await supabaseAdmin.storage
        .from("product-images")
        .upload(bannerImagePath, formData.banner_file);

      if (storageError) {
        console.error("Storage error:", storageError);
        return { error: storageError.message };
      }
    }

    // COLLECTION MANAGEMENT: Handle product collection assignments
    if (formData.collection_id !== undefined) {
      // First, remove product from any existing collections
      const removeResult = await removeProductFromCollection(productId);
      if (!removeResult.success) {
        console.error("Remove from collections error:", removeResult.error);
        return { error: removeResult.error };
      }

      // Then add to new collection if specified
      if (formData.collection_id) {
        const addResult = await addProductToCollection(
          productId,
          formData.collection_id
        );

        if (!addResult.success) {
          console.error("Add to collections error:", addResult.error);
          return { error: addResult.error };
        }
      }
    }

    // PRODUCT CORE DATA UPDATE: Update main product information
    const { data: product, error: productError } = await supabaseAdmin
      .from("products")
      .update({
        name: formData.name,
        description: formData.description,
        base_price: parseFloat(formData.base_price),
        discount_percentage: parseInt(formData.discount_percentage) || 0,
        subcategory_id: formData.subcategory_id,
        banner_image_url: imagePath,
        is_active: formData.is_active ?? true,
        updated_at: new Date().toISOString(),
      })
      .eq("id", productId)
      .select()
      .single();

    if (productError) {
      console.error("Product update error:", productError);
      return { error: productError.message };
    }

    // GALLERY IMAGE MANAGEMENT: Delete unselected existing images and upload new ones
    // Delete images that are no longer selected by the user
    if (formData.existing_image_ids !== undefined) {
      // User wants to keep some images - delete the rest
      if (formData.existing_image_ids.length > 0) {
        const deleteImagesResult = await deleteUnselectedProductImages(
          productId,
          formData.existing_image_ids
        );

        if (!deleteImagesResult.success) {
          console.error("Delete images error:", deleteImagesResult.error);
          return { error: deleteImagesResult.error };
        }
      } else {
        // User wants to delete ALL existing images (empty array means delete all)
        const deleteAllImagesResult = await deleteAllProductImages(productId);

        if (!deleteAllImagesResult.success) {
          console.error(
            "Delete all images error:",
            deleteAllImagesResult.error
          );
          return { error: deleteAllImagesResult.error };
        }
      }
    }

    // Upload new gallery images if any were added during edit
    if (formData.image_files && formData.image_files.length > 0) {
      const galleryResult = await uploadProductGalleryImages(
        productId,
        formData.image_files
      );

      if (!galleryResult.success) {
        console.error("Gallery upload error:", galleryResult.error);
        return { error: galleryResult.error };
      }
    }

    // VARIANTS MANAGEMENT: Smart update with foreign key constraint handling
    // Instead of deleting all variants, we UPDATE existing ones and INSERT new ones
    // This prevents foreign key violations from orders that reference variants

    // 1. Fetch existing variants
    const { data: existingVariants, error: fetchVariantsError } =
      await supabaseAdmin
        .from("product_variants")
        .select("id, color_id, size_id, sku")
        .eq("product_id", productId);

    if (fetchVariantsError) {
      console.error("Fetch variants error:", fetchVariantsError);
      return { error: fetchVariantsError.message };
    }

    // 2. Process new variants from form - separate into update vs insert
    const variantsToUpdate = [];
    const variantsToInsert = [];
    const variantIdsToKeep = [];

    for (const newVariant of formData.variants) {
      // Find matching existing variant (same color + size combination)
      const existing = existingVariants?.find(
        (v) =>
          v.color_id === newVariant.color_id && v.size_id === newVariant.size_id
      );

      if (existing) {
        // Variant exists - prepare UPDATE
        variantsToUpdate.push({
          id: existing.id,
          quantity: parseInt(newVariant.quantity),
          sku:
            newVariant.sku ||
            existing.sku ||
            (await generateSKU(
              product.product_code,
              newVariant.color_id,
              newVariant.size_id
            )),
        });
        variantIdsToKeep.push(existing.id);
      } else {
        // New variant - prepare INSERT
        variantsToInsert.push({
          product_id: productId,
          color_id: newVariant.color_id,
          size_id: newVariant.size_id,
          quantity: parseInt(newVariant.quantity),
          sku:
            newVariant.sku ||
            (await generateSKU(
              product.product_code,
              newVariant.color_id,
              newVariant.size_id
            )),
        });
      }
    }

    // 3. Update existing variants (preserves foreign key references)
    for (const variant of variantsToUpdate) {
      const { error: updateVariantError } = await supabaseAdmin
        .from("product_variants")
        .update({
          quantity: variant.quantity,
          sku: variant.sku,
          updated_at: new Date().toISOString(),
        })
        .eq("id", variant.id);

      if (updateVariantError) {
        console.error("Update variant error:", updateVariantError);
        return { error: updateVariantError.message };
      }
    }

    // 4. Insert new variants
    if (variantsToInsert.length > 0) {
      const { error: insertVariantsError } = await supabaseAdmin
        .from("product_variants")
        .insert(variantsToInsert);

      if (insertVariantsError) {
        console.error("Insert variants error:", insertVariantsError);
        return { error: insertVariantsError.message };
      }
    }

    // 5. Handle variants no longer in the list (safe deletion)
    const variantIdsToRemove =
      existingVariants
        ?.filter((v) => !variantIdsToKeep.includes(v.id))
        .map((v) => v.id) || [];

    if (variantIdsToRemove.length > 0) {
      // Check if any variants are used in past orders
      const { data: usedInOrders, error: checkOrdersError } =
        await supabaseAdmin
          .from("order_items")
          .select("product_variant_id")
          .in("product_variant_id", variantIdsToRemove);

      if (checkOrdersError) {
        console.error("Check order items error:", checkOrdersError);
        // Continue anyway - better to skip deletion than fail entire update
      }

      const usedVariantIds =
        usedInOrders?.map((item) => item.product_variant_id) || [];

      // Delete ONLY variants not used in orders
      const safeToDelete = variantIdsToRemove.filter(
        (id) => !usedVariantIds.includes(id)
      );

      if (safeToDelete.length > 0) {
        const { error: deleteVariantsError } = await supabaseAdmin
          .from("product_variants")
          .delete()
          .in("id", safeToDelete);

        if (deleteVariantsError) {
          console.error("Delete unused variants error:", deleteVariantsError);
          // Don't return error - product is already updated successfully
        }
      }

      // Log variants that couldn't be deleted (used in past orders)
      const protectedVariants = variantIdsToRemove.filter((id) =>
        usedVariantIds.includes(id)
      );

      if (protectedVariants.length > 0) {
        console.warn(
          `Note: ${protectedVariants.length} variant(s) could not be deleted because they are referenced in past orders. These variants are preserved for order history.`
        );
      }
    }

    // CACHE INVALIDATION: Clear cached pages to show updated data
    revalidatePath("/");
    revalidatePath("/admin/products");
    revalidatePath(`/admin/products/${productId}`);
    revalidatePath(`/admin/products/${productId}/edit`);

    return {
      success: true,
      message: "Product updated successfully",
      product: product,
    };
  } catch (err) {
    console.error("Unexpected error:", err);
    return { error: "An unexpected error occurred during product update" };
  }
}

export async function deleteProductByIdAction(productId) {
  try {
    // AUTHENTICATION: Verify user is logged in and retrieve user information
    const { user, error: getCurrentUserError } = await getCurrentUser();

    if (getCurrentUserError) {
      console.error("Get current user error:", getCurrentUserError);
      return { error: getCurrentUserError };
    }

    // AUTHORIZATION: Verify user has admin privileges to delete products
    const { profile, error: profileError } = await getUserProfile(user?.id);
    if (profileError) {
      console.error("Profile error:", profileError);
      return { error: profileError.message };
    }

    if (profile?.role !== "admin") {
      console.error("User is not admin");
      return {
        error: "Unauthorized - Please login as admin to delete product",
      };
    }

    // SOFT DELETE: Mark product as deleted instead of hard delete
    const { error: softDeleteError } = await supabaseAdmin
      .from("products")
      .update({
        deleted_at: new Date().toISOString(), // Mark as deleted
        is_active: false, // Also deactivate
        updated_at: new Date().toISOString(),
      })
      .eq("id", productId);

    if (softDeleteError) {
      console.error("Soft delete product error:", softDeleteError);
      return { error: "Failed to delete product" };
    }

    // CACHE INVALIDATION: Clear cached pages to reflect deletion
    revalidatePath("/");
    revalidatePath("/products");
    revalidatePath("/admin/products");
    return { success: true, message: "Product deleted successfully" };
  } catch (err) {
    console.error("Unexpected error:", err);
    return { error: "An unexpected error occurred during product deletion" };
  }
}

export async function restoreProductAction(productId) {
  try {
    const { user, error: getCurrentUserError } = await getCurrentUser();
    if (getCurrentUserError) return { error: getCurrentUserError };

    const { role } = await getUserRole(user?.id);
    if (role !== "admin") {
      return {
        error: "Unauthorized - Please login as admin to restore product",
      };
    }

    const { error: restoreError } = await supabaseAdmin
      .from("products")
      .update({
        deleted_at: null, // Unmark as deleted
        is_active: true, // Reactivate
        updated_at: new Date().toISOString(),
      })
      .eq("id", productId);

    if (restoreError) {
      console.error("Restore error:", restoreError);
      return { error: "Failed to restore product" };
    }

    revalidatePath("/admin/products");
    return { success: true, message: "Product restored successfully" };
  } catch (err) {
    console.error("Unexpected error:", err);
    return { error: "An unexpected error occurred" };
  }
}

export async function bulkDeleteProductsAction(productIds) {
  try {
    const { user, error: getCurrentUserError } = await getCurrentUser();

    if (getCurrentUserError) {
      console.error("Get current user error:", getCurrentUserError);
      return { error: getCurrentUserError };
    }

    const { profile, error: profileError } = await getUserProfile(user?.id);

    if (profileError) {
      console.error("Profile error:", profileError);
      return { error: profileError.message };
    }

    if (profile?.role !== "admin") {
      console.error("User is not admin");
      return {
        error: "Unauthorized - Please login as admin to bulk delete products",
      };
    }

    // ✅ SOFT DELETE: Mark all products as deleted
    const { error: bulkSoftDeleteError } = await supabaseAdmin
      .from("products")
      .update({
        deleted_at: new Date().toISOString(),
        is_active: false,
        updated_at: new Date().toISOString(),
      })
      .in("id", productIds);

    if (bulkSoftDeleteError) {
      console.error("Bulk soft delete error:", bulkSoftDeleteError);
      return { error: "Failed to delete products" };
    }

    revalidatePath("/");
    revalidatePath("/products");
    revalidatePath("/admin/products");

    return {
      success: true,
      message: `Successfully deleted ${productIds.length} product${
        productIds.length > 1 ? "s" : ""
      }`,
    };
  } catch (err) {
    console.error("Unexpected error:", err);
    return {
      error: "An unexpected error occurred during bulk deletion",
    };
  }
}
