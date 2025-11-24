import { z } from "zod";

/**
 * Zod validation schema for Banner Form (Client-Side)
 * Used in BannerForm.js with React Hook Form
 * Handles both create and edit modes
 *
 * Note: Image upload validation is handled separately in the component
 * because File objects cannot be validated by Zod
 */
export const bannerSchema = z.object({
  // Title - Required, main banner heading
  title: z
    .string({ required_error: "Title is required" })
    .trim()
    .min(3, "Title must be at least 3 characters")
    .max(200, "Title must not exceed 200 characters"),

  // Subtitle - Optional, supporting text below title
  subtitle: z
    .string()
    .trim()
    .max(300, "Subtitle must not exceed 300 characters")
    .optional()
    .or(z.literal("")), // Allow empty string for optional input

  // Link URL - Optional, button destination (internal /path or external http://)
  link_url: z
    .string()
    .trim()
    .refine(
      (val) => {
        // Empty string is valid (optional field)
        if (!val) return true;
        // Must start with / for internal links or http:// / https:// for external
        return (
          val.startsWith("/") ||
          val.startsWith("http://") ||
          val.startsWith("https://")
        );
      },
      { message: "Link must start with / (internal) or http:// (external)" }
    )
    .optional()
    .or(z.literal("")),

  // Link Text - Optional, button text
  link_text: z
    .string()
    .trim()
    .max(50, "Button text must not exceed 50 characters")
    .optional()
    .or(z.literal("")),

  // Display Order - Required, number for carousel ordering (lower = first)
  // Note: Comes from form as string, transformed to number
  display_order: z
    .string({ required_error: "Display order is required" })
    .refine((val) => !isNaN(parseInt(val)), {
      message: "Display order must be a valid number",
    })
    .refine((val) => parseInt(val) >= 0, {
      message: "Display order must be 0 or greater",
    })
    .transform((val) => parseInt(val)),

  // Is Active - Required, boolean to show/hide on homepage
  is_active: z.boolean().default(true),
});

/**
 * Validation schema for creating a new hero banner (Server-Side)
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
