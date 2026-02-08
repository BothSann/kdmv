import { supabaseAdmin } from "@/utils/supabase/supabaseAdmin";
import { PER_PAGE } from "@/lib/constants";

export async function getAllCoupons({ page = 1, perPage = PER_PAGE } = {}) {
  try {
    const from = (page - 1) * perPage;
    const to = from + perPage - 1;

    const {
      data: coupons,
      error: couponError,
      count,
    } = await supabaseAdmin
      .from("promo_codes")
      .select("*", { count: "exact" })
      .range(from, to)
      .order("created_at", { ascending: false });

    if (couponError) {
      console.error("Coupons fetch error:", couponError);
      return { error: "Failed to fetch coupons" };
    }

    const enrichedCoupons = coupons.map(enrichCoupon);

    return {
      success: true,
      coupons: enrichedCoupons,
      pagination: {
        page,
        perPage,
        count,
        totalPages: Math.ceil(count / perPage),
        hasNextPage: page * perPage < count,
        hasPreviousPage: page > 1,
      },
    };
  } catch (err) {
    console.error("Unexpected error in getAllCoupons:", err);
    return { error: "An unexpected error occurred while fetching coupons" };
  }
}

// ✅ NEW: Optional function for admin to view deleted coupons
export async function getAllCouponsWithDeleted({
  page = 1,
  perPage = PER_PAGE,
  includeDeleted = false,
} = {}) {
  try {
    const from = (page - 1) * perPage;
    const to = from + perPage - 1;

    const query = supabaseAdmin
      .from("promo_codes")
      .select("*", { count: "exact" });

    // ✅ Optionally filter deleted coupons
    if (!includeDeleted) {
      query.is("deleted_at", null);
    }

    const {
      data: coupons,
      error: couponError,
      count,
    } = await query.range(from, to).order("created_at", { ascending: false });

    if (couponError) {
      console.error("Coupons fetch error:", couponError);
      return { error: "Failed to fetch coupons" };
    }

    const enrichedCoupons = coupons.map(enrichCoupon);

    return {
      success: true,
      coupons: enrichedCoupons,
      pagination: {
        page,
        perPage,
        count,
        totalPages: Math.ceil(count / perPage),
        hasNextPage: page * perPage < count,
        hasPreviousPage: page > 1,
      },
    };
  } catch (err) {
    console.error("Unexpected error in getAllCouponsWithDeleted:", err);
    return { error: "An unexpected error occurred while fetching coupons" };
  }
}

export async function getCouponById(couponId) {
  try {
    const { data: coupon, error: couponError } = await supabaseAdmin
      .from("promo_codes")
      .select("*")
      .eq("id", couponId)
      .maybeSingle();

    if (couponError) {
      console.error("Coupon fetch error:", couponError);
      return { error: "Failed to fetch coupon" };
    }

    if (!coupon) {
      return { error: "Coupon not found" };
    }

    const enrichedCoupon = enrichCoupon(coupon);

    return {
      success: true,
      coupon: enrichedCoupon,
    };
  } catch (err) {
    console.error("Unexpected error in getCouponById:", err);
    return { error: "An unexpected error occurred while fetching coupon" };
  }
}

export async function isCouponCodeTaken(code) {
  try {
    const { data: existingCoupon, error: couponError } = await supabaseAdmin
      .from("promo_codes")
      .select("id")
      .eq("code", code)
      .is("deleted_at", null) // Allow reusing codes after deletion
      .maybeSingle();

    console.log("code", code);

    if (couponError) {
      console.error("Coupon fetch error:", couponError);
      return { error: "Failed to fetch coupon" };
    }

    const isTaken = Boolean(existingCoupon);
    console.log("isTaken", isTaken);

    return { isTaken };
  } catch (err) {
    console.error("Unexpected error in isCouponCodeTaken:", err);
    return {
      error:
        "An unexpected error occurred while checking coupon code availability",
    };
  }
}

