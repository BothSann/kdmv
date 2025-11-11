"use server";

import { supabaseAdmin } from "@/utils/supabase/supabaseAdmin";
import { createSupabaseServerClient } from "@/utils/supabase/server";

import { revalidatePath } from "next/cache";
import { isValidCambodiaPhoneNumber, sanitizeName } from "@/lib/utils";

import { getCurrentUser, getUserProfile } from "@/lib/api/users";
import { profileUpdateServerSchema } from "@/lib/validations/profile";
import { changePasswordServerSchema } from "@/lib/validations/password";

export async function updateCurrentUserProfileAction(formData) {
  try {
    const supabase = await createSupabaseServerClient();

    // ════════════════════════════════════════════════════════════
    // 1. ZOD VALIDATION (fail fast with comprehensive validation)
    // ════════════════════════════════════════════════════════════
    const validation = profileUpdateServerSchema.safeParse(formData);

    if (!validation.success) {
      // Extract the first error message for user-friendly display
      const firstError = validation.error.issues[0];
      return {
        error: firstError.message,
        validationErrors: validation.error.issues, // Include all errors for debugging
      };
    }

    // Extract validated data
    const validatedData = validation.data;

    // ════════════════════════════════════════════════════════════
    // 2. ADDITIONAL SANITIZATION (defense in depth)
    // ════════════════════════════════════════════════════════════
    // Even though Zod validates format, we sanitize for extra security
    const cleanFirstName = sanitizeName(validatedData.first_name);
    const cleanLastName = sanitizeName(validatedData.last_name);

    // Additional phone number check (already validated by Zod, but keeping for legacy compatibility)
    if (
      !validatedData.telephone.startsWith("TEMP_") &&
      !isValidCambodiaPhoneNumber(validatedData.telephone)
    ) {
      return { error: "Invalid Cambodian telephone number format" };
    }

    // ════════════════════════════════════════════════════════════
    // 3. AUTHENTICATION - Get authenticated user
    // ════════════════════════════════════════════════════════════
    const { user, error: getCurrentUserError } = await getCurrentUser();

    if (getCurrentUserError) {
      console.error("Get current user error:", getCurrentUserError);
      return { error: getCurrentUserError };
    }

    // ════════════════════════════════════════════════════════════
    // 4. AUTHORIZATION - Validate user is admin or customer
    // ════════════════════════════════════════════════════════════
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

    // ════════════════════════════════════════════════════════════
    // 5. BUSINESS LOGIC VALIDATIONS - Check phone number uniqueness
    // ════════════════════════════════════════════════════════════
    const { data: existingPhone } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .eq("telephone", validatedData.telephone)
      .neq("id", user.id)
      .maybeSingle();

    if (existingPhone) {
      return {
        error:
          "This telephone number is already registered. Please use a different number or login with existing account.",
      };
    }

    // ════════════════════════════════════════════════════════════
    // 6. FILE PROCESSING - Handle image upload
    // ════════════════════════════════════════════════════════════
    let avatar_url = profile?.avatar_url || null;

    if (validatedData.avatar_file && validatedData.avatar_file.size > 0) {
      const imageName = `avatar-${user.id}-${Math.random()}`
        .replaceAll("/", "-")
        .replaceAll(" ", "-")
        .replaceAll("--", "-");

      // Upload image to Supabase Storage
      const { error: storageError } = await supabaseAdmin.storage
        .from("avatars")
        .upload(imageName, validatedData.avatar_file);

      if (storageError) {
        console.error("Storage error:", storageError);
        return { error: storageError.message };
      }

      avatar_url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/avatars/${imageName}`;
    }

    // ════════════════════════════════════════════════════════════
    // 7. DATABASE UPDATES - Update user metadata
    // ════════════════════════════════════════════════════════════
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

    // ════════════════════════════════════════════════════════════
    // 8. DATABASE UPDATES - Update profile table
    // ════════════════════════════════════════════════════════════
    const { data: updatedProfile, error: updateProfileError } = await supabase
      .from("profiles")
      .update({
        first_name: cleanFirstName,
        last_name: cleanLastName,
        gender: validatedData.gender,
        telephone: validatedData.telephone,
        city_province: validatedData.city_province,
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

    // ════════════════════════════════════════════════════════════
    // 9. SUCCESS OPERATIONS - Revalidate cache and return success
    // ════════════════════════════════════════════════════════════
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

export async function verifyAndUpdateUserPasswordAction(formData) {
  try {
    // ════════════════════════════════════════════════════════════
    // 1. ZOD VALIDATION (fail fast with comprehensive validation)
    // ════════════════════════════════════════════════════════════
    const validation = changePasswordServerSchema.safeParse(formData);

    if (!validation.success) {
      // Extract the first error message for user-friendly display
      const firstError = validation.error.issues[0];
      return {
        error: firstError.message,
        validationErrors: validation.error.issues, // Include all errors for debugging
      };
    }

    // Extract validated data
    const validatedData = validation.data;

    // ════════════════════════════════════════════════════════════
    // 2. ADDITIONAL PASSWORD MATCH CHECK (defense in depth)
    // ════════════════════════════════════════════════════════════
    // Already validated by Zod, but keeping for extra security
    if (validatedData.new_password !== validatedData.confirm_password) {
      return { error: "New password and confirm password do not match" };
    }

    // ════════════════════════════════════════════════════════════
    // 3. AUTHENTICATION - Get authenticated user
    // ════════════════════════════════════════════════════════════
    const supabase = await createSupabaseServerClient();
    const { user, error: getCurrentUserError } = await getCurrentUser();

    if (getCurrentUserError) {
      console.error("Get current user error:", getCurrentUserError);
      return { error: getCurrentUserError };
    }

    // ════════════════════════════════════════════════════════════
    // 4. AUTHORIZATION - Validate user role
    // ════════════════════════════════════════════════════════════
    const { profile, error: profileError } = await getUserProfile(user?.id);
    if (profileError) {
      console.error("Profile error:", profileError);
      return { error: profileError.message };
    }

    // ⚠️ IMPORTANT: Current code restricts to admin only!
    // Change to: if (!["admin", "customer"].includes(profile.role))
    // if you want customers to change passwords too
    if (profile?.role !== "admin") {
      console.error("User is not admin");
      return {
        error: "Unauthorized - Please login as admin to update password",
      };
    }

    // ════════════════════════════════════════════════════════════
    // 5. VERIFY CURRENT PASSWORD
    // ════════════════════════════════════════════════════════════
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: validatedData.current_password,
    });

    if (signInError) {
      console.error("Sign in error:", signInError);
      return { error: "Current password is incorrect" };
    }

    // ════════════════════════════════════════════════════════════
    // 6. UPDATE PASSWORD
    // ════════════════════════════════════════════════════════════
    const { error: updatePasswordError } = await supabase.auth.updateUser({
      password: validatedData.new_password,
    });

    if (updatePasswordError) {
      console.error("Update password error:", updatePasswordError);
      return { error: updatePasswordError.message };
    }

    // ════════════════════════════════════════════════════════════
    // 7. SUCCESS - Revalidate cache and return success
    // ════════════════════════════════════════════════════════════
    revalidatePath("/admin/account/password");
    revalidatePath("/account/settings");

    return {
      success: true,
      message: "Password updated successfully",
    };
  } catch (err) {
    console.error("Unexpected error:", err);
    return {
      error: "An unexpected error occurred during password update",
    };
  }
}

export async function getUserProfileAction(userId) {
  return await getUserProfile(userId);
}
