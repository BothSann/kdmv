"use server";

import { supabaseAdmin } from "@/utils/supabase/supabaseAdmin";
import { revalidatePath } from "next/cache";
import { generateUniqueImageName } from "@/lib/utils";
import {
  generateUniqueProductCode,
  generateSKU,
} from "@/lib/data/products/helpers";
import { cleanUpCreatedProduct } from "@/server/services/products/helpers";
import {
  uploadProductGalleryImages,
  handleBannerImageUpload,
  handleGalleryImagesUpdate,
} from "@/server/services/products/imageService";
import { getCurrentUser, getUserProfile, getUserRole } from "@/lib/data/users";
import { syncProductVariants } from "@/server/services/products/variantService";
import { updateProductCollections } from "@/server/services/products/collectionService";

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
        product_type_id: formData.product_type_id,
        gender_id: formData.gender_id,
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

    // BANNER IMAGE HANDLING: Upload new banner using image service
    const { imagePath, error: bannerError } = await handleBannerImageUpload(
      formData.banner_file,
      formData.existing_banner_image_url
    );

    if (bannerError) {
      return { error: bannerError };
    }

    // COLLECTION MANAGEMENT: Handle product collection assignments using service
    const { error: collectionError } = await updateProductCollections(
      productId,
      formData.collection_id
    );

    if (collectionError) {
      return { error: collectionError };
    }

    // PRODUCT CORE DATA UPDATE: Update main product information
    const { data: product, error: productError } = await supabaseAdmin
      .from("products")
      .update({
        name: formData.name,
        description: formData.description,
        base_price: parseFloat(formData.base_price),
        discount_percentage: parseInt(formData.discount_percentage) || 0,
        product_type_id: formData.product_type_id,
        gender_id: formData.gender_id,
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

    // GALLERY IMAGE MANAGEMENT: Handle deletions and uploads using image service
    const { error: galleryError } = await handleGalleryImagesUpdate(
      productId,
      formData.existing_image_ids,
      formData.image_files
    );

    if (galleryError) {
      return { error: galleryError };
    }

    // VARIANTS MANAGEMENT: Sync variants using modular service
    const { error: variantError } = await syncProductVariants(
      productId,
      product.product_code,
      formData.variants
    );

    if (variantError) {
      console.error("Variant sync error:", variantError);
      return { error: variantError };
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
      message: `Successfully deleted ${productIds.length} product${productIds.length > 1 ? "s" : ""
        }`,
    };
  } catch (err) {
    console.error("Unexpected error:", err);
    return {
      error: "An unexpected error occurred during bulk deletion",
    };
  }
}
