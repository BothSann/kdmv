import { supabaseAdmin } from "@/utils/supabase/supabaseAdmin";
import { createSupabaseServerClient } from "@/utils/supabase/server";
import { generateUniqueTelephonePlaceholder } from "@/lib/utils";
import { revalidatePath } from "next/cache";

export async function getAllAdmins() {
  try {
    const { data: admins, error: adminError } = await supabaseAdmin
      .from("profiles")
      .select("*")
      .eq("role", "admin")
      .order("created_at", { ascending: false });

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

export async function getCurrentUser() {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      // console.error("No user found");
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

export async function getUserProfile(userId) {
  try {
    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (profileError) {
      console.error("Profile error:", profileError);
      return { error: profileError.message };
    }

    return { success: true, profile };
  } catch (err) {
    console.error("Unexpected error in getUserProfile:", err);
    return { error: "An unexpected error occurred while getting user profile" };
  }
}

export async function getUserRole(userId) {
  try {
    const { data: role, error: roleError } = await supabaseAdmin
      .from("profiles")
      .select("role")
      .eq("id", userId)
      .single();

    if (roleError) {
      console.error("Role error:", roleError);
      return { error: roleError.message };
    }

    return { success: true, role: role.role };
  } catch (err) {
    console.error("Unexpected error in getUserRole:", err);
    return { error: "An unexpected error occurred while getting user role" };
  }
}

export async function isPhoneNumberTaken(phoneNumber) {
  try {
    const { data: existingUser, error } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .eq("telephone", phoneNumber)
      .maybeSingle();

    if (error) {
      console.error("Phone number check error:", error);
      return { error: "Failed to check phone number" };
    }

    // If we found a user, the phone number is taken
    const isTaken = Boolean(existingUser);

    return { isTaken };
  } catch (err) {
    console.error("Unexpected error in isPhoneNumberTaken:", err);
    return {
      error:
        "An unexpected error occurred while checking phone number availability",
    };
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
