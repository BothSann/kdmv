"use server";

import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/utils/supabase/supabaseAdmin";
import { getCurrentUser, getUserProfile } from "@/lib/data/users";
import { generateUniqueImageName, sanitizeName } from "@/lib/utils";

import {
  createBanner,
  updateBanner,
  deleteBanner,
  toggleBannerActive,
  uploadBannerImage,
  deleteBannerImage,
  reorderBanners,
} from "@/lib/data/banners";

import {
  createBannerSchema,
  updateBannerSchema,
  toggleBannerActiveSchema,
  reorderBannersSchema,
} from "@/lib/validations/banner";

/**
 * Verify user is admin
 * Reusable helper function
 */
async function verifyAdmin() {
  const { user, error: getUserError } = await getCurrentUser();

  if (getUserError) {
    console.error("Get current user error:", getUserError);
    return { error: getUserError };
  }

  const { profile, error: profileError } = await getUserProfile(user?.id);

  if (profileError) {
    console.error("Profile error:", profileError);
    return { error: profileError.message };
  }

  if (profile?.role !== "admin") {
    console.error("User is not admin");
    return { error: "Unauthorized - Admin access required" };
  }

  return { user, profile };
}

/**
 * Create a new hero banner
 * @param {FormData} formData - Form data containing banner fields and image
 */
export async function createBannerAction(formData) {
  try {
    // Verify admin
    const adminCheck = await verifyAdmin();
    if (adminCheck.error) {
      return { error: adminCheck.error };
    }

    const { user } = adminCheck;

    // Extract and prepare data
    const rawData = {
      title: sanitizeName(formData.get("title")),
      subtitle: formData.get("subtitle") || "",
      link_url: formData.get("link_url") || "",
      link_text: formData.get("link_text") || "Shop Now",
      display_order: parseInt(formData.get("display_order") || "0"),
      is_active: formData.get("is_active") === "true",
    };

    // Validate data
    const validation = createBannerSchema.safeParse(rawData);
    if (!validation.success) {
      const errors = validation.error.issues
        .map((issue) => issue.message)
        .join(", ");
      return { error: errors };
    }

    const validatedData = validation.data;

    // Handle image upload
    const imageFile = formData.get("image");
    if (!imageFile || imageFile.size === 0) {
      return { error: "Banner image is required" };
    }

    // Generate unique filename and upload
    const imageName = generateUniqueImageName(imageFile);
    const uploadResult = await uploadBannerImage(imageFile, imageName);

    if (uploadResult.error) {
      return { error: `Image upload failed: ${uploadResult.error}` };
    }

    // Create banner in database
    const bannerData = {
      ...validatedData,
      image_url: uploadResult.imageUrl,
    };

    const result = await createBanner(bannerData, user.id);

    if (result.error) {
      // Cleanup: Delete uploaded image if banner creation fails
      await deleteBannerImage(uploadResult.imageUrl);
      return { error: result.error };
    }

    // Revalidate pages
    revalidatePath("/admin/banners");
    revalidatePath("/"); // Homepage where banners appear

    return {
      success: true,
      banner: result.banner,
      message: "Banner created successfully",
    };
  } catch (err) {
    console.error("Unexpected error in createBannerAction:", err);
    return { error: "An unexpected error occurred during banner creation" };
  }
}

/**
 * Update an existing hero banner
 * @param {FormData} formData - Form data containing banner fields and optional new image
 */
