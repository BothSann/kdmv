import { createSupabaseFrontendClient } from "@/utils/supabase/client";

export async function fetchUserProfile(userId) {
  try {
    const supabase = createSupabaseFrontendClient();

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (profileError) {
      console.error("Profile fetch error:", profileError);
      return { error: profileError.message };
    }

    return { success: true, profile };
  } catch (err) {
    console.error("Unexpected error in fetchUserProfile:", err);
    return {
      error: "An unexpected error occurred while fetching user profile",
    };
  }
}
