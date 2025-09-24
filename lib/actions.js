"use server";

import { supabaseAdmin } from "@/utils/supabase/supabaseAdmin";
import { createSupabaseServerClient } from "@/utils/supabase/server";

import { revalidatePath } from "next/cache";
import {
  isValidCambodiaPhoneNumber,
  sanitizeCode,
  sanitizeName,
  generateUniqueImageName,
  sanitizeSlug,
} from "@/lib/utils";

import {
  cleanUpCreatedProduct,
  generateUniqueProductCode,
  generateSKU,
} from "@/lib/apiProducts";

import {
  cleanUpCreatedAdmin,
  createProfileForAdmin,
  getCurrentUser,
  getUserProfile,
  isPhoneNumberTaken,
} from "@/lib/apiUsers";
import { isCouponCodeTaken, isCouponCodeTakenByOther } from "./apiCoupons";
import {
  cleanUpCreatedCollection,
  clearCollectionProducts,
} from "./apiCollections";

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
    const { user, error: getCurrentUserError } = await getCurrentUser();
    if (getCurrentUserError) {
      console.error("Get current user error:", getCurrentUserError);
      return { error: getCurrentUserError };
    }

    // Generate unique product code first
    const productCode = await generateUniqueProductCode();

    let createdProductId = null;

    const imageName = generateUniqueImageName(formData.banner_file);
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

    if (formData.collection_id) {
      const { error: collectionProductsError } = await supabaseAdmin
        .from("collection_products")
        .insert({
          collection_id: formData.collection_id,
          product_id: product.id,
          display_order: 0,
        });

      if (collectionProductsError) {
        console.error("Collection products error:", collectionProductsError);
        return { error: collectionProductsError.message };
      }
    }

    // Upload image to storage
    const { error: storageError } = await supabaseAdmin.storage
      .from("clothes-images")
      .upload(imageName, formData.banner_file);

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

export async function createNewCouponAction(formData) {
  try {
    const cleanCode = sanitizeCode(formData.code);

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
        error: "Unauthorized - Please login as admin to create coupon",
      };
    }

    const { isTaken, error: couponCodeError } = await isCouponCodeTaken(
      cleanCode
    );

    if (couponCodeError) {
      console.error("Coupon code error:", couponCodeError);
      return { error: couponCodeError.message };
    }

    if (isTaken) {
      return {
        error: "Coupon code already exists. Please use a different code.",
      };
    }

    const { data: coupon, error: couponError } = await supabaseAdmin
      .from("promo_codes")
      .insert({
        code: cleanCode,
        discount_percentage: parseInt(formData.discount_percentage),
        description: formData.description,
        max_uses_per_customer: parseInt(formData.max_uses_per_customer),
        max_total_uses: parseInt(formData.max_total_uses),
        valid_from: formData.valid_from,
        valid_until: formData.valid_until,
        created_by: user.id,
      })
      .select()
      .single();

    if (couponError) {
      console.error("Coupon error:", couponError);
      return { error: couponError.message };
    }

    console.log("Coupon created successfully:", coupon);
    revalidatePath("/admin/coupons");
    return {
      success: true,
      message: "Coupon created successfully",
      coupon: coupon,
    };
  } catch (err) {
    console.error("Unexpected error:", err);
    return { error: "An unexpected error occurred during coupon creation" };
  }
}