export async function updateBannerAction(formData) {
  try {
    // Verify admin
    const adminCheck = await verifyAdmin();
    if (adminCheck.error) {
      return { error: adminCheck.error };
    }

    const bannerId = formData.get("id");
    if (!bannerId) {
      return { error: "Banner ID is required" };
    }

    // Extract data
    const rawData = {
      id: bannerId,
      title: formData.get("title")
        ? sanitizeName(formData.get("title"))
        : undefined,
      subtitle: formData.get("subtitle") || "",
      link_url: formData.get("link_url") || "",
      link_text: formData.get("link_text"),
      display_order: formData.get("display_order")
        ? parseInt(formData.get("display_order"))
        : undefined,
      is_active: formData.get("is_active")
        ? formData.get("is_active") === "true"
        : undefined,
      existing_image_url: formData.get("existing_image_url"),
    };

    // Validate data
    const validation = updateBannerSchema.safeParse(rawData);
    if (!validation.success) {
      const errors = validation.error.issues
        .map((issue) => issue.message)
        .join(", ");
      return { error: errors };
    }

    const validatedData = validation.data;
    const updates = { ...validatedData };

    // Handle image upload if new image provided
    const imageFile = formData.get("image");
    const oldImageUrl = validatedData.existing_image_url;

    if (imageFile && imageFile.size > 0) {
      // Upload new image
      const imageName = generateUniqueImageName(imageFile);
      const uploadResult = await uploadBannerImage(imageFile, imageName);

      if (uploadResult.error) {
        return { error: `Image upload failed: ${uploadResult.error}` };
      }

      updates.image_url = uploadResult.imageUrl;

      // Delete old image after successful upload
      if (oldImageUrl) {
        await deleteBannerImage(oldImageUrl);
      }
    }

    // Remove fields that shouldn't be sent to updateBanner
    delete updates.id;
    delete updates.existing_image_url;

    // Update banner
    const result = await updateBanner(bannerId, updates);

    if (result.error) {
      // Rollback: If update failed but new image was uploaded, delete it
      if (updates.image_url && updates.image_url !== oldImageUrl) {
        await deleteBannerImage(updates.image_url);
      }
      return { error: result.error };
    }

    // Revalidate pages
    revalidatePath("/admin/banners");
    revalidatePath(`/admin/banners/${bannerId}/edit`);
    revalidatePath("/");

    return {
      success: true,
      banner: result.banner,
      message: "Banner updated successfully",
    };
  } catch (err) {
    console.error("Unexpected error in updateBannerAction:", err);
    return { error: "An unexpected error occurred during banner update" };
  }
}

/**
 * Delete a hero banner
 * @param {string} bannerId - ID of banner to delete
 * @param {string} imageUrl - URL of banner image to delete from storage
 */
export async function deleteBannerAction(bannerId, imageUrl) {
  try {
    // Verify admin
    const adminCheck = await verifyAdmin();
    if (adminCheck.error) {
      return { error: adminCheck.error };
    }

    if (!bannerId) {
      return { error: "Banner ID is required" };
    }

    // Delete banner from database
    const result = await deleteBanner(bannerId);

    if (result.error) {
      return { error: result.error };
    }

    // Delete associated image from storage
    if (imageUrl) {
      await deleteBannerImage(imageUrl);
    }

    // Revalidate pages
    revalidatePath("/admin/banners");
    revalidatePath("/");

    return {
      success: true,
      message: "Banner deleted successfully",
    };
  } catch (err) {
    console.error("Unexpected error in deleteBannerAction:", err);
    return { error: "An unexpected error occurred during banner deletion" };
  }
}

/**
 * Toggle banner active/inactive status
 * @param {string} bannerId - ID of banner to toggle
 * @param {boolean} isActive - New active status
 */
export async function toggleBannerActiveAction(bannerId, isActive) {
  try {
    // Verify admin
    const adminCheck = await verifyAdmin();
    if (adminCheck.error) {
      return { error: adminCheck.error };
    }

    // Validate input
    const validation = toggleBannerActiveSchema.safeParse({
      id: bannerId,
      is_active: isActive,
    });
    if (!validation.success) {
      const errors = validation.error.issues
        .map((issue) => issue.message)
        .join(", ");
      return { error: errors };
    }

    // Toggle status
    const result = await toggleBannerActive(bannerId, isActive);

    if (result.error) {
      return { error: result.error };
    }

    // Revalidate pages
    revalidatePath("/admin/banners");
    revalidatePath("/");

    return {
      success: true,
      banner: result.banner,
      message: result.message,
    };
  } catch (err) {
    console.error("Unexpected error in toggleBannerActiveAction:", err);
    return { error: "An unexpected error occurred" };
  }
}

/**
 * Reorder banners (update display_order for multiple banners)
 * @param {Array} bannerOrders - Array of {id, display_order} objects
 */
export async function reorderBannersAction(bannerOrders) {
  try {
    // Verify admin
    const adminCheck = await verifyAdmin();
    if (adminCheck.error) {
      return { error: adminCheck.error };
    }

    // Validate input
    const validation = reorderBannersSchema.safeParse({
      banner_orders: bannerOrders,
    });
    if (!validation.success) {
      const errors = validation.error.issues
        .map((issue) => issue.message)
        .join(", ");
      return { error: errors };
    }

    // Reorder banners
    const result = await reorderBanners(validation.data.banner_orders);

    if (result.error) {
      return { error: result.error };
    }

    // Revalidate pages
    revalidatePath("/admin/banners");
    revalidatePath("/");

    return {
      success: true,
      message: result.message,
    };
  } catch (err) {
    console.error("Unexpected error in reorderBannersAction:", err);
    return { error: "An unexpected error occurred during banner reordering" };
  }
}
