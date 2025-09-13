"use server";

import { supabaseAdmin } from "@/utils/supabase/supabaseAdmin";
import { createSupabaseServerClient } from "@/utils/supabase/server";
import { createProfileForAdmin } from "./apiAuth";
import { revalidatePath } from "next/cache";
import { sanitizeName } from "./utils";

export async function registerUserAction(formData) {
  try {
    // 2. Validate phone number format
    const cambodiaPhoneNumberRegex =
      /^(?:\+855|0)(?:(?:[1-9]\d|2[3-7]|3[1-6]|4[2-4]|5[1-5]|6[0-9]|7[0-9]|8[0-9]|9[0-9])\d{6,7}|(?:[1-9]\d{7,8}))$/;

    if (!cambodiaPhoneNumberRegex.test(formData.telephone)) {
      return { error: "Invalid telephone number" };
    }

    // 3. Check if telephone is already used by confirmed users
    const { data: existingProfiles, error: checkError } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .eq("telephone", formData.telephone)
      .maybeSingle();

    if (checkError) {
      console.error("Check error:", checkError);
      return { error: "Failed to validate telephone number" };
    }

    if (existingProfiles) {
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
          emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/confirm`,
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

    // Fetch user profile to determine redirect based on role
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", authData.user.id)
      .single();

    revalidatePath("/");
    revalidatePath("/admin/dashboard");
    return {
      success: true,
      message: "Logged in successfully!",
      user: authData.user,
      redirectTo: profile?.role === "admin" ? "/admin/dashboard" : "/",
    };
  } catch (err) {
    console.error("Unexpected error:", err);
    return { error: "An unexpected error occurred during login" };
  }
}

export async function createNewProductAction(formData) {
  try {
    // Get authenticated user
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      console.error("No user found");
      return { error: "Unauthorized - Please login to create products" };
    }

    // Generate unique product code first
    const productCode = await generateUniqueProductCode();

    let createdProductId = null;

    const imageName = `${Math.random()}-${formData.banner_image_url?.name}`
      .replaceAll("/", "-")
      .replaceAll(" ", "-")
      .replaceAll("--", "-");
    const imagePath = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/clothes-images/${imageName}`;

    // 1. Insert product
    const { data: product, error: productError } = await supabaseAdmin
      .from("products")
      .insert({
        name: formData.name,
        description: formData.description,
        product_code: productCode,
        base_price: parseFloat(formData.base_price),
        discount_percentage: parseInt(formData.discount_percentage) || 0,
        subcategory_id: formData.subcategory_id,
        banner_image_url: imagePath || null,
        is_active: formData.is_active ?? true,
        created_by: user.id,
      })
      .select()
      .single();

    if (productError) {
      console.error("Product error:", productError);
      return { error: productError.message };
    }

    createdProductId = product.id;

    // Upload image to storage
    const { error: storageError } = await supabaseAdmin.storage
      .from("clothes-images")
      .upload(imageName, formData.banner_image_url);

    if (storageError) {
      console.error("Storage error:", storageError);
      await cleanUpCreatedProduct(createdProductId);
      return { error: storageError.message };
    }

    // 2. Insert product variants
    const variantsToInsert = await Promise.all(
      formData.variants.map(async (variant) => ({
        product_id: product.id,
        color_id: variant.color_id,
        size_id: variant.size_id,
        quantity: parseInt(variant.quantity),
        sku:
          variant.sku ||
          (await generateSKU(productCode, variant.color_id, variant.size_id)),
      }))
    );

    const { error: variantsError } = await supabaseAdmin
      .from("product_variants")
      .insert(variantsToInsert);

    if (variantsError) {
      console.error("Variants error:", variantsError);
      await cleanUpCreatedProduct(createdProductId);
      return { error: variantsError.message };
    }

    revalidatePath("/admin/products");
    return {
      success: true,
      message: "Product created successfully",
      product: product,
    };
  } catch (err) {
    console.error("Unexpected error:", err);
    if (createdProductId) {
      await cleanUpCreatedProduct(createdProductId);
    }
    return { error: "An unexpected error occurred during product creation" };
  }
}

export async function updateProductAction(formData) {
  try {
    // Get authenticated user
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      console.error("No user found");
      return { error: "Unauthorized - Please login to update products" };
    }

    const productId = formData.id;

    // Handle image upload if new image provided
    let imagePath = formData.existing_banner_image_url; // Keep existing image by default

    if (formData.banner_image_url && formData.banner_image_url.size > 0) {
      const imageName = `${Math.random()}-${formData.banner_image_url?.name}`
        .replaceAll("/", "-")
        .replaceAll(" ", "-")
        .replaceAll("--", "-");
      imagePath = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/clothes-images/${imageName}`;

      // Upload new image to storage
      const { error: storageError } = await supabaseAdmin.storage
        .from("clothes-images")
        .upload(imageName, formData.banner_image_url);

      if (storageError) {
        console.error("Storage error:", storageError);
        return { error: storageError.message };
      }
    }

    // 1. Update product
    const { data: product, error: productError } = await supabaseAdmin
      .from("products")
      .update({
        name: formData.name,
        description: formData.description,
        base_price: parseFloat(formData.base_price),
        discount_percentage: parseInt(formData.discount_percentage) || 0,
        subcategory_id: formData.subcategory_id,
        banner_image_url: imagePath,
        is_active: formData.is_active ?? true,
        updated_at: new Date().toISOString(),
      })
      .eq("id", productId)
      .select()
      .single();

    if (productError) {
      console.error("Product update error:", productError);
      return { error: productError.message };
    }

    // 2. Delete existing variants and insert new ones
    const { error: deleteVariantsError } = await supabaseAdmin
      .from("product_variants")
      .delete()
      .eq("product_id", productId);

    if (deleteVariantsError) {
      console.error("Delete variants error:", deleteVariantsError);
      return { error: deleteVariantsError.message };
    }

    // 3. Insert updated variants
    const variantsToInsert = await Promise.all(
      formData.variants.map(async (variant) => ({
        product_id: productId,
        color_id: variant.color_id,
        size_id: variant.size_id,
        quantity: parseInt(variant.quantity),
        sku:
          variant.sku ||
          (await generateSKU(
            product.product_code,
            variant.color_id,
            variant.size_id
          )),
      }))
    );

    const { error: variantsError } = await supabaseAdmin
      .from("product_variants")
      .insert(variantsToInsert);

    if (variantsError) {
      console.error("Variants insert error:", variantsError);
      return { error: variantsError.message };
    }

    revalidatePath("/admin/products");
    revalidatePath(`/admin/products/${productId}`);
    revalidatePath(`/admin/products/${productId}/edit`);

    return {
      success: true,
      message: "Product updated successfully",
      product: product,
    };
  } catch (err) {
    console.error("Unexpected error:", err);
    return { error: "An unexpected error occurred during product update" };
  }
}

export async function updateCurrentAdminProfileAction(formData) {
  try {
    const cleanFirstName = sanitizeName(formData.first_name);
    const cleanLastName = sanitizeName(formData.last_name);

    // 1. Get authenticated user
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      console.error("No user found");
      return { error: "Unauthorized - Please login to update admin profile" };
    }

    // 2. Validate user is admin
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role, avatar_url")
      .eq("id", user.id)
      .single();

    if (profileError) {
      console.error("Profile error:", profileError);
      return { error: profileError.message };
    }

    if (profile?.role !== "admin") {
      console.error("User is not admin");
      return {
        error: "Unauthorized - Please login as admin to update profile",
      };
    }

    console.log("Profile:", profile);

    // 3. Handle image upload if new image provided
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

    // 4. Update admin profile
    const { data: updatedProfile, error: updateProfileError } =
      await supabaseAdmin
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

    revalidatePath("/admin/account/profile");

    return {
      success: true,
      message: "Admin profile updated successfully",
      updatedProfile,
    };
  } catch (err) {
    console.error("Unexpected error:", err);
    return {
      error: "An unexpected error occurred during admin profile update",
    };
  }
}

export async function deleteProductByIdAction(productId) {
  try {
    // Get authenticated user
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      console.error("No user found");
      return { error: "Unauthorized - Please login to delete products" };
    }

    const { error: deleteProductError } = await supabaseAdmin
      .from("products")
      .delete()
      .eq("id", productId);

    if (deleteProductError) {
      console.error("Delete product error:", deleteProductError);
      return { error: "Failed to delete product" };
    }

    revalidatePath("/admin/products");
    return { success: true, message: "Product deleted successfully" };
  } catch (err) {
    console.error("Unexpected error:", err);
    return { error: "An unexpected error occurred during product deletion" };
  }
}

async function generateUniqueProductCode() {
  try {
    const maxAttempts = 5;
    let attempts = 0;

    while (attempts < maxAttempts) {
      const code = Math.floor(Math.random() * 10000000000)
        .toString()
        .padStart(11, "0");

      // Check if code exists in database
      const { data: existingProduct } = await supabaseAdmin
        .from("products")
        .select("id")
        .eq("product_code", code)
        .maybeSingle();

      if (!existingProduct) {
        return code; // Code is unique
      }

      attempts++;
    }
  } catch (err) {
    console.error("Error generating unique product code:", err);
    return `${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  }
}

async function generateSKU(productCode, colorId, sizeId) {
  try {
    const [colorResult, sizeResult] = await Promise.all([
      supabaseAdmin
        .from("colors")
        .select("slug, name")
        .eq("id", colorId)
        .single(),
      supabaseAdmin
        .from("sizes")
        .select("slug, name")
        .eq("id", sizeId)
        .single(),
    ]);

    console.log("Color result:", colorResult);
    console.log("Size result:", sizeResult);

    const colorCode =
      (
        colorResult.data?.slug || colorResult.data?.name?.substring(0, 3)
      )?.toUpperCase() || "UNK";

    const sizeCode =
      (sizeResult.data?.slug || sizeResult.data?.name)?.toUpperCase() || "UNK";

    return `${productCode}-${colorCode}-${sizeCode}`;
  } catch (err) {
    console.error("Error generating SKU:", err);
    return `${productCode}-${colorId.slice(-8)}-${sizeId.slice(-8)}`;
  }
}

async function cleanUpCreatedProduct(productId) {
  try {
    const { error: deleteError } = await supabaseAdmin
      .from("products")
      .delete()
      .eq("id", productId);

    if (deleteError) {
      console.error("Delete error:", deleteError);
      return { error: deleteError.message };
    }

    return { success: true, message: "Product cleaned up successfully" };
  } catch (err) {
    console.error("Unexpected error:", err);
    return { error: "An unexpected error occurred during product cleanup" };
  }
}

async function cleanUpCreatedAdmin(adminId) {
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
