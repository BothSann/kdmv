import { supabaseAdmin } from "@/utils/supabase/supabaseAdmin";
import { PER_PAGE } from "@/lib/constants";

/**
 * Get all banners with pagination (for admin panel)
 * Includes both active and inactive banners
 */
export async function getAllBanners({ page = 1, perPage = PER_PAGE } = {}) {
  const from = (page - 1) * perPage;
  const to = from + perPage - 1;

  try {
    const {
      data: banners,
      error,
      count,
    } = await supabaseAdmin
      .from("hero_banners")
      .select("*", { count: "exact" })
      .range(from, to)
      .order("display_order", { ascending: true })
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Banners fetch error:", error);
      return { error: "Failed to fetch banners" };
    }

    return {
      success: true,
      banners,
      pagination: {
        page,
        perPage,
        count,
        totalPages: Math.ceil(count / perPage),
        hasNextPage: page * perPage < count,
        hasPreviousPage: page > 1,
      },
    };
  } catch (err) {
    console.error("Unexpected error in getAllBanners:", err);
    return { error: "An unexpected error occurred while fetching banners" };
  }
}

/**
 * Get only active banners (for customer-facing homepage)
 * No pagination - returns all active banners ordered by display_order
 */
export async function getActiveBanners() {
  try {
    const { data: banners, error } = await supabaseAdmin
      .from("hero_banners")
      .select("*")
      .eq("is_active", true)
      .order("display_order", { ascending: true })
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Active banners fetch error:", error);
      return { error: "Failed to fetch active banners" };
    }

    return {
      success: true,
      banners: banners || [],
    };
  } catch (err) {
    console.error("Unexpected error in getActiveBanners:", err);
    return {
      error: "An unexpected error occurred while fetching active banners",
    };
  }
}

/**
 * Get a single banner by ID
 */
export async function getBannerById(bannerId) {
  try {
    const { data: banner, error } = await supabaseAdmin
      .from("hero_banners")
      .select("*")
      .eq("id", bannerId)
      .maybeSingle();

    if (error) {
      console.error("Banner fetch error:", error);
      return { error: "Failed to fetch banner" };
    }

    if (!banner) {
      return { error: "Banner not found" };
    }

    return {
      success: true,
      banner,
    };
  } catch (err) {
    console.error("Unexpected error in getBannerById:", err);
    return { error: "An unexpected error occurred" };
  }
}

/**
 * Create a new banner
 * @param {Object} bannerData - Banner data including image_url
 * @param {string} userId - ID of the user creating the banner
 */
export async function createBanner(bannerData, userId) {
  try {
    const { data: banner, error } = await supabaseAdmin
      .from("hero_banners")
      .insert({
        title: bannerData.title,
        subtitle: bannerData.subtitle || null,
        image_url: bannerData.image_url,
        link_url: bannerData.link_url || null,
        link_text: bannerData.link_text || "Shop Now",
        display_order: bannerData.display_order ?? 0,
        is_active: bannerData.is_active ?? true,
        created_by: userId,
      })
      .select()
      .single();

    if (error) {
      console.error("Banner creation error:", error);
      return { error: error.message };
    }

    return {
      success: true,
      banner,
      message: "Banner created successfully",
    };
  } catch (err) {
    console.error("Unexpected error in createBanner:", err);
    return { error: "An unexpected error occurred during banner creation" };
  }
}

/**
 * Update an existing banner
 * @param {string} bannerId - ID of the banner to update
 * @param {Object} updates - Fields to update
 */
export async function updateBanner(bannerId, updates) {
  try {
    // Build update object with only provided fields
    const updateData = {
      updated_at: new Date().toISOString(),
    };

    if (updates.title !== undefined) updateData.title = updates.title;
    if (updates.subtitle !== undefined)
      updateData.subtitle = updates.subtitle || null;
    if (updates.image_url !== undefined)
      updateData.image_url = updates.image_url;
    if (updates.link_url !== undefined)
      updateData.link_url = updates.link_url || null;
    if (updates.link_text !== undefined)
      updateData.link_text = updates.link_text;
    if (updates.display_order !== undefined)
      updateData.display_order = updates.display_order;
    if (updates.is_active !== undefined)
      updateData.is_active = updates.is_active;

    const { data: banner, error } = await supabaseAdmin
      .from("hero_banners")
      .update(updateData)
      .eq("id", bannerId)
      .select()
      .single();

    if (error) {
      console.error("Banner update error:", error);
      return { error: error.message };
    }

    return {
      success: true,
      banner,
      message: "Banner updated successfully",
    };
  } catch (err) {
    console.error("Unexpected error in updateBanner:", err);
    return { error: "An unexpected error occurred during banner update" };
  }
}

/**
 * Delete a banner
 * @param {string} bannerId - ID of the banner to delete
 */
export async function deleteBanner(bannerId) {
  try {
    const { error } = await supabaseAdmin
      .from("hero_banners")
      .delete()
      .eq("id", bannerId);

    if (error) {
      console.error("Banner delete error:", error);
      return { error: error.message };
    }

    return {
      success: true,
      message: "Banner deleted successfully",
    };
  } catch (err) {
    console.error("Unexpected error in deleteBanner:", err);
    return { error: "An unexpected error occurred during banner deletion" };
  }
}

/**
 * Toggle banner active status
 * @param {string} bannerId - ID of the banner
 * @param {boolean} isActive - New active status
 */
export async function toggleBannerActive(bannerId, isActive) {
  try {
    const { data: banner, error } = await supabaseAdmin
      .from("hero_banners")
      .update({
        is_active: isActive,
        updated_at: new Date().toISOString(),
      })
      .eq("id", bannerId)
      .select()
      .single();

    if (error) {
      console.error("Toggle banner active error:", error);
      return { error: error.message };
    }

    return {
      success: true,
      banner,
      message: `Banner ${isActive ? "activated" : "deactivated"} successfully`,
    };
  } catch (err) {
    console.error("Unexpected error in toggleBannerActive:", err);
    return { error: "An unexpected error occurred" };
  }
}

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

/**
 * Reorder banners (batch update display_order)
 * @param {Array} bannerOrders - Array of {id, display_order} objects
 */
export async function reorderBanners(bannerOrders) {
  try {
    // Update each banner's display_order
    const updatePromises = bannerOrders.map(({ id, display_order }) =>
      supabaseAdmin
        .from("hero_banners")
        .update({ display_order, updated_at: new Date().toISOString() })
        .eq("id", id)
    );

    const results = await Promise.all(updatePromises);

    // Check if any updates failed
    const failedUpdates = results.filter((result) => result.error);
    if (failedUpdates.length > 0) {
      console.error("Some banner reorders failed:", failedUpdates);
      return { error: "Failed to reorder some banners" };
    }

    return {
      success: true,
      message: "Banners reordered successfully",
    };
  } catch (err) {
    console.error("Unexpected error in reorderBanners:", err);
    return { error: "An unexpected error occurred during banner reordering" };
  }
}
