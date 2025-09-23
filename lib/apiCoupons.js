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

// // Helper function to determine overall coupon status
// function getOverallStatus(coupon, now, validFrom, validUntil) {
//   if (!coupon.is_active) return "inactive";
//   if (validUntil && now > validUntil) return "expired";
//   if (coupon.max_total_uses && coupon.total_uses >= coupon.max_total_uses)
//     return "used_up";
//   if (now < validFrom) return "not_yet_valid";
//   return "active";
// }

// /**
//  * Validates if a coupon can be used by a specific customer
//  * This function performs all necessary checks before allowing coupon usage
//  */
// export async function validateCoupon(couponCode, customerId) {
//   try {
//     // 1. Get coupon details
//     const { data: coupon, error: couponError } = await supabaseAdmin
//       .from("promo_codes")
//       .select("*")
//       .eq("code", couponCode)
//       .single();

//     if (couponError || !coupon) {
//       return {
//         valid: false,
//         error: "Coupon not found",
//       };
//     }

//     // 2. Check if coupon is active
//     if (!coupon.is_active) {
//       return {
//         valid: false,
//         error: "This coupon is no longer active",
//       };
//     }

//     // 3. Check date validity
//     const now = new Date();
//     const validFrom = new Date(coupon.valid_from);
//     const validUntil = coupon.valid_until ? new Date(coupon.valid_until) : null;

//     if (now < validFrom) {
//       return {
//         valid: false,
//         error: "This coupon is not yet valid",
//       };
//     }

//     if (validUntil && now > validUntil) {
//       return {
//         valid: false,
//         error: "This coupon has expired",
//       };
//     }

//     // 4. Check total usage limits
//     if (coupon.max_total_uses && coupon.total_uses >= coupon.max_total_uses) {
//       // Auto-deactivate the coupon if it has reached its limit
//       await supabaseAdmin
//         .from("promo_codes")
//         .update({ is_active: false })
//         .eq("id", coupon.id);

//       return {
//         valid: false,
//         error: "This coupon has reached its usage limit",
//       };
//     }

//     // 5. Check customer-specific usage limits
//     const { data: customerUsage, error: usageError } = await supabaseAdmin
//       .from("promo_code_usage")
//       .select("id")
//       .eq("promo_code_id", coupon.id)
//       .eq("customer_id", customerId);

//     if (usageError) {
//       console.error("Error checking customer usage:", usageError);
//       return {
//         valid: false,
//         error: "Unable to validate coupon usage",
//       };
//     }

//     const customerUsageCount = customerUsage?.length || 0;
//     if (customerUsageCount >= coupon.max_uses_per_customer) {
//       return {
//         valid: false,
//         error: "You have already used this coupon the maximum number of times",
//       };
//     }

//     return {
//       valid: true,
//       coupon,
//       remainingUses: coupon.max_total_uses
//         ? coupon.max_total_uses - coupon.total_uses
//         : null,
//       customerRemainingUses: coupon.max_uses_per_customer - customerUsageCount,
//     };
//   } catch (err) {
//     console.error("Unexpected error in validateCoupon:", err);
//     return {
//       valid: false,
//       error: "An unexpected error occurred while validating coupon",
//     };
//   }
// }

// /**
//  * Records coupon usage and updates counters
//  * This should be called within a transaction when processing an order
//  */
// export async function useCoupon(couponId, customerId, orderId = null) {
//   try {
//     // Use a transaction to ensure data consistency
//     const { data: result, error } = await supabaseAdmin.rpc(
//       "use_coupon_transaction",
//       {
//         p_coupon_id: couponId,
//         p_customer_id: customerId,
//         p_order_id: orderId,
//       }
//     );

//     if (error) {
//       console.error("Error using coupon:", error);
//       return {
//         success: false,
//         error: "Failed to apply coupon",
//       };
//     }

//     return {
//       success: true,
//       message: "Coupon applied successfully",
//     };
//   } catch (err) {
//     console.error("Unexpected error in useCoupon:", err);
//     return {
//       success: false,
//       error: "An unexpected error occurred while applying coupon",
//     };
//   }
// }

// /**
//  * Gets coupon usage statistics
//  */
// export async function getCouponUsageStats(couponId) {
//   try {
//     const { data: coupon, error: couponError } = await supabaseAdmin
//       .from("promo_codes")
//       .select(
//         `
//         *,
//         promo_code_usage (
//           id,
//           customer_id,
//           order_id,
//           used_at,
//           profiles (
//             first_name,
//             last_name,
//             email
//           )
//         )
//       `
//       )
//       .eq("id", couponId)
//       .single();

//     if (couponError) {
//       return { error: "Failed to fetch coupon usage stats" };
//     }

//     const usageByCustomer = {};
//     coupon.promo_code_usage.forEach((usage) => {
//       const customerId = usage.customer_id;
//       if (!usageByCustomer[customerId]) {
//         usageByCustomer[customerId] = {
//           customer: usage.profiles,
//           usageCount: 0,
//           lastUsed: null,
//         };
//       }
//       usageByCustomer[customerId].usageCount++;
//       if (
//         !usageByCustomer[customerId].lastUsed ||
//         usage.used_at > usageByCustomer[customerId].lastUsed
//       ) {
//         usageByCustomer[customerId].lastUsed = usage.used_at;
//       }
//     });

//     return {
//       success: true,
//       coupon: {
//         ...coupon,
//         usageByCustomer: Object.values(usageByCustomer),
//         totalUniqueCustomers: Object.keys(usageByCustomer).length,
//         usagePercentage: coupon.max_total_uses
//           ? Math.round((coupon.total_uses / coupon.max_total_uses) * 100)
//           : null,
//       },
//     };
//   } catch (err) {
//     console.error("Unexpected error in getCouponUsageStats:", err);
//     return { error: "An unexpected error occurred while fetching usage stats" };
//   }
// }

// /**
//  * Manually reactivate a coupon (admin function)
//  * This allows admins to override automatic deactivation if needed
//  */
// export async function reactivateCoupon(couponId, newMaxUses = null) {
//   try {
//     const updateData = { is_active: true };

//     // Optionally increase the max_total_uses limit
//     if (newMaxUses !== null) {
//       updateData.max_total_uses = newMaxUses;
//     }

//     const { data: coupon, error } = await supabaseAdmin
//       .from("promo_codes")
//       .update(updateData)
//       .eq("id", couponId)
//       .select()
//       .single();

//     if (error) {
//       return { error: "Failed to reactivate coupon" };
//     }

//     return {
//       success: true,
//       coupon,
//       message: "Coupon reactivated successfully",
//     };
//   } catch (err) {
//     console.error("Unexpected error in reactivateCoupon:", err);
//     return { error: "An unexpected error occurred while reactivating coupon" };
//   }
// }
