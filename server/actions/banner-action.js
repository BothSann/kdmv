"use server";

import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/utils/supabase/supabaseAdmin";
import { getCurrentUser, getUserProfile } from "@/lib/data/users";
import { generateUniqueImageName, sanitizeName } from "@/lib/utils";

import {
  uploadBannerImage,
  deleteBannerImage,
} from "@/server/services/banners/imageService";

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

    // Create banner in database (inlined)
    const { data: banner, error: bannerError } = await supabaseAdmin
      .from("hero_banners")
      .insert({
        title: validatedData.title,
        subtitle: validatedData.subtitle || null,
        image_url: uploadResult.imageUrl,
        link_url: validatedData.link_url || null,
        link_text: validatedData.link_text || "Shop Now",
        display_order: validatedData.display_order ?? 0,
        is_active: validatedData.is_active ?? true,
        created_by: user.id,
      })
      .select()
      .single();

    if (bannerError) {
      // Cleanup: Delete uploaded image if banner creation fails
      await deleteBannerImage(uploadResult.imageUrl);
      console.error("Banner creation error:", bannerError);
      return { error: bannerError.message };
    }

    // Revalidate pages
    revalidatePath("/admin/banners");
    revalidatePath("/"); // Homepage where banners appear

    return {
      success: true,
      banner,
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

    // Remove fields that shouldn't be sent to database update
    delete updates.id;
    delete updates.existing_image_url;

    // Build update object with only provided fields (inlined)
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

    const { data: banner, error: bannerError } = await supabaseAdmin
      .from("hero_banners")
      .update(updateData)
      .eq("id", bannerId)
      .select()
      .single();

    if (bannerError) {
      // Rollback: If update failed but new image was uploaded, delete it
      if (updates.image_url && updates.image_url !== oldImageUrl) {
        await deleteBannerImage(updates.image_url);
      }
      console.error("Banner update error:", bannerError);
      return { error: bannerError.message };
    }

    // Revalidate pages
    revalidatePath("/admin/banners");
    revalidatePath(`/admin/banners/${bannerId}/edit`);
    revalidatePath("/");

    return {
      success: true,
      banner,
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

    // Delete banner from database (inlined)
    const { error: bannerError } = await supabaseAdmin
      .from("hero_banners")
      .delete()
      .eq("id", bannerId);

    if (bannerError) {
      console.error("Banner delete error:", bannerError);
      return { error: bannerError.message };
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

    // Toggle status (inlined)
    const { data: banner, error: bannerError } = await supabaseAdmin
      .from("hero_banners")
      .update({
        is_active: isActive,
        updated_at: new Date().toISOString(),
      })
      .eq("id", bannerId)
      .select()
      .single();

    if (bannerError) {
      console.error("Toggle banner active error:", bannerError);
      return { error: bannerError.message };
    }

    // Revalidate pages
    revalidatePath("/admin/banners");
    revalidatePath("/");

    return {
      success: true,
      banner,
      message: `Banner ${isActive ? "activated" : "deactivated"} successfully`,
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

    // Reorder banners (inlined)
    const updatePromises = validation.data.banner_orders.map(
      ({ id, display_order }) =>
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

    // Revalidate pages
    revalidatePath("/admin/banners");
    revalidatePath("/");

    return {
      success: true,
      message: "Banners reordered successfully",
    };
  } catch (err) {
    console.error("Unexpected error in reorderBannersAction:", err);
    return { error: "An unexpected error occurred during banner reordering" };
  }
}
