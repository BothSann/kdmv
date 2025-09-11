import { supabaseAdmin } from "@/utils/supabase/supabaseAdmin";

export async function getAllAdmins() {
  try {
    const { data: admins, error: adminError } = await supabaseAdmin
      .from("profiles")
      .select("*")
      .eq("role", "admin");

    if (adminError) {
      console.error("Admins fetch error:", adminError);
      return { error: "Failed to fetch admins" };
    }

    return {
      success: true,
      admins,
    };
  } catch (err) {
    console.error("Unexpected error in getAllAdmins:", err);
    return { error: "An unexpected error occurred while fetching admins" };
  }
}
