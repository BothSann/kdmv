import { supabaseAdmin } from "@/utils/supabase/supabaseAdmin";
import { PER_PAGE } from "@/lib/constants";

/**
 * Banner Data Layer - QUERIES ONLY
 * All mutations have been moved to server/actions/banner-action.js
 */

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
