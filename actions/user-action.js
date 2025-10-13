"use server";

import { supabaseAdmin } from "@/utils/supabase/supabaseAdmin";
import { createSupabaseServerClient } from "@/utils/supabase/server";

import { revalidatePath } from "next/cache";
import { isValidCambodiaPhoneNumber, sanitizeName } from "@/lib/utils";

import { getCurrentUser, getUserProfile } from "@/lib/api/server/users";

export async function updateCurrentUserProfileAction(formData) {
  try {
    const supabase = await createSupabaseServerClient();
    // 1. EARLY VALIDATIONS FIRST (fail fast)
    // Validate required fields and formats before any database operations
    const cleanFirstName = sanitizeName(formData.first_name);
    const cleanLastName = sanitizeName(formData.last_name);

    if (
      !formData.telephone.startsWith("TEMP_") &&
      !isValidCambodiaPhoneNumber(formData.telephone)
    ) {
      return { error: "Invalid Cambodian telephone number format" };
    }

    // 2. AUTHENTICATION - Get authenticated user
    const { user, error: getCurrentUserError } = await getCurrentUser();

    if (getCurrentUserError) {
      console.error("Get current user error:", getCurrentUserError);
      return { error: getCurrentUserError };
    }

    // 3. AUTHORIZATION - Validate user is admin
    const { profile, error: profileError } = await getUserProfile(user?.id);

    if (profileError) {
      console.error("Profile error:", profileError);
      return { error: profileError.message };
    }

    if (!["admin", "customer"].includes(profile.role)) {
      console.error("User is not admin or customer");
      return {
        error: "Unauthorized - Please login to update profile",
      };
    }

    // 4. BUSINESS LOGIC VALIDATIONS - Check phone number uniqueness
    const { data: existingPhone } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .eq("telephone", formData.telephone)
      .neq("id", user.id)
      .maybeSingle();

    if (existingPhone) {
      return {
        error:
          "This telephone number is already registered. Please use a different number or login with existing account.",
      };
    }

    // 5. FILE PROCESSING - Handle image upload
    let avatar_url = profile?.avatar_url || null;

    if (formData.avatar_file && formData.avatar_file.size > 0) {
      const imageName = `avatar-${user.id}-${Math.random()}`
        .replaceAll("/", "-")
        .replaceAll(" ", "-")
        .replaceAll("--", "-");

      // Upload image to Supabase Storage
      const { error: storageError } = await supabaseAdmin.storage
        .from("avatars")
        .upload(imageName, formData.avatar_file);

      if (storageError) {
        console.error("Storage error:", storageError);
        return { error: storageError.message };
      }

      avatar_url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/avatars/${imageName}`;
    }

    // 6. DATABASE UPDATES - Update user metadata
    const { error: updateUserError } =
      await supabaseAdmin.auth.admin.updateUserById(user.id, {
        user_metadata: {
          first_name: cleanFirstName,
          last_name: cleanLastName,
        },
      });

    if (updateUserError) {
      console.error("Update user error:", updateUserError);
      return { error: updateUserError.message };
    }

    // 7. DATABASE UPDATES - Update profile
    const { data: updatedProfile, error: updateProfileError } = await supabase
      .from("profiles")
      .update({
        first_name: cleanFirstName,
        last_name: cleanLastName,
        gender: formData.gender,
        telephone: formData.telephone,
        city_province: formData.city_province,
        avatar_url: avatar_url,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id)
      .select()
      .single();

    if (updateProfileError) {
      console.error("Update profile error:", updateProfileError);
      return { error: updateProfileError.message };
    }

    // 8. SUCCESS OPERATIONS
    revalidatePath("/account/profile");
    revalidatePath("/admin/account/profile");

    return {
      success: true,
      message: "Profile updated successfully",
      updatedProfile,
    };
  } catch (err) {
    console.error("Unexpected error:", err);
    return {
      error: "An unexpected error occurred during profile update",
    };
  }
}

export async function verifyAndUpdateAdminPasswordAction(formData) {
  try {
    if (formData.new_password !== formData.confirm_password) {
      return { error: "New password and confirm password do not match" };
    }

    const supabase = await createSupabaseServerClient();

    const { user, error: getCurrentUserError } = await getCurrentUser();

    if (getCurrentUserError) {
      console.error("Get current user error:", getCurrentUserError);
      return { error: getCurrentUserError };
    }

    const { profile, error: profileError } = await getUserProfile(user?.id);
    if (profileError) {
      console.error("Profile error:", profileError);
      return { error: profileError.message };
    }

    if (profile?.role !== "admin") {
      console.error("User is not admin");
      return {
        error: "Unauthorized - Please login as admin to update password",
      };
    }

    console.log("Current Authenticated User:", user);

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: formData.current_password,
    });

    if (signInError) {
      console.error("Sign in error:", signInError);
      return { error: "Current password is incorrect" };
    }

    const { error: updatePasswordError } = await supabase.auth.updateUser({
      password: formData.new_password,
    });

    if (updatePasswordError) {
      console.error("Update password error:", updatePasswordError);
      return { error: updatePasswordError.message };
    }

    revalidatePath("/admin/account/password");
    return {
      success: true,
      message: "Password updated successfully",
    };
  } catch (err) {
    console.error("Unexpected error:", err);
    return {
      error: "An unexpected error occurred during admin password update",
    };
  }
}

export async function getUserProfileAction(userId) {
  return await getUserProfile(userId);
}
