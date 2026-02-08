import { supabaseAdmin } from "@/utils/supabase/supabaseAdmin";

// ============================================================================
// PRODUCT TYPES
// ============================================================================

export async function getAllProductTypesAdmin() {
  try {
    const { data: productTypes, error } = await supabaseAdmin
      .from("product_types")
      .select("*")
      .order("display_order", { ascending: true });

    if (error) {
      console.error("Product types fetch error:", error);
      return { error: "Failed to fetch product types" };
    }

    return { success: true, productTypes };
  } catch (err) {
    console.error("Unexpected error in getAllProductTypesAdmin:", err);
    return { error: "An unexpected error occurred while fetching product types" };
  }
}

export async function getProductTypeById(id) {
  try {
    const { data: productType, error } = await supabaseAdmin
      .from("product_types")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) {
      console.error("Product type fetch error:", error);
      return { error: "Failed to fetch product type" };
    }

    return { success: true, productType };
  } catch (err) {
    console.error("Unexpected error in getProductTypeById:", err);
    return { error: "An unexpected error occurred" };
  }
}

export async function isProductTypeNameTaken(name) {
  try {
    const { data, error } = await supabaseAdmin
      .from("product_types")
      .select("id")
      .ilike("name", name)
      .maybeSingle();

    if (error) {
      console.error("Product type name check error:", error);
      return { error: "Failed to check product type name" };
    }

    return { isTaken: !!data };
  } catch (err) {
    console.error("Unexpected error in isProductTypeNameTaken:", err);
    return { error: "An unexpected error occurred" };
  }
}

export async function isProductTypeNameTakenByOther(name, excludeId) {
  try {
    const { data, error } = await supabaseAdmin
      .from("product_types")
      .select("id")
      .ilike("name", name)
      .neq("id", excludeId)
      .maybeSingle();

    if (error) {
      console.error("Product type name check error:", error);
      return { error: "Failed to check product type name" };
    }

    return { isTaken: !!data };
  } catch (err) {
    console.error("Unexpected error in isProductTypeNameTakenByOther:", err);
    return { error: "An unexpected error occurred" };
  }
}

// ============================================================================
// GENDERS
// ============================================================================

export async function getAllGendersAdmin() {
  try {
    const { data: genders, error } = await supabaseAdmin
      .from("genders")
      .select("*")
      .order("display_order", { ascending: true });

    if (error) {
      console.error("Genders fetch error:", error);
      return { error: "Failed to fetch genders" };
    }

    return { success: true, genders };
  } catch (err) {
    console.error("Unexpected error in getAllGendersAdmin:", err);
    return { error: "An unexpected error occurred while fetching genders" };
  }
}

export async function getGenderById(id) {
  try {
    const { data: gender, error } = await supabaseAdmin
      .from("genders")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) {
      console.error("Gender fetch error:", error);
      return { error: "Failed to fetch gender" };
    }

    return { success: true, gender };
  } catch (err) {
    console.error("Unexpected error in getGenderById:", err);
    return { error: "An unexpected error occurred" };
  }
}

export async function isGenderNameTaken(name) {
  try {
    const { data, error } = await supabaseAdmin
      .from("genders")
      .select("id")
      .ilike("name", name)
      .maybeSingle();

    if (error) {
      console.error("Gender name check error:", error);
      return { error: "Failed to check gender name" };
    }

    return { isTaken: !!data };
  } catch (err) {
    console.error("Unexpected error in isGenderNameTaken:", err);
    return { error: "An unexpected error occurred" };
  }
}

export async function isGenderNameTakenByOther(name, excludeId) {
  try {
    const { data, error } = await supabaseAdmin
      .from("genders")
      .select("id")
      .ilike("name", name)
      .neq("id", excludeId)
      .maybeSingle();

    if (error) {
      console.error("Gender name check error:", error);
      return { error: "Failed to check gender name" };
    }

    return { isTaken: !!data };
  } catch (err) {
    console.error("Unexpected error in isGenderNameTakenByOther:", err);
    return { error: "An unexpected error occurred" };
  }
}

export async function getAllActiveGenders() {
  try {
    const { data: genders, error } = await supabaseAdmin
      .from("genders")
      .select("*")
      .eq("is_active", true)
      .order("display_order", { ascending: true });

    if (error) {
      console.error("Active genders fetch error:", error);
      return { error: "Failed to fetch active genders" };
    }

    return { success: true, genders };
  } catch (err) {
    console.error("Unexpected error in getAllActiveGenders:", err);
    return { error: "An unexpected error occurred while fetching genders" };
  }
}
