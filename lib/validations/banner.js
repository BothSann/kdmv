import { z } from "zod";

/**
 * Validation schema for creating a new hero banner
 */
export const createBannerSchema = z.object({
  // Title - Required, main heading for the banner
  title: z
    .string()
    .trim()
    .min(1, "Title is required")
    .max(100, "Title must not exceed 100 characters"),

  // Subtitle - Optional, supporting text
  subtitle: z
    .string()
    .trim()
    .max(200, "Subtitle must not exceed 200 characters")
    .optional()
    .or(z.literal("")), // Allow empty string

  // Link URL - Optional, where the CTA button links to
  link_url: z
    .string()
    .trim()
    .max(500, "Link URL is too long")
    .optional()
    .or(z.literal(""))
    .refine(
      (val) => {
        if (!val || val === "") return true;
        // Allow internal routes (/collections/...) or full URLs
        return (
          val.startsWith("/") ||
          val.startsWith("http://") ||
          val.startsWith("https://")
        );
      },
      {
        message:
          "Link URL must be a valid internal route (/path) or external URL (https://...)",
      }
    ),

  // Link Text - Button text, defaults to "Shop Now"
  link_text: z
    .string()
    .trim()
    .min(1, "Button text is required")
    .max(50, "Button text must not exceed 50 characters")
    .default("Shop Now"),

  // Display Order - Controls slide order (lower numbers appear first)
  display_order: z
    .number()
    .int("Display order must be a whole number")
    .min(0, "Display order must be 0 or greater")
    .default(0),

  // Is Active - Whether to show on homepage
  is_active: z.boolean().default(true),
});

/**
 * Validation schema for updating an existing hero banner
 * All fields are optional except those that cannot be null in DB
 */
export const updateBannerSchema = z.object({
  // Banner ID - Required for updates
  id: z.string().uuid("Invalid banner ID"),

  // Title - Optional for updates
  title: z
    .string()
    .trim()
    .min(1, "Title cannot be empty")
    .max(100, "Title must not exceed 100 characters")
    .optional(),

  // Subtitle - Optional
  subtitle: z
    .string()
    .trim()
    .max(200, "Subtitle must not exceed 200 characters")
    .optional()
    .or(z.literal("")),

  // Link URL - Optional
  link_url: z
    .string()
    .trim()
    .max(500, "Link URL is too long")
    .optional()
    .or(z.literal(""))
    .refine(
      (val) => {
        if (!val || val === "") return true;
        return (
          val.startsWith("/") ||
          val.startsWith("http://") ||
          val.startsWith("https://")
        );
      },
      {
        message:
          "Link URL must be a valid internal route (/path) or external URL (https://...)",
      }
    ),

  // Link Text - Optional
  link_text: z
    .string()
    .trim()
    .min(1, "Button text cannot be empty")
    .max(50, "Button text must not exceed 50 characters")
    .optional(),

  // Display Order - Optional
  display_order: z
    .number()
    .int("Display order must be a whole number")
    .min(0, "Display order must be 0 or greater")
    .optional(),

  // Is Active - Optional
  is_active: z.boolean().optional(),

  // Existing Image URL - Used when no new image is uploaded
  existing_image_url: z.string().optional(),
});

/**
 * Validation schema for toggling banner active status
 */
export const toggleBannerActiveSchema = z.object({
  id: z.string().uuid("Invalid banner ID"),
  is_active: z.boolean(),
});

/**
 * Validation schema for reordering banners
 */
export const reorderBannersSchema = z.object({
  banner_orders: z.array(
    z.object({
      id: z.string().uuid("Invalid banner ID"),
      display_order: z.number().int().min(0),
    })
  ),
});
