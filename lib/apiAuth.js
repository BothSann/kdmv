import { supabaseAdmin } from "@/utils/supabase/supabaseAdmin";
import { revalidatePath } from "next/cache";

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

function generateUniqueTelephonePlaceholder() {
  return `TEMP_${Date.now()}`;
}