export async function isCouponCodeTakenByOther(code, excludeCouponId) {
  try {
    const { data: existingCoupon, error: couponError } = await supabaseAdmin
      .from("promo_codes")
      .select("id")
      .eq("code", code)
      .neq("id", excludeCouponId)
      .is("deleted_at", null) // Ignore deleted coupons
      .maybeSingle();

    if (couponError) {
      console.error("Coupon fetch error:", couponError);
      return { error: "Failed to fetch coupon" };
    }

    const isTaken = Boolean(existingCoupon);

    return { isTaken };
  } catch (err) {
    console.error("Unexpected error in isCouponCodeTakenByOther:", err);
    return {
      error:
        "An unexpected error occurred while checking coupon code availability",
    };
  }
}

function enrichCoupon(coupon) {
  // Calculate business logic statuses
  const now = new Date();
  const validFrom = new Date(coupon.valid_from);
  const validUntil = coupon.valid_until ? new Date(coupon.valid_until) : null;

  return {
    ...coupon,
    // Status calculations
    isExpired: validUntil ? now > validUntil : false,
    isNotYetValid: now < validFrom,
    isReachedUsageLimit: coupon.max_total_uses
      ? coupon.total_uses >= coupon.max_total_uses
      : false,
    isDeleted: Boolean(coupon.deleted_at), // NEW: Track deleted status

    // Additional useful calculations
    remainingUses: coupon.max_total_uses
      ? Math.max(0, coupon.max_total_uses - coupon.total_uses)
      : null,
    usagePercentage: coupon.max_total_uses
      ? Math.round((coupon.total_uses / coupon.max_total_uses) * 100)
      : null,
    daysLeft: validUntil
      ? Math.max(
          0,
          Math.ceil(
            (validUntil.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
          )
        )
      : null,
  };
}

// /**
//  * Validates if a coupon can be used by a specific customer
//  * This function performs all necessary checks before allowing coupon usage
//  */
export async function validateCoupon(couponCode, customerId) {
  try {
    // 1. Get coupon details
    const { data: coupon, error: couponError } = await supabaseAdmin
      .from("promo_codes")
      .select("*")
      .eq("code", couponCode)
      .is("deleted_at", null) // Deleted coupons cannot be used
      .single();

    if (couponError || !coupon) {
      return {
        valid: false,
        error: "Invalid coupon code. Please check the code and try again.",
      };
    }

    // 2. Check if coupon is active
    if (!coupon.is_active) {
      return {
        valid: false,
        error:
          "This coupon is no longer active. It may have expired or reached its usage limit.",
      };
    }

    // 3. Check date validity
    const now = new Date();
    const validFrom = new Date(coupon.valid_from);
    const validUntil = coupon.valid_until ? new Date(coupon.valid_until) : null;

    if (now < validFrom) {
      return {
        valid: false,
        error: "This coupon is not yet valid and cannot be applied",
      };
    }

    if (validUntil && now > validUntil) {
      return {
        valid: false,
        error: "This coupon has expired and cannot be applied.",
      };
    }

    // 4. Check total usage limits
    if (coupon.max_total_uses && coupon.total_uses >= coupon.max_total_uses) {
      // Note: Deactivation is handled by the server action when applying coupon
      // This keeps validateCoupon as a pure query function
      return {
        valid: false,
        error: "This coupon has reached its usage limit",
        shouldDeactivate: true, // Signal to the caller that the coupon should be deactivated
        couponId: coupon.id,
      };
    }

    // 5. Check customer-specific usage limits
    const { data: customerUsage, error: usageError } = await supabaseAdmin
      .from("promo_code_usage")
      .select("id")
      .eq("promo_code_id", coupon.id)
      .eq("customer_id", customerId);

    if (usageError) {
      console.error("Error checking customer usage:", usageError);
      return {
        valid: false,
        error: "Unable to validate coupon usage",
      };
    }

    const customerUsageCount = customerUsage?.length || 0;
    if (customerUsageCount >= coupon.max_uses_per_customer) {
      return {
        valid: false,
        error: "You have already used this coupon the maximum number of times",
      };
    }

    return {
      valid: true,
      coupon,
      remainingUses: coupon.max_total_uses
        ? coupon.max_total_uses - coupon.total_uses
        : null,
      customerRemainingUses: coupon.max_uses_per_customer - customerUsageCount,
    };
  } catch (err) {
    console.error("Unexpected error in validateCoupon:", err);
    return {
      valid: false,
      error: "An unexpected error occurred while validating coupon",
    };
  }
}
