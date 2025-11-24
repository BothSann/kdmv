import { z } from "zod";

/**
 * Zod validation schema for Collection form
 * Used in CollectionCreateEditForm.js with React Hook Form
 */

export const collectionSchema = z.object({
  // Collection name - Required field
  name: z
    .string({ required_error: "Collection name is required" })
    .trim()
    .min(3, "Collection name must be at least 3 characters")
    .max(100, "Collection name must not exceed 100 characters"),

  // Description - Optional field
  description: z
    .string()
    .trim()
    .max(500, "Description must not exceed 500 characters")
    .optional()
    .or(z.literal("")), // Allow empty string for optional textarea

  // Active status - Boolean with default
  is_active: z.boolean().default(true),
});