export async function createNewCollectionAction(formData) {
  try {
    const cleanCollectionName = sanitizeName(formData.name);
    const cleanCollectionSlug = sanitizeSlug(cleanCollectionName);

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
        error: "Unauthorized - Please login as admin to create collection",
      };
    }

    let createdCollectionId = null;

    const imageName = generateUniqueImageName(formData.banner_file);
    const imagePath = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/collection-images/${imageName}`;

    const { data: collection, error: collectionError } = await supabaseAdmin
      .from("collections")
      .insert({
        name: cleanCollectionName,
        slug: cleanCollectionSlug,
        description: formData.description,
        banner_image_url: imagePath || null,
        is_active: formData.is_active ?? true,
      })
      .select()
      .single();

    if (collectionError) {
      console.error("Collection error:", collectionError);
      return { error: collectionError.message };
    }

    console.log("Collection:", collection);

    createdCollectionId = collection.id;
    console.log("Collection id:", createdCollectionId);

    if (formData.selected_product_ids?.length > 0) {
      const collectionProductsToInsert = formData.selected_product_ids.map(
        (productId) => ({
          collection_id: collection.id,
          product_id: productId,
          display_order: 0,
        })
      );

      const { error: collectionProductsError } = await supabaseAdmin
        .from("collection_products")
        .insert(collectionProductsToInsert);

      if (collectionProductsError) {
        console.error("Collection products error:", collectionProductsError);
        return { error: collectionProductsError.message };
      }
    }

    const { error: storageError } = await supabaseAdmin.storage
      .from("collection-images")
      .upload(imageName, formData.banner_file);

    if (storageError) {
      console.error("Storage error:", storageError);
      await cleanUpCreatedCollection(createdCollectionId);
      return { error: storageError.message };
    }

    revalidatePath("/admin/collections");
    return {
      success: true,
      message: "Collection created successfully",
      collection: collection,
    };
  } catch (err) {
    console.error("Unexpected error:", err);
    if (createdCollectionId) {
      await cleanUpCreatedCollection(createdCollectionId);
    }
    return { error: "An unexpected error occurred during collection creation" };
  }
}

export async function updateProductAction(formData) {
  try {
    // Get authenticated user
    const { error: getCurrentUserError } = await getCurrentUser();
    if (getCurrentUserError) {
      console.error("Get current user error:", getCurrentUserError);
      return { error: getCurrentUserError };
    }

    const productId = formData.id;

    // Handle image upload if new image provided
    let imagePath = formData.existing_banner_image_url; // Keep existing image by default

    if (formData.banner_file && formData.banner_file.size > 0) {
      const imageName = generateUniqueImageName(formData.banner_file);
      imagePath = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/clothes-images/${imageName}`;

      // Upload new image to storage
      const { error: storageError } = await supabaseAdmin.storage
        .from("clothes-images")
        .upload(imageName, formData.banner_file);

      if (storageError) {
        console.error("Storage error:", storageError);
        return { error: storageError.message };
      }
    }

    if (formData.collection_id) {
      const { error: collectionProductsError } = await supabaseAdmin
        .from("collection_products")
        .insert({
          collection_id: formData.collection_id,
          product_id: productId,
          display_order: 0,
        });

      if (collectionProductsError) {
        console.error("Collection products error:", collectionProductsError);
        return { error: collectionProductsError.message };
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

export async function updateCollectionAction(formData) {
  try {
    const cleanCollectionName = sanitizeName(formData.name);

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
        error: "Unauthorized - Please login as admin to update collection",
      };
    }

    const collectionId = formData.id;
    let imagePath = formData.existing_banner_image_url;

    // Handle image upload if new image provided
    if (formData.banner_file && formData.banner_file.size > 0) {
      const imageName = generateUniqueImageName(formData.banner_file);
      imagePath = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/collection-images/${imageName}`;

      const { error: storageError } = await supabaseAdmin.storage
        .from("collection-images")
        .upload(imageName, formData.banner_file);

      if (storageError) {
        console.error("Storage error:", storageError);
        return { error: storageError.message };
      }
    }

    // 1. Update collection metadata
    const { data: collection, error: collectionError } = await supabaseAdmin
      .from("collections")
      .update({
        name: cleanCollectionName,
        description: formData.description,
        banner_image_url: imagePath,
        is_active: formData.is_active ?? true,
        updated_at: new Date().toISOString(),
      })
      .eq("id", collectionId)
      .select()
      .single();

    if (collectionError) {
      console.error("Collection update error:", collectionError);
      return { error: collectionError.message };
    }

    // 2. Update collection products relationships
    if (formData.selected_product_ids !== undefined) {
      // Delete existing collection products
      const { error: clearCollectionProductsError } =
        await clearCollectionProducts(collectionId);

      if (clearCollectionProductsError) {
        console.error(
          "Clear collection products error:",
          clearCollectionProductsError
        );
        return { error: clearCollectionProductsError.message };
      }

      // Insert new collection products (if any selected)
      if (formData.selected_product_ids?.length > 0) {
        const collectionProductsToInsert = formData.selected_product_ids.map(
          (productId) => ({
            collection_id: collectionId,
            product_id: productId,
            display_order: 0,
          })
        );

        const { error: insertError } = await supabaseAdmin
          .from("collection_products")
          .insert(collectionProductsToInsert);

        if (insertError) {
          console.error("Insert collection products error:", insertError);
          return { error: insertError.message };
        }
      }
    }

    revalidatePath("/admin/collections");
    revalidatePath(`/admin/collections/${collectionId}`);
    revalidatePath(`/admin/collections/${collectionId}/edit`);

    return {
      success: true,
      message: "Collection updated successfully",
      collection: collection,
    };
  } catch (err) {
    console.error("Unexpected error:", err);
    return { error: "An unexpected error occurred during collection update" };
  }
}

export async function updateCurrentAdminProfileAction(formData) {
  try {
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

    if (profile?.role !== "admin") {
      console.error("User is not admin");
      return {
        error: "Unauthorized - Please login as admin to update profile",
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

    // 8. SUCCESS OPERATIONS
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

export async function deleteProductByIdAction(productId) {
  try {
    // Get authenticated user
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
        error: "Unauthorized - Please login as admin to delete product",
      };
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

export async function bulkDeleteProductsAction(productIds) {
  try {
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
        error: "Unauthorized - Please login as admin to bulk delete products",
      };
    }

    const { error: bulkDeleteError } = await supabaseAdmin
      .from("products")
      .delete()
      .in("id", productIds);

    if (bulkDeleteError) {
      console.error("Bulk delete error:", bulkDeleteError);
      return { error: "Failed to delete products" };
    }

    revalidatePath("/admin/products");
    return {
      success: true,
      message: `Successfully deleted ${productIds.length} product${
        productIds.length > 1 ? "s" : ""
      }`,
    };
  } catch (err) {
    console.error("Unexpected error:", err);
    return {
      error: "An unexpected error occurred during bulk deletion",
    };
  }
}

export async function bulkDeleteCouponsAction(couponIds) {
  try {
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
        error: "Unauthorized - Please login as admin to bulk delete coupons",
      };
    }

    const { error: bulkDeleteError } = await supabaseAdmin
      .from("promo_codes")
      .delete()
      .in("id", couponIds);

    if (bulkDeleteError) {
      console.error("Bulk delete coupons error:", bulkDeleteError);
      return { error: "Failed to delete coupons" };
    }

    revalidatePath("/admin/coupons");
    return {
      success: true,
      message: `Successfully deleted ${couponIds.length} coupon(s)`,
    };
  } catch (err) {
    console.error("Unexpected error:", err);
    return {
      error: "An unexpected error occurred during bulk coupon deletion",
    };
  }
}

export async function bulkDeleteCollectionsAction(collectionIds) {
  try {
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
        error:
          "Unauthorized - Please login as admin to bulk delete collections",
      };
    }

    const { error: bulkDeleteError } = await supabaseAdmin
      .from("collections")
      .delete()
      .in("id", collectionIds);

    if (bulkDeleteError) {
      console.error("Bulk delete collections error:", bulkDeleteError);
      return { error: "Failed to delete collections" };
    }

    revalidatePath("/admin/collections");
    return {
      success: true,
      message: `Successfully deleted ${collectionIds.length} collection(s)`,
    };
  } catch (err) {
    console.error("Unexpected error:", err);
    return {
      error: "An unexpected error occurred during bulk collection deletion",
    };
  }
}

export async function updateCouponAction(formData) {
  try {
    const cleanCode = sanitizeCode(formData.code);

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
        error: "Unauthorized - Please login as admin to update coupon",
      };
    }

    // Check if coupon code is taken by another coupon (excluding current one)
    const { isTaken, error: couponCodeError } = await isCouponCodeTakenByOther(
      cleanCode,
      formData.id
    );

    if (couponCodeError) {
      console.error("Coupon code error:", couponCodeError);
      return { error: couponCodeError.message };
    }

    if (isTaken) {
      return {
        error: "Coupon code already exists. Please use a different code.",
      };
    }

    const { data: coupon, error: couponError } = await supabaseAdmin
      .from("promo_codes")
      .update({
        code: cleanCode,
        discount_percentage: parseInt(formData.discount_percentage),
        description: formData.description,
        max_uses_per_customer: parseInt(formData.max_uses_per_customer),
        max_total_uses: parseInt(formData.max_total_uses),
        valid_from: formData.valid_from,
        valid_until: formData.valid_until,
        updated_at: new Date().toISOString(),
      })
      .eq("id", formData.id)
      .select()
      .single();

    if (couponError) {
      console.error("Coupon update error:", couponError);
      return { error: couponError.message };
    }

    console.log("Coupon updated successfully:", coupon);
    revalidatePath("/admin/coupons");
    revalidatePath(`/admin/coupons/${formData.id}`);
    revalidatePath(`/admin/coupons/${formData.id}/edit`);

    return {
      success: true,
      message: "Coupon updated successfully",
      coupon: coupon,
    };
  } catch (err) {
    console.error("Unexpected error:", err);
    return { error: "An unexpected error occurred during coupon update" };
  }
}

export async function deleteCouponByIdAction(couponId) {
  try {
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
      return { error: "Unauthorized - Please login as admin to delete coupon" };
    }

    const { error: deleteCouponError } = await supabaseAdmin
      .from("promo_codes")
      .delete()
      .eq("id", couponId);

    if (deleteCouponError) {
      console.error("Delete coupon error:", deleteCouponError);
      return { error: "Failed to delete coupon" };
    }

    revalidatePath("/admin/coupons");
    return { success: true, message: "Coupon deleted successfully" };
  } catch (err) {
    console.error("Unexpected error:", err);
    return { error: "An unexpected error occurred during coupon deletion" };
  }
}

export async function deleteCollectionByIdAction(collectionId) {
  try {
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
        error: "Unauthorized - Please login as admin to delete collection",
      };
    }

    const { error: deleteCollectionError } = await supabaseAdmin
      .from("collections")
      .delete()
      .eq("id", collectionId);

    if (deleteCollectionError) {
      console.error("Delete collection error:", deleteCollectionError);
      return { error: "Failed to delete collection" };
    }

    revalidatePath("/admin/collections");
    return { success: true, message: "Collection deleted successfully" };
  } catch (err) {
    console.error("Unexpected error:", err);
    return { error: "An unexpected error occurred during collection deletion" };
  }
}
