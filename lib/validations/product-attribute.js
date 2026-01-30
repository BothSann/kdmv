import { z } from "zod";

export const productTypeSchema = z.object({
  name: z
    .string({ required_error: "Name is required" })
    .trim()
    .min(1, "Name is required")
    .max(100, "Name must not exceed 100 characters"),

  slug: z
    .string({ required_error: "Slug is required" })
    .trim()
    .min(1, "Slug is required")
    .max(100, "Slug must not exceed 100 characters")
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug must be lowercase with hyphens only"
    ),

  display_order: z
    .number({ required_error: "Display order is required" })
    .int("Display order must be a whole number")
    .min(0, "Display order must be 0 or greater"),

  is_active: z.boolean().default(true),
});

export const genderSchema = z.object({
  name: z
    .string({ required_error: "Name is required" })
    .trim()
    .min(1, "Name is required")
    .max(100, "Name must not exceed 100 characters"),

  slug: z
    .string({ required_error: "Slug is required" })
    .trim()
    .min(1, "Slug is required")
    .max(100, "Slug must not exceed 100 characters")
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug must be lowercase with hyphens only"
    ),

  display_order: z
    .number({ required_error: "Display order is required" })
    .int("Display order must be a whole number")
    .min(0, "Display order must be 0 or greater"),

  is_active: z.boolean().default(true),
});
