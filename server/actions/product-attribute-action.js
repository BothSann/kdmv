"use server";

import { supabaseAdmin } from "@/utils/supabase/supabaseAdmin";
import { revalidatePath } from "next/cache";
import { getCurrentUser, getUserProfile } from "@/lib/data/users";
import {
  isProductTypeNameTaken,
  isProductTypeNameTakenByOther,
  isGenderNameTaken,
  isGenderNameTakenByOther,
} from "@/lib/data/product-attributes";

// ============================================================================
// HELPERS
// ============================================================================

async function requireAdmin() {
  const { user, error: getCurrentUserError } = await getCurrentUser();
  if (getCurrentUserError) {
    return { error: getCurrentUserError };
  }

  const { profile, error: profileError } = await getUserProfile(user?.id);
  if (profileError) {
    return { error: profileError.message };
  }

  if (profile?.role !== "admin") {
    return { error: "Unauthorized - Admin access required" };
  }

  return { user, profile };
}

// ============================================================================
// PRODUCT TYPE ACTIONS
// ============================================================================

export async function createProductTypeAction(formData) {
  try {
    const { error: authError } = await requireAdmin();
    if (authError) return { error: authError };

    const { isTaken, error: nameError } = await isProductTypeNameTaken(
      formData.name
    );
    if (nameError) return { error: nameError };
    if (isTaken) {
      return { error: "A product type with this name already exists." };
    }

    const { data: productType, error } = await supabaseAdmin
      .from("product_types")
      .insert({
        name: formData.name,
        slug: formData.slug,
        display_order: formData.display_order,
        is_active: formData.is_active,
      })
      .select()
      .single();

    if (error) {
      console.error("Create product type error:", error);
      return { error: error.message };
    }

    revalidatePath("/admin/products/attributes");
    revalidatePath("/admin/products");
    revalidatePath("/products");

    return {
      success: true,
      message: "Product type created successfully",
      productType,
    };
  } catch (err) {
    console.error("Unexpected error in createProductTypeAction:", err);
    return { error: "An unexpected error occurred" };
  }
}

export async function updateProductTypeAction(formData) {
  try {
    const { error: authError } = await requireAdmin();
    if (authError) return { error: authError };

    const { isTaken, error: nameError } = await isProductTypeNameTakenByOther(
      formData.name,
      formData.id
    );
    if (nameError) return { error: nameError };
    if (isTaken) {
      return { error: "A product type with this name already exists." };
    }

    const { data: productType, error } = await supabaseAdmin
      .from("product_types")
      .update({
        name: formData.name,
        slug: formData.slug,
        display_order: formData.display_order,
        is_active: formData.is_active,
        updated_at: new Date().toISOString(),
      })
      .eq("id", formData.id)
      .select()
      .single();

    if (error) {
      console.error("Update product type error:", error);
      return { error: error.message };
    }

    revalidatePath("/admin/products/attributes");
    revalidatePath("/admin/products");
    revalidatePath("/products");

    return {
      success: true,
      message: "Product type updated successfully",
      productType,
    };
  } catch (err) {
    console.error("Unexpected error in updateProductTypeAction:", err);
    return { error: "An unexpected error occurred" };
  }
}

export async function deleteProductTypeAction(id) {
  try {
    const { error: authError } = await requireAdmin();
    if (authError) return { error: authError };

    // Check if any products reference this type
    const { count, error: countError } = await supabaseAdmin
      .from("products")
      .select("id", { count: "exact", head: true })
      .eq("product_type_id", id);

    if (countError) {
      console.error("Product count error:", countError);
      return { error: "Failed to check product references" };
    }

    if (count > 0) {
      return {
        error: `Cannot delete: ${count} product${count > 1 ? "s" : ""} use this type. Reassign them first.`,
      };
    }

    const { error } = await supabaseAdmin
      .from("product_types")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Delete product type error:", error);
      return { error: error.message };
    }

    revalidatePath("/admin/products/attributes");
    revalidatePath("/admin/products");
    revalidatePath("/products");

    return { success: true, message: "Product type deleted successfully" };
  } catch (err) {
    console.error("Unexpected error in deleteProductTypeAction:", err);
    return { error: "An unexpected error occurred" };
  }
}

// ============================================================================
// GENDER ACTIONS
// ============================================================================

export async function createGenderAction(formData) {
  try {
    const { error: authError } = await requireAdmin();
    if (authError) return { error: authError };

    const { isTaken, error: nameError } = await isGenderNameTaken(
      formData.name
    );
    if (nameError) return { error: nameError };
    if (isTaken) {
      return { error: "A gender with this name already exists." };
    }

    const { data: gender, error } = await supabaseAdmin
      .from("genders")
      .insert({
        name: formData.name,
        slug: formData.slug,
        display_order: formData.display_order,
        is_active: formData.is_active,
      })
      .select()
      .single();

    if (error) {
      console.error("Create gender error:", error);
      return { error: error.message };
    }

    revalidatePath("/admin/products/attributes");
    revalidatePath("/admin/products");
    revalidatePath("/products");

    return {
      success: true,
      message: "Gender created successfully",
      gender,
    };
  } catch (err) {
    console.error("Unexpected error in createGenderAction:", err);
    return { error: "An unexpected error occurred" };
  }
}

export async function updateGenderAction(formData) {
  try {
    const { error: authError } = await requireAdmin();
    if (authError) return { error: authError };

    const { isTaken, error: nameError } = await isGenderNameTakenByOther(
      formData.name,
      formData.id
    );
    if (nameError) return { error: nameError };
    if (isTaken) {
      return { error: "A gender with this name already exists." };
    }

    const { data: gender, error } = await supabaseAdmin
      .from("genders")
      .update({
        name: formData.name,
        slug: formData.slug,
        display_order: formData.display_order,
        is_active: formData.is_active,
        updated_at: new Date().toISOString(),
      })
      .eq("id", formData.id)
      .select()
      .single();

    if (error) {
      console.error("Update gender error:", error);
      return { error: error.message };
    }

    revalidatePath("/admin/products/attributes");
    revalidatePath("/admin/products");
    revalidatePath("/products");

    return {
      success: true,
      message: "Gender updated successfully",
      gender,
    };
  } catch (err) {
    console.error("Unexpected error in updateGenderAction:", err);
    return { error: "An unexpected error occurred" };
  }
}

export async function deleteGenderAction(id) {
  try {
    const { error: authError } = await requireAdmin();
    if (authError) return { error: authError };

    // Check if any products reference this gender
    const { count, error: countError } = await supabaseAdmin
      .from("products")
      .select("id", { count: "exact", head: true })
      .eq("gender_id", id);

    if (countError) {
      console.error("Product count error:", countError);
      return { error: "Failed to check product references" };
    }

    if (count > 0) {
      return {
        error: `Cannot delete: ${count} product${count > 1 ? "s" : ""} use this gender. Reassign them first.`,
      };
    }

    const { error } = await supabaseAdmin
      .from("genders")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Delete gender error:", error);
      return { error: error.message };
    }

    revalidatePath("/admin/products/attributes");
    revalidatePath("/admin/products");
    revalidatePath("/products");

    return { success: true, message: "Gender deleted successfully" };
  } catch (err) {
    console.error("Unexpected error in deleteGenderAction:", err);
    return { error: "An unexpected error occurred" };
  }
}
