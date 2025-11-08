import { supabaseAdmin } from "@/utils/supabase/supabaseAdmin";
import { generateUniqueImageName } from "@/lib/utils";

/**
 * Product Image Service
 * Handles all image-related operations for product updates
 *
 * This service manages:
 * - Banner image upload and URL generation
 * - Gallery image deletion (selective and bulk)
 * - Gallery image upload
 * - Image path construction for Supabase Storage
 */

/**
 * Handles banner image upload
 * Returns the image path to use (existing or newly uploaded)
 *
 * @param {File} bannerFile - Banner image file from form (or null/undefined)
 * @param {string} existingBannerUrl - Current banner URL from database
 * @returns {Object} { imagePath: string, error?: string }
 *
 * @example
 * // Upload new banner
 * const result = await handleBannerImageUpload(file, existingUrl);
 * if (result.error) return { error: result.error };
 * // Use result.imagePath for database update
 *
 * @example
 * // Keep existing banner (no file provided)
 * const result = await handleBannerImageUpload(null, existingUrl);
 * // result.imagePath === existingUrl
 */
export async function handleBannerImageUpload(bannerFile, existingBannerUrl) {
  try {
    // No new file provided - keep existing banner
    if (!bannerFile || bannerFile.size === 0) {
      return { imagePath: existingBannerUrl };
    }

    // Generate unique filename to prevent conflicts
    const imageName = generateUniqueImageName(bannerFile);
    const bannerImagePath = `banners/${imageName}`;

    // Construct public URL for Supabase Storage
    const imagePath = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/product-images/${bannerImagePath}`;

    // Upload new banner to Supabase Storage
    const { error: storageError } = await supabaseAdmin.storage
      .from("product-images")
      .upload(bannerImagePath, bannerFile);

    if (storageError) {
      console.error("Banner upload error:", storageError);
      return { error: storageError.message };
    }

    // Return new image path for database update
    return { imagePath };
  } catch (err) {
    console.error("Error in handleBannerImageUpload:", err);
    return { error: "Failed to upload banner image" };
  }
}

/**
 * Handles gallery images update
 * Manages both deletion of removed images and upload of new images
 *
 * @param {string} productId - Product UUID
 * @param {Array<string>} existingImageIds - Array of image IDs to keep (undefined = no change)
 * @param {Array<File>} newImageFiles - Array of new image files to upload
 * @returns {Object} { success: boolean, error?: string }
 *
 * @example
 * // Delete some images and upload new ones
 * const result = await handleGalleryImagesUpdate(
 *   productId,
 *   ['id1', 'id2'], // Keep these two
 *   [newFile1, newFile2] // Upload these two
 * );
 *
 * @example
 * // Delete all existing images
 * const result = await handleGalleryImagesUpdate(
 *   productId,
 *   [], // Empty array = delete all
 *   []
 * );
 *
 * @example
 * // No changes to gallery
 * const result = await handleGalleryImagesUpdate(
 *   productId,
 *   undefined, // undefined = no deletion
 *   []
 * );
 */
export async function handleGalleryImagesUpdate(
  productId,
  existingImageIds,
  newImageFiles
) {
  try {
    // PHASE 1: Handle deletions
    if (existingImageIds !== undefined) {
      if (existingImageIds.length > 0) {
        // Keep selected images, delete the rest
        const { success, error } = await deleteUnselectedProductImages(
          productId,
          existingImageIds
        );

        if (!success) {
          console.error("Delete unselected images error:", error);
          return { error };
        }
      } else {
        // Empty array = delete ALL existing images
        const { success, error } = await deleteAllProductImages(productId);

        if (!success) {
          console.error("Delete all images error:", error);
          return { error };
        }
      }
    }

    // PHASE 2: Handle uploads
    if (newImageFiles && newImageFiles.length > 0) {
      const { success, error } = await uploadProductGalleryImages(
        productId,
        newImageFiles
      );

      if (!success) {
        console.error("Upload gallery images error:", error);
        return { error };
      }
    }

    return { success: true };
  } catch (err) {
    console.error("Error in handleGalleryImagesUpdate:", err);
    return { error: "Failed to update gallery images" };
  }
}

/**
 * Uploads multiple gallery images for a product
 * Uploads to Supabase Storage and creates database records
 *
 * @param {string} productId - Product UUID
 * @param {Array<File>} imageFiles - Array of image files to upload
 * @returns {Object} { success: boolean, message?: string, error?: string }
 */
export async function uploadProductGalleryImages(productId, imageFiles) {
  try {
    const uploadPromises = imageFiles.map(async (file, index) => {
      const galleryImageName = generateUniqueImageName(file);
      const galleryImagePath = `gallery/${galleryImageName}`;

      // Upload to storage in gallery folder
      const { error: galleryStorageError } = await supabaseAdmin.storage
        .from("product-images")
        .upload(galleryImagePath, file);

      if (galleryStorageError) {
        console.error(
          `Gallery image ${index + 1} storage error:`,
          galleryStorageError
        );
        throw galleryStorageError;
      }

      // Insert into product_images table
      const fullImageUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/product-images/${galleryImagePath}`;

      const { error: dbError } = await supabaseAdmin
        .from("product_images")
        .insert({
          product_id: productId,
          image_url: fullImageUrl,
        });

      if (dbError) {
        console.error(`Gallery image ${index + 1} database error:`, dbError);
        throw dbError;
      }
    });

    await Promise.all(uploadPromises);

    return {
      success: true,
      message: `Successfully uploaded ${imageFiles.length} gallery image${
        imageFiles.length > 1 ? "s" : ""
      }`,
    };
  } catch (error) {
    console.error("Gallery images upload error:", error);
    return {
      error: error.message || "Failed to upload gallery images",
      success: false,
    };
  }
}

/**
 * Deletes gallery images that are not in the keep list
 * Used when user deselects images during product edit
 *
 * @param {string} productId - Product UUID
 * @param {Array<string>} imageIdsToKeep - Array of image IDs to preserve
 * @returns {Object} { success: boolean, message?: string, error?: string }
 */
export async function deleteUnselectedProductImages(productId, imageIdsToKeep) {
  try {
    const { error: deleteImagesError } = await supabaseAdmin
      .from("product_images")
      .delete()
      .eq("product_id", productId)
      .not("id", "in", `(${imageIdsToKeep.join(",")})`);

    if (deleteImagesError) {
      console.error("Delete unselected images error:", deleteImagesError);
      return { error: deleteImagesError.message, success: false };
    }

    return { success: true, message: "Unselected images deleted successfully" };
  } catch (error) {
    console.error("Unexpected error in deleteUnselectedProductImages:", error);
    return { error: "An unexpected error occurred during image deletion" };
  }
}

/**
 * Deletes all gallery images for a product
 * Used when user removes all images during product edit
 *
 * @param {string} productId - Product UUID
 * @returns {Object} { success: boolean, message?: string, error?: string }
 */
export async function deleteAllProductImages(productId) {
  try {
    const { error: deleteAllImagesError } = await supabaseAdmin
      .from("product_images")
      .delete()
      .eq("product_id", productId);

    if (deleteAllImagesError) {
      console.error("Delete all images error:", deleteAllImagesError);
      return { error: deleteAllImagesError.message };
    }

    return {
      success: true,
      message: "All product images deleted successfully",
    };
  } catch (error) {
    console.error("Unexpected error in deleteAllProductImages:", error);
    return { error: "An unexpected error occurred during image deletion" };
  }
}
