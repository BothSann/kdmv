import { z } from "zod";

/**
 * Zod validation schema for Coupon form
 * Used in CouponCreateEditForm.js with React Hook Form
 */

export const couponSchema = z
  .object({
    // Coupon code - Required, unique identifier
    code: z
      .string({ required_error: "Coupon code is required" })
      .trim()
      .min(3, "Coupon code must be at least 3 characters")
      .max(50, "Coupon code must not exceed 50 characters")
      .transform((val) => val.toUpperCase()) // Auto-convert to uppercase
      .pipe(
        z
          .string()
          .regex(
            /^[A-Z0-9_-]+$/,
            "Coupon code can only contain letters, numbers, hyphens, and underscores"
          )
      ),

    // Discount percentage - Required, 0.01-100
    discount_percentage: z
      .string({ required_error: "Discount percentage is required" })
      .refine((val) => !isNaN(parseFloat(val)), {
        message: "Discount percentage must be a valid number",
      })
      .refine((val) => parseFloat(val) > 0, {
        message: "Discount percentage must be greater than 0",
      })
      .refine((val) => parseFloat(val) <= 100, {
        message: "Discount percentage cannot exceed 100",
      })
      .transform((val) => parseFloat(val)),

    // Description - Optional
    description: z
      .string()
      .trim()
      .max(255, "Description must not exceed 255 characters")
      .optional()
      .or(z.literal("")), // Allow empty string

    // Max uses per customer - Required, minimum 1
    max_uses_per_customer: z
      .string({ required_error: "Max uses per customer is required" })
      .refine((val) => !isNaN(parseInt(val)), {
        message: "Max uses per customer must be a valid number",
      })
      .refine((val) => parseInt(val) >= 1, {
        message: "Max uses per customer must be at least 1",
      })
      .transform((val) => parseInt(val)),

    // Max total uses - Optional (null means unlimited)
    max_total_uses: z
      .string()
      .refine(
        (val) => val === "" || (!isNaN(parseInt(val)) && parseInt(val) >= 1),
        {
          message: "Max total uses must be at least 1 or empty for unlimited",
        }
      )
      .transform((val) => (val === "" ? null : parseInt(val)))
      .nullable()
      .optional(),

    // Valid from date - Required, must be a date object
    valid_from: z
      .date({ required_error: "Valid from date is required" })
      .refine((date) => date instanceof Date && !isNaN(date.getTime()), {
        message: "Valid from must be a valid date",
      }),

    // Valid until date - Required, must be a date object
    valid_until: z
      .date({ required_error: "Valid until date is required" })
      .refine((date) => date instanceof Date && !isNaN(date.getTime()), {
        message: "Valid until must be a valid date",
      }),
  })
  .refine((data) => data.valid_until > data.valid_from, {
    message: "Valid until must be after valid from",
    path: ["valid_until"], // Error appears on valid_until field
  });
