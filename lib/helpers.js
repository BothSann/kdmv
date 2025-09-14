"use server";

import { supabaseAdmin } from "@/utils/supabase/supabaseAdmin";
import { createSupabaseServerClient } from "@/utils/supabase/server";

export async function getCurrentUser() {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      console.error("No user found");
      return {
        error: "Unauthorized - Please login first to perform this action",
      };
    }

    return { success: true, user };
  } catch (err) {
    console.error("Unexpected error:", err);
    return { error: "An unexpected error occurred while getting current user" };
  }
}

export async function generateSKU(productCode, colorId, sizeId) {
  try {
    const [colorResult, sizeResult] = await Promise.all([
      supabaseAdmin
        .from("colors")
        .select("slug, name")
        .eq("id", colorId)
        .single(),
      supabaseAdmin
        .from("sizes")
        .select("slug, name")
        .eq("id", sizeId)
        .single(),
    ]);

    console.log("Color result:", colorResult);
    console.log("Size result:", sizeResult);

    const colorCode =
      (
        colorResult.data?.slug || colorResult.data?.name?.substring(0, 3)
      )?.toUpperCase() || "UNK";

    const sizeCode =
      (sizeResult.data?.slug || sizeResult.data?.name)?.toUpperCase() || "UNK";

    return `${productCode}-${colorCode}-${sizeCode}`;
  } catch (err) {
    console.error("Error generating SKU:", err);
    return `${productCode}-${colorId.slice(-8)}-${sizeId.slice(-8)}`;
  }
}

export async function generateUniqueProductCode() {
  try {
    const maxAttempts = 5;
    let attempts = 0;

    while (attempts < maxAttempts) {
      const code = Math.floor(Math.random() * 10000000000)
        .toString()
        .padStart(11, "0");

      // Check if code exists in database
      const { data: existingProduct } = await supabaseAdmin
        .from("products")
        .select("id")
        .eq("product_code", code)
        .maybeSingle();

      if (!existingProduct) {
        return code; // Code is unique
      }

      attempts++;
    }
  } catch (err) {
    console.error("Error generating unique product code:", err);
    return `${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  }
}

export async function cleanUpCreatedProduct(productId) {
  try {
    const { error: deleteError } = await supabaseAdmin
      .from("products")
      .delete()
      .eq("id", productId);

    if (deleteError) {
      console.error("Delete error:", deleteError);
      return { error: deleteError.message };
    }

    return { success: true, message: "Product cleaned up successfully" };
  } catch (err) {
    console.error("Unexpected error:", err);
    return { error: "An unexpected error occurred during product cleanup" };
  }
}

export async function cleanUpCreatedAdmin(adminId) {
  try {
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(
      adminId
    );

    if (deleteError) {
      console.error("Delete error:", deleteError);
      return { error: deleteError.message };
    }

    return { success: true, message: "Admin cleaned up successfully" };
  } catch (err) {
    console.error("Unexpected error:", err);
    return { error: "An unexpected error occurred during admin cleanup" };
  }
}

export async function createProfileForConfirmedUser(user) {
  try {
    // Check if profile already exists (safety check)
    const { data: existingProfile } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .eq("id", user.id)
      .maybeSingle();

    if (existingProfile) {
      return { success: true };
    }

    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .insert({
        id: user.id,
        email: user.email,
        first_name: user.user_metadata?.first_name,
        last_name: user.user_metadata?.last_name,
        gender: user.user_metadata?.gender,
        telephone: user.user_metadata?.telephone,
        city_province: user.user_metadata?.city_province,
        role: "customer",
      });

    if (profileError) {
      console.error("Profile creation error:", profileError);
      return { error: "Failed to create user profile" };
    }

    revalidatePath("/");
    return { success: true, message: "Profile created successfully" };
  } catch (err) {
    console.error("Unexpected error in createProfileForConfirmedUser:", err);
    return { error: "An unexpected error occurred while creating profile" };
  }
}

export async function createProfileForAdmin(user) {
  try {
    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .insert({
        id: user.id,
        email: user.email,
        first_name: user.user_metadata?.first_name,
        last_name: user.user_metadata?.last_name,
        gender: "prefer not to say",
        telephone: generateUniqueTelephonePlaceholder(),
        city_province: "Phnom Penh",
        role: "admin",
      });

    if (profileError) {
      console.error("Profile creation error:", profileError);
      return { error: "Failed to create admin profile" };
    }

    return { success: true, message: "Admin profile created successfully" };
  } catch (err) {
    console.error("Unexpected error in createProfileForAdmin:", err);
    return {
      error: "An unexpected error occurred while creating admin profile",
    };
  }
}
