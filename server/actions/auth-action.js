"use server";

import { supabaseAdmin } from "@/utils/supabase/supabaseAdmin";
import { createSupabaseServerClient } from "@/utils/supabase/server";

import { revalidatePath } from "next/cache";
import {
  sanitizeName,
  generateUniqueTelephonePlaceholder,
} from "@/lib/utils";
import { getBaseUrl } from "@/lib/config";

import {
  getCurrentUser,
  getUserProfile,
  isPhoneNumberTaken,
} from "@/lib/data/users";
import { registerSchema } from "@/lib/validations/auth";

export async function registerUserAction(formData) {
  try {
    // ========================================
    // STEP 1: VALIDATE WITH ZOD SCHEMA
    // ========================================
    const validation = registerSchema.safeParse(formData);

    // The  standard property name that Zod uses for validation errors. When you call safeParse() on a Zod schema and validation fails, Zod returns an object with a success: false property and an error property that contains a ZodError instance. This ZodError instance has an issues array that contains all the validation errors.
    if (!validation.success) {
      const firstError = validation.error.issues[0];
      return {
        error: firstError.message,
        field: firstError.path[0],
      };
    }

    // ========================================
    // STEP 2: SANITIZE VALIDATED DATA
    // ========================================
    const validatedData = validation.data;

    const sanitizedData = {
      ...validatedData,
      first_name: sanitizeName(validatedData.first_name),
      last_name: sanitizeName(validatedData.last_name),
      email: validatedData.email.toLowerCase().trim(),
      telephone: validatedData.telephone.trim(),
    };

    // ========================================
    // STEP 3: BUSINESS LOGIC VALIDATIONS
    // ========================================

    // Check if telephone is already taken
    const { isTaken, error: phoneNumberError } = await isPhoneNumberTaken(
      sanitizedData.telephone
    );

    if (phoneNumberError) {
      console.error("Phone number check error:", phoneNumberError);
      return { error: "Failed to verify telephone number" };
    }

    if (isTaken) {
      return {
        error:
          "This telephone number is already registered. Please use a different number or login with existing account.",
      };
    }

    // ========================================
    // STEP 4: CREATE USER ACCOUNT
    // ========================================

    const { data: authData, error: authError } =
      await supabaseAdmin.auth.signUp({
        email: sanitizedData.email,
        password: sanitizedData.password, // Never log passwords!
        options: {
          data: {
            first_name: sanitizedData.first_name,
            last_name: sanitizedData.last_name,
            gender: sanitizedData.gender,
            telephone: sanitizedData.telephone,
            city_province: sanitizedData.city_province,
          },
          emailRedirectTo: `${getBaseUrl()}/auth/confirm`,
        },
      });

    if (authError) {
      console.error("Auth error:", authError);
      return { error: authError.message };
    }

    // Check if email already exists (Supabase specific)
    if (authData.user?.user_metadata?.email_verified === undefined) {
      return {
        error: "This email is already registered. Please login instead.",
      };
    }

    // ========================================
    // STEP 5: SUCCESS RESPONSE
    // ========================================

    return {
      success: true,
      message:
        "The confirmation email has been sent. Please check your email to confirm your account.",
      authData,
    };
  } catch (err) {
    console.error("Unexpected error in registerUserAction:", err);
    return { error: "An unexpected error occurred during registration" };
  }
}

export async function registerAdminAction(formData) {
  try {
    const cleanFirstName = sanitizeName(formData.first_name);
    const cleanLastName = sanitizeName(formData.last_name);

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
        error: "Unauthorized - Please login as admin to register admin",
      };
    }

    const { data: authData, error: authError } =
      await supabaseAdmin.auth.admin.createUser({
        email: formData.email,
        password: formData.password,
        email_confirm: true, // Auto confirm email
        user_metadata: {
          first_name: cleanFirstName,
          last_name: cleanLastName,
          role: "admin",
        },
      });

    if (authError) {
      console.error("Auth error:", authError);
      return { error: authError.message };
    }

    // Create admin profile (inlined)
    const { error: profileCreationError } = await supabaseAdmin
      .from("profiles")
      .insert({
        id: authData.user.id,
        email: authData.user.email,
        first_name: authData.user.user_metadata?.first_name,
        last_name: authData.user.user_metadata?.last_name,
        gender: "prefer not to say",
        telephone: generateUniqueTelephonePlaceholder(),
        city_province: "Phnom Penh",
        role: "admin",
      });

    if (profileCreationError) {
      // Clean up created admin (inlined)
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
      console.error("Profile creation error:", profileCreationError);
      return { error: "Failed to create admin profile" };
    }

    revalidatePath("/admin/users");
    return {
      success: true,
      message: "Admin registered successfully",
      authData,
    };
  } catch (err) {
    console.error("Unexpected error:", err);
    return { error: "An unexpected error occurred during admin registration" };
  }
}

export async function loginUserAction(formData) {
  try {
    const supabase = await createSupabaseServerClient();

    const { data: authData, error: authError } =
      await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

    if (authError) {
      console.error("Auth error:", authError);
      return { error: authError.message };
    }

    revalidatePath("/");
    revalidatePath("/admin/dashboard");

    return {
      success: true,
      message: "Logged in successfully!",
      user: authData.user,
    };
  } catch (err) {
    console.error("Unexpected error:", err);
    return { error: "An unexpected error occurred during login" };
  }
}

export async function logoutUserAction() {
  try {
    const supabase = await createSupabaseServerClient();
    const { error: signOutError } = await supabase.auth.signOut();

    if (signOutError) {
      console.error("Sign out error:", signOutError);
      return { error: signOutError.message };
    }

    return { success: true, message: "Logged out successfully!" };
  } catch (err) {
    console.error("Unexpected error:", err);
    return { error: "An unexpected error occurred during logout" };
  }
}

export async function getCurrentUserAction() {
  return await getCurrentUser();
}

export async function sendPasswordResetEmailAction(email) {
  try {
    // ========================================
    // STEP 1: VALIDATE EMAIL
    // ========================================
    if (!email || typeof email !== "string") {
      return { error: "Valid email address is required" };
    }

    const sanitizedEmail = email.toLowerCase().trim();

    // ========================================
    // STEP 2: SEND PASSWORD RESET EMAIL
    // ========================================
    const { data, error } = await supabaseAdmin.auth.resetPasswordForEmail(
      sanitizedEmail
    );

    // ========================================
    // STEP 3: HANDLE RESPONSE
    // ========================================
    // Security best practice: Always return success message
    // Don't reveal whether the email exists in the system
    if (error) {
      console.error("Password reset email error:", error);
      // Still return success to prevent email enumeration
    }

    return {
      success: true,
      message:
        "If an account exists with that email, we've sent a password reset link. Please check your inbox.",
    };
  } catch (err) {
    console.error("Unexpected error in sendPasswordResetEmailAction:", err);
    // Still return success to prevent email enumeration
    return {
      success: true,
      message:
        "If an account exists with that email, we've sent a password reset link. Please check your inbox.",
    };
  }
}

/**
 * Creates a profile for a confirmed user (called from email confirmation callback)
 * This function is used when a user confirms their email address
 */
export async function createProfileForConfirmedUserAction(user) {
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
    console.error("Unexpected error in createProfileForConfirmedUserAction:", err);
    return { error: "An unexpected error occurred while creating profile" };
  }
}
