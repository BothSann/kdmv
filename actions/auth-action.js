"use server";

import { supabaseAdmin } from "@/utils/supabase/supabaseAdmin";
import { createSupabaseServerClient } from "@/utils/supabase/server";

import { revalidatePath } from "next/cache";
import { isValidCambodiaPhoneNumber, sanitizeName } from "@/lib/utils";
import { getBaseUrl } from "@/lib/config";

import {
  cleanUpCreatedAdmin,
  createProfileForAdmin,
  getCurrentUser,
  getUserProfile,
  isPhoneNumberTaken,
} from "@/lib/api/server/users";

export async function registerUserAction(formData) {
  try {
    // 2. Validate phone number format
    if (!isValidCambodiaPhoneNumber(formData.telephone)) {
      return { error: "Invalid Cambodian telephone number format" };
    }
    // 3. Check if telephone is already used by confirmed users
    const { isTaken, error: phoneNumberError } = await isPhoneNumberTaken(
      formData.telephone
    );

    if (phoneNumberError) {
      console.error("Phone number error:", phoneNumberError);
      return { error: phoneNumberError.message };
    }

    if (isTaken) {
      return {
        error:
          "This telephone number is already registered. Please use a different number or login with existing account.",
      };
    }

    // 4. Try to sign up - Supabase handles existing users automatically
    const { data: authData, error: authError } =
      await supabaseAdmin.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            first_name: formData.first_name,
            last_name: formData.last_name,
            gender: formData.gender,
            telephone: formData.telephone,
            city_province: formData.city_province,
          },
          emailRedirectTo: `${getBaseUrl()}/auth/confirm`,
        },
      });

    // 5. Handle auth errors
    if (authError) {
      console.error("Auth error:", authError);
      return { error: authError.message };
    }

    // 6.There is no email_verified in user_metadata when user is already registered and confirmed
    if (authData.user?.user_metadata?.email_verified === undefined) {
      return {
        error: "This email is already registered. Please login instead.",
      };
    }

    console.log("Auth data:", authData);

    // 7. Return success - profile will be created after email confirmation
    return {
      authData,
      success: true,
      message:
        "The confirmation email has been sent. Please check your email to confirm your account.",
    };
  } catch (err) {
    console.error("Unexpected error:", err);
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

    console.log("Auth data:", authData);

    const profileResult = await createProfileForAdmin(authData.user);

    if (profileResult.error) {
      await cleanUpCreatedAdmin(authData.user.id);
      console.error("Profile creation error:", profileResult.error);
      return { error: profileResult.error };
    }

    if (profileResult.success) {
      console.log("Profile creation success:", profileResult.message);
    }

    console.log("Profile result:", profileResult);

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
