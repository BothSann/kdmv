"use server";

import { supabaseAdmin } from "@/utils/supabase/supabaseAdmin";

import { revalidatePath } from "next/cache";
import {
  sanitizeName,
  generateUniqueImageName,
  sanitizeSlug,
} from "@/lib/utils";

import { getCurrentUser, getUserProfile } from "@/lib/apiUsers";

import {
  cleanUpCreatedCollection,
  clearCollectionProducts,
} from "@/lib/apiCollections";

export async function createNewCollectionAction(formData) {
  try {
    const cleanCollectionName = sanitizeName(formData.name);
    const cleanCollectionSlug = sanitizeSlug(cleanCollectionName);

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
        error: "Unauthorized - Please login as admin to create collection",
      };
    }

    let createdCollectionId = null;

    const imageName = generateUniqueImageName(formData.banner_file);
    let imagePath = null;
    if (formData.banner_file && formData.banner_file.size > 0) {
      imagePath = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/collection-images/${imageName}`;
    }

    const { data: collection, error: collectionError } = await supabaseAdmin
      .from("collections")
      .insert({
        name: cleanCollectionName,
        slug: cleanCollectionSlug,
        description: formData.description,
        banner_image_url: imagePath,
        is_active: formData.is_active ?? true,
      })
      .select()
      .single();

    if (collectionError) {
      console.error("Collection error:", collectionError);
      return { error: collectionError.message };
    }

    if (formData.selected_product_ids?.length > 0) {
      const collectionProductsToInsert = formData.selected_product_ids.map(
        (productId) => ({
          collection_id: collection.id,
          product_id: productId,
          display_order: 0,
        })
      );

      const { error: collectionProductsError } = await supabaseAdmin
        .from("collection_products")
        .insert(collectionProductsToInsert);

      if (collectionProductsError) {
        console.error("Collection products error:", collectionProductsError);
        return { error: collectionProductsError.message };
      }
    }

    if (formData.banner_file && formData.banner_file.size > 0) {
      const { error: storageError } = await supabaseAdmin.storage
        .from("collection-images")
        .upload(imageName, formData.banner_file);

      if (storageError) {
        console.error("Storage error:", storageError);
        await cleanUpCreatedCollection(createdCollectionId);
        return { error: storageError.message };
      }
    }

    revalidatePath("/admin/collections");
    return {
      success: true,
      message: "Collection created successfully",
      collection: collection,
    };
  } catch (err) {
    console.error("Unexpected error:", err);
    if (createdCollectionId) {
      await cleanUpCreatedCollection(createdCollectionId);
    }
    return { error: "An unexpected error occurred during collection creation" };
  }
}

export async function updateCollectionAction(formData) {
  try {
    const cleanCollectionName = sanitizeName(formData.name);

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
        error: "Unauthorized - Please login as admin to update collection",
      };
    }

    const collectionId = formData.id;
    let imagePath = formData.existing_banner_image_url;

    // Handle image upload if new image provided
    if (formData.banner_file && formData.banner_file.size > 0) {
      const imageName = generateUniqueImageName(formData.banner_file);
      imagePath = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/collection-images/${imageName}`;

      const { error: storageError } = await supabaseAdmin.storage
        .from("collection-images")
        .upload(imageName, formData.banner_file);

      if (storageError) {
        console.error("Storage error:", storageError);
        return { error: storageError.message };
      }
    }

    // 1. Update collection metadata
    const { data: collection, error: collectionError } = await supabaseAdmin
      .from("collections")
      .update({
        name: cleanCollectionName,
        description: formData.description,
        banner_image_url: imagePath,
        is_active: formData.is_active ?? true,
        updated_at: new Date().toISOString(),
      })
      .eq("id", collectionId)
      .select()
      .single();

    if (collectionError) {
      console.error("Collection update error:", collectionError);
      return { error: collectionError.message };
    }

    // 2. Update collection products relationships
    if (formData.selected_product_ids !== undefined) {
      // Delete existing collection products
      const { error: clearCollectionProductsError } =
        await clearCollectionProducts(collectionId);

      if (clearCollectionProductsError) {
        console.error(
          "Clear collection products error:",
          clearCollectionProductsError
        );
        return { error: clearCollectionProductsError.message };
      }

      // Insert new collection products (if any selected)
      if (formData.selected_product_ids?.length > 0) {
        const collectionProductsToInsert = formData.selected_product_ids.map(
          (productId) => ({
            collection_id: collectionId,
            product_id: productId,
            display_order: 0,
          })
        );

        const { error: insertError } = await supabaseAdmin
          .from("collection_products")
          .insert(collectionProductsToInsert);

        if (insertError) {
          console.error("Insert collection products error:", insertError);
          return { error: insertError.message };
        }
      }
    }

    revalidatePath("/admin/collections");
    revalidatePath(`/admin/collections/${collectionId}`);
    revalidatePath(`/admin/collections/${collectionId}/edit`);

    return {
      success: true,
      message: "Collection updated successfully",
      collection: collection,
    };
  } catch (err) {
    console.error("Unexpected error:", err);
    return { error: "An unexpected error occurred during collection update" };
  }
}

export async function deleteCollectionByIdAction(collectionId) {
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
        error: "Unauthorized - Please login as admin to delete collection",
      };
    }

    const { error: deleteCollectionError } = await supabaseAdmin
      .from("collections")
      .delete()
      .eq("id", collectionId);

    if (deleteCollectionError) {
      console.error("Delete collection error:", deleteCollectionError);
      return { error: "Failed to delete collection" };
    }

    revalidatePath("/admin/collections");
    return { success: true, message: "Collection deleted successfully" };
  } catch (err) {
    console.error("Unexpected error:", err);
    return { error: "An unexpected error occurred during collection deletion" };
  }
}

export async function bulkDeleteCollectionsAction(collectionIds) {
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
        error:
          "Unauthorized - Please login as admin to bulk delete collections",
      };
    }

    const { error: bulkDeleteError } = await supabaseAdmin
      .from("collections")
      .delete()
      .in("id", collectionIds);

    if (bulkDeleteError) {
      console.error("Bulk delete collections error:", bulkDeleteError);
      return { error: "Failed to delete collections" };
    }

    revalidatePath("/admin/collections");
    return {
      success: true,
      message: `Successfully deleted ${collectionIds.length} collection${
        collectionIds.length > 1 ? "s" : ""
      }`,
    };
  } catch (err) {
    console.error("Unexpected error:", err);
    return {
      error: "An unexpected error occurred during bulk collection deletion",
    };
  }
}
