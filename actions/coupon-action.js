"use server";

import { supabaseAdmin } from "@/utils/supabase/supabaseAdmin";

import { revalidatePath } from "next/cache";
import { sanitizeCode } from "@/lib/utils";

import { getCurrentUser, getUserProfile, getUserRole } from "@/lib/api/users";
import {
  isCouponCodeTaken,
  isCouponCodeTakenByOther,
  validateCoupon,
} from "@/lib/api/coupons";

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

    // SOFT DELETE: Mark coupon as deleted instead of hard delete
    const { error: softDeleteError } = await supabaseAdmin
      .from("promo_codes")
      .update({
        deleted_at: new Date().toISOString(), // Mark as deleted
        is_active: false, // Also deactivate
        updated_at: new Date().toISOString(),
      })
      .eq("id", couponId);

    if (softDeleteError) {
      console.error("Soft delete coupon error:", softDeleteError);
      return { error: "Failed to delete coupon" };
    }

    revalidatePath("/admin/coupons");

    return { success: true, message: "Coupon deleted successfully" };
  } catch (err) {
    console.error("Unexpected error:", err);
    return { error: "An unexpected error occurred during coupon deletion" };
  }
}

export async function restoreCouponAction(couponId) {
  try {
    const { user, error: getCurrentUserError } = await getCurrentUser();
    if (getCurrentUserError) {
      return { error: getCurrentUserError };
    }

    const { role } = await getUserRole(user?.id);
    if (role !== "admin") {
      return {
        error: "Unauthorized - Please login as admin to restore coupon",
      };
    }

    //  Restore coupon
    const { error: restoreError } = await supabaseAdmin
      .from("promo_codes")
      .update({
        deleted_at: null, // Unmark as deleted
        is_active: true, // Reactivate
        updated_at: new Date().toISOString(),
      })
      .eq("id", couponId);

    if (restoreError) {
      console.error("Restore coupon error:", restoreError);
      return { error: "Failed to restore coupon" };
    }

    revalidatePath("/admin/coupons");
    return { success: true, message: "Coupon restored successfully" };
  } catch (err) {
    console.error("Unexpected error:", err);
    return { error: "An unexpected error occurred" };
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

    // SOFT DELETE: Mark all coupons as deleted
    const { error: bulkSoftDeleteError } = await supabaseAdmin
      .from("promo_codes")
      .update({
        deleted_at: new Date().toISOString(),
        is_active: false,
        updated_at: new Date().toISOString(),
      })
      .in("id", couponIds);

    if (bulkSoftDeleteError) {
      console.error("Bulk soft delete coupons error:", bulkSoftDeleteError);
      return { error: "Failed to delete coupons" };
    }

    revalidatePath("/admin/coupons");

    return {
      success: true,
      message: `Successfully deleted ${couponIds.length} coupon${
        couponIds.length > 1 ? "s" : ""
      }`,
    };
  } catch (err) {
    console.error("Unexpected error:", err);
    return {
      error: "An unexpected error occurred during bulk coupon deletion",
    };
  }
}

export async function applyCouponAction(couponCode, customerId) {
  try {
    const result = await validateCoupon(couponCode, customerId);

    if (!result.valid || result.error) {
      console.error("Coupon usage error:", result.error);
      return { valid: false, error: result.error };
    }

    return {
      valid: true,
      coupon: result.coupon,
      remainingUses: result.remainingUses,
      customerRemainingUses: result.customerRemainingUses,
    };
  } catch (err) {
    console.error("Unexpected error:", err);
    return {
      valid: false,
      error: "An unexpected error occurred during coupon usage",
    };
  }
}
