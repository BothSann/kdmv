import { supabaseAdmin } from "@/utils/supabase/supabaseAdmin";

/**
 * Banner Image Service
 * Handles image upload and deletion operations for hero banners
 */

/**
 * Upload banner image to Supabase Storage
 * @param {File} file - Image file to upload
 * @param {string} fileName - Unique file name
 */
export async function uploadBannerImage(file, fileName) {
  try {
    const { error: uploadError } = await supabaseAdmin.storage
      .from("hero-banner-images")
      .upload(fileName, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      console.error("Image upload error:", uploadError);
      return { error: uploadError.message };
    }

    // Get public URL
    const imageUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/hero-banner-images/${fileName}`;

    return {
      success: true,
      imageUrl,
    };
  } catch (err) {
    console.error("Unexpected error in uploadBannerImage:", err);
    return { error: "An unexpected error occurred during image upload" };
  }
}

/**
 * Delete banner image from Supabase Storage
 * @param {string} imageUrl - Full URL of the image to delete
 */
export async function deleteBannerImage(imageUrl) {
  try {
    // Extract file name from URL
    // URL format: https://.../storage/v1/object/public/hero-banner-images/filename.jpg
    const fileName = imageUrl.split("/hero-banner-images/")[1];

    if (!fileName) {
      return { error: "Invalid image URL" };
    }

    const { error } = await supabaseAdmin.storage
      .from("hero-banner-images")
      .remove([fileName]);

    if (error) {
      console.error("Image delete error:", error);
      return { error: error.message };
    }

    return {
      success: true,
      message: "Image deleted successfully",
    };
  } catch (err) {
    console.error("Unexpected error in deleteBannerImage:", err);
    return { error: "An unexpected error occurred during image deletion" };
  }
}
