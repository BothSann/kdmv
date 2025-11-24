import { z } from "zod";

/**
 * Product Validation Schemas
 * Used for creating and editing products in the admin panel
 */

// ============================================================================
// BASE PRODUCT SCHEMA
// ============================================================================

export const productSchema = z.object({
  // Product Details Section
  name: z
    .string({ required_error: "Product name is required" })
    .trim()
    .min(3, "Product name must be at least 3 characters")
    .max(200, "Product name must not exceed 200 characters"),

  description: z
    .string()
    .trim()
    .min(10, "Description must be at least 10 characters")
    .max(2000, "Description must not exceed 2000 characters")
    .optional()
    .or(z.literal("")), // Allow empty string

  // Pricing Section
  base_price: z
    .string({ required_error: "Base price is required" })
    .min(1, "Base price is required")
    .refine(
      (val) => {
        const num = parseFloat(val);
        return !isNaN(num) && num > 0;
      },
      { message: "Base price must be a positive number" }
    )
    .transform((val) => parseFloat(val)), // Convert string to number

  discount_percentage: z
    .string()
    .optional()
    .refine(
      (val) => {
        // Allow empty string
        if (!val || val === "") return true;
        const num = parseFloat(val);
        return !isNaN(num) && num >= 0 && num <= 100;
      },
      { message: "Discount must be between 0 and 100" }
    )
    .transform((val) => {
      // Convert empty string to 0, otherwise parse to number
      if (!val || val === "") return 0;
      return parseFloat(val);
    }),

  // Category Section
  subcategory_id: z
    .string({ required_error: "Subcategory is required" })
    .uuid("Please select a valid subcategory"),

  // Product Status
  is_active: z.boolean().default(true),

  // Collection (Optional)
  collection_id: z
    .string()
    .uuid("Please select a valid collection")
    .optional()
    .or(z.literal("")), // Allow empty string for "no collection"
});

// ============================================================================
// VARIANT SCHEMA
// ============================================================================

export const variantSchema = z.object({
  // Variant ID (only present when editing existing variant)
  id: z.string().uuid().optional(),

  // Color selection
  color_id: z
    .string({ required_error: "Color is required" })
    .uuid("Please select a valid color"),

  // Size selection
  size_id: z
    .string({ required_error: "Size is required" })
    .uuid("Please select a valid size"),

  // Quantity (can be number or string from input)
  quantity: z
    .union([
      z.number().int().min(0, "Quantity cannot be negative"),
      z
        .string()
        .refine(
          (val) => {
            const num = parseInt(val);
            return !isNaN(num) && num >= 0;
          },
          { message: "Quantity must be 0 or greater" }
        )
        .transform((val) => parseInt(val)),
    ])
    .default(0),

  // SKU (optional)
  sku: z
    .string()
    .max(100, "SKU must not exceed 100 characters")
    .optional()
    .or(z.literal("")),
});

// ============================================================================
// COMPLETE PRODUCT WITH VARIANTS SCHEMA
// ============================================================================

export const productWithVariantsSchema = productSchema.extend({
  variants: z
    .array(variantSchema)
    .min(1, "At least one product variant is required")
    .refine(
      (variants) => {
        // Check that all variants have required fields
        return variants.every(
          (v) => v.color_id && v.size_id && v.quantity >= 0
        );
      },
      {
        message: "All variants must have color, size, and valid quantity",
      }
    )
    .refine(
      (variants) => {
        // Check for duplicate color+size combinations
        const combinations = variants.map(
          (v) => `${v.color_id}-${v.size_id}`
        );
        const uniqueCombinations = new Set(combinations);
        return uniqueCombinations.size === combinations.length;
      },
      {
        message:
          "Duplicate color and size combinations are not allowed. Each variant must be unique.",
      }
    ),
});

// ============================================================================
// HELPER FUNCTION FOR TESTING
// ============================================================================

/**
 * Validate product data against schema
 * Useful for testing or server-side validation
 * @param {Object} data - Product data to validate
 * @returns {Object} - { success: boolean, data?: any, errors?: any }
 */
export function validateProductData(data) {
  try {
    const validatedData = productWithVariantsSchema.parse(data);
    return { success: true, data: validatedData };
  } catch (error) {
    return {
      success: false,
      errors: error.errors.map((err) => ({
        field: err.path.join("."),
        message: err.message,
      })),
    };
  }
}
