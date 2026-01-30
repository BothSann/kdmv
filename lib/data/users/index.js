import { supabaseAdmin } from "@/utils/supabase/supabaseAdmin";
import { createSupabaseServerClient } from "@/utils/supabase/server";

/**
 * User Data Layer - QUERIES ONLY
 * All mutations have been moved to server/actions/auth-action.js
 */

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
