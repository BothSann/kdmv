"use server";

import { supabaseAdmin } from "@/utils/supabase/supabaseAdmin";
import { revalidatePath } from "next/cache";
import { generateUniqueImageName } from "@/lib/utils";
import {
  cleanUpCreatedProduct,
  generateUniqueProductCode,
  generateSKU,
  uploadProductGalleryImages,
} from "@/lib/apiProducts";
import { getCurrentUser, getUserProfile } from "@/lib/apiUsers";
import {
  addProductToCollection,
  removeProductFromCollection,
} from "@/lib/apiCollections";

export async function createNewProductAction(formData) {
  try {
    if (!formData.banner_file) {
      return { error: "Please upload a banner image" };
    }

    // 1. Get authenticated user
    const { user, error: getCurrentUserError } = await getCurrentUser();
    if (getCurrentUserError) {
      console.error("Get current user error:", getCurrentUserError);
      return { error: getCurrentUserError };
    }

    // 2. Generate unique product code first
    const productCode = await generateUniqueProductCode();

    let createdProductId = null;

    const imageName = generateUniqueImageName(formData.banner_file);
    const bannerImagePath = `banners/${imageName}`;
    const imagePath = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/product-images/${bannerImagePath}`;

    // 3. Insert product to products table
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

    // 4. Insert product to collection_products table if collection_id is provided
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

    // 5. Upload banner image to storage
    const { error: storageError } = await supabaseAdmin.storage
      .from("product-images")
      .upload(bannerImagePath, formData.banner_file);

    if (storageError) {
      console.error("Storage error:", storageError);
      await cleanUpCreatedProduct(createdProductId);
      return { error: storageError.message };
    }

    // 6. Upload gallery images to product_images table if provided
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

    // 7. Insert product variants to product_variants table
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
    // Get authenticated user
    const { error: getCurrentUserError } = await getCurrentUser();
    if (getCurrentUserError) {
      console.error("Get current user error:", getCurrentUserError);
      return { error: getCurrentUserError };
    }

    const productId = formData.id;

    // Handle image upload if new image provided
    let imagePath = formData.existing_banner_image_url; // Keep existing image by default

    if (formData.banner_file && formData.banner_file.size > 0) {
      const imageName = generateUniqueImageName(formData.banner_file);
      const bannerImagePath = `banners/${imageName}`;
      imagePath = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/product-images/${bannerImagePath}`;

      // Upload new image to storage
      const { error: storageError } = await supabaseAdmin.storage
        .from("product-images")
        .upload(bannerImagePath, formData.banner_file);

      if (storageError) {
        console.error("Storage error:", storageError);
        return { error: storageError.message };
      }
    }

    // Handle collection assignment changes
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

    // 1. Update product
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

    // 2. Delete existing variants and insert new ones
    const { error: deleteVariantsError } = await supabaseAdmin
      .from("product_variants")
      .delete()
      .eq("product_id", productId);

    if (deleteVariantsError) {
      console.error("Delete variants error:", deleteVariantsError);
      return { error: deleteVariantsError.message };
    }

    // 3. Insert updated variants
    const variantsToInsert = await Promise.all(
      formData.variants.map(async (variant) => ({
        product_id: productId,
        color_id: variant.color_id,
        size_id: variant.size_id,
        quantity: parseInt(variant.quantity),
        sku:
          variant.sku ||
          (await generateSKU(
            product.product_code,
            variant.color_id,
            variant.size_id
          )),
      }))
    );

    const { error: variantsError } = await supabaseAdmin
      .from("product_variants")
      .insert(variantsToInsert);

    if (variantsError) {
      console.error("Variants insert error:", variantsError);
      return { error: variantsError.message };
    }

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
    // Get authenticated user
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
        error: "Unauthorized - Please login as admin to delete product",
      };
    }

    const { error: deleteProductError } = await supabaseAdmin
      .from("products")
      .delete()
      .eq("id", productId);

    if (deleteProductError) {
      console.error("Delete product error:", deleteProductError);
      return { error: "Failed to delete product" };
    }

    revalidatePath("/admin/products");
    return { success: true, message: "Product deleted successfully" };
  } catch (err) {
    console.error("Unexpected error:", err);
    return { error: "An unexpected error occurred during product deletion" };
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

    const { error: bulkDeleteError } = await supabaseAdmin
      .from("products")
      .delete()
      .in("id", productIds);

    if (bulkDeleteError) {
      console.error("Bulk delete error:", bulkDeleteError);
      return { error: "Failed to delete products" };
    }

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
