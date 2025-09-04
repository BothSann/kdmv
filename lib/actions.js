"use server";

import { supabaseAdmin } from "@/utils/supabase/supabaseAdmin";
import { createSupabaseServerClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function registerUserAction(formData) {
  // 1. Extract the form data
  const {
    first_name,
    last_name,
    email,
    password,
    gender,
    telephone,
    city_province,
  } = Object.fromEntries(formData);

  try {
    // 2. Validate phone number format (if provided)
    const cambodiaPhoneNumberRegex =
      /^(?:\+855|0)(?:(?:[1-9]\d|2[3-7]|3[1-6]|4[2-4]|5[1-5]|6[0-9]|7[0-9]|8[0-9]|9[0-9])\d{6,7}|(?:[1-9]\d{7,8}))$/;

    if (!cambodiaPhoneNumberRegex.test(telephone)) {
      return { error: "Invalid telephone number" };
    }

    const supabase = await createSupabaseServerClient();
    // 3. Check if telephone already exists (if provided)
    const { data: existingProfiles, error: checkError } = await supabase
      .from("profiles")
      .select("id")
      .eq("telephone", telephone)
      .maybeSingle();

    if (checkError) {
      console.error("Check error:", checkError);
      return { error: "Failed to validate telephone number" };
    }

    if (existingProfiles) {
      console.error("Existing profile:", existingProfiles);
      return {
        error:
          "This telephone number is already registered. Please use a different number or login with existing account.",
      };
    }

    // 4. Sign up the user in supabase Users table
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: email,
      password: password,
      options: {
        data: {
          first_name: first_name,
          last_name: last_name,
        },
      },
    });

    // 5. Handle auth errors
    if (authError) {
      console.error("Auth error:", authError);
      return { error: authError.message };
    }

    // 6. Create a complete profile in profiles table using Service Role
    // Note: Always create profile regardless of confirmation status
    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .insert({
        id: authData.user.id,
        first_name: first_name,
        last_name: last_name,
        email: email,
        role: "customer",
        gender: gender,
        telephone: telephone,
        city_province: city_province,
      });

    if (profileError) {
      console.error("Profile error:", profileError);
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
      return { error: profileError.message };
    }

    // 7. Check if email confirmation is required (session is null but user exists)
    if (authData.user && !authData.session) {
      return {
        success: true,
        message: "Please check your email to confirm your account",
      };
    }

    // Revalidate the home page
    revalidatePath("/");
    return { success: true, user: authData.user };
  } catch (err) {
    console.error("Unexpected error:", err);
    return { error: "An unexpected error occurred during registration" };
  }
}

export async function loginUserAction(formData) {
  const { email, password } = Object.fromEntries(formData);
  try {
    const supabase = await createSupabaseServerClient();

    const { data: authData, error: authError } =
      await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

    if (authError) {
      console.error("Auth error:", authError);
      return { error: authError.message };
    }

    // Fetch user profile to determine redirect based on role
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", authData.user.id)
      .single();

    revalidatePath("/");
    return {
      success: true,
      user: authData.user,
      redirectTo: profile?.role === "admin" ? "/admin/dashboard" : "/",
    };
  } catch (err) {
    console.error("Unexpected error:", err);
    return { error: "An unexpected error occurred during login" };
  }
}
