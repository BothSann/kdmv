import { z } from "zod";
import { CAMBODIA_PROVINCES, COUNTRIES } from "@/lib/constants";

// ═══════════════════════════════════════════════════════════════
// REGEX PATTERNS FOR VALIDATION
// ═══════════════════════════════════════════════════════════════
const ALPHABETIC_REGEX = /^[a-zA-Z\s]+$/;
const CAMBODIA_PHONE_NUMBER_REGEX =
  /^(?:\+855|0)(?:(?:[1-9]\d|2[3-7]|3[1-6]|4[2-4]|5[1-5]|6[0-9]|7[0-9]|8[0-9]|9[0-9])\d{6,7}|(?:[1-9]\d{7,8}))$/;

// ═══════════════════════════════════════════════════════════════
// EXTRACT VALID ENUM VALUES FROM CONSTANTS
// ═══════════════════════════════════════════════════════════════
const validProvinces = CAMBODIA_PROVINCES.map((p) => p.value);
const validCountries = COUNTRIES.map((c) => c.value);

// ═══════════════════════════════════════════════════════════════
// FILE VALIDATION CONSTANTS
// ═══════════════════════════════════════════════════════════════
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

// ═══════════════════════════════════════════════════════════════
// PROFILE UPDATE SCHEMA (Client-side)
// For use with React Hook Form in UserUpdateProfileForm.js
// ═══════════════════════════════════════════════════════════════
export const profileUpdateSchema = z.object({
  // First Name - Required, only alphabetic characters allowed
  first_name: z
    .string()
    .trim()
    .min(2, "First name must be at least 2 characters")
    .max(50, "First name must not exceed 50 characters")
    .regex(ALPHABETIC_REGEX, "First name must contain only letters"),

  // Last Name - Required, only alphabetic characters allowed
  last_name: z
    .string()
    .trim()
    .min(2, "Last name must be at least 2 characters")
    .max(50, "Last name must not exceed 50 characters")
    .regex(ALPHABETIC_REGEX, "Last name must contain only letters"),

  // Gender - Required, must be one of the predefined values
  gender: z.enum(["male", "female", "prefer not to say"], {
    errorMap: () => ({ message: "Please select a valid gender" }),
  }),

  // Telephone - Required, must match Cambodian phone number format
  telephone: z
    .string()
    .min(1, "Telephone is required")
    .regex(
      CAMBODIA_PHONE_NUMBER_REGEX,
      "Please enter a valid Cambodian telephone number (e.g., 012345678 or +855123456789)"
    ),

  // Country - Required, must be from the valid countries list
  country: z.enum(validCountries, {
    errorMap: () => ({ message: "Please select a valid country" }),
  }),

  // City/Province - Required, must be a valid Cambodian province
  city_province: z.enum(validProvinces, {
    errorMap: () => ({ message: "Please select a valid city/province" }),
  }),

  // Avatar File - Optional, validates file type and size when provided
  avatar_file: z
    .instanceof(File)
    .optional()
    .refine(
      (file) => !file || file.size <= MAX_FILE_SIZE,
      "Image must be less than 5MB"
    )
    .refine(
      (file) => !file || ACCEPTED_IMAGE_TYPES.includes(file.type),
      "Only .jpg, .jpeg, .png and .webp formats are supported"
    ),
});

// ═══════════════════════════════════════════════════════════════
// PROFILE UPDATE SERVER SCHEMA (Server-side)
// For use in server actions (updateCurrentUserProfileAction)
// More lenient on avatar_file since it's processed differently on server
// ═══════════════════════════════════════════════════════════════
export const profileUpdateServerSchema = z.object({
  first_name: z
    .string()
    .trim()
    .min(2, "First name must be at least 2 characters")
    .max(50, "First name must not exceed 50 characters")
    .regex(ALPHABETIC_REGEX, "First name must contain only letters"),

  last_name: z
    .string()
    .trim()
    .min(2, "Last name must be at least 2 characters")
    .max(50, "Last name must not exceed 50 characters")
    .regex(ALPHABETIC_REGEX, "Last name must contain only letters"),

  gender: z.enum(["male", "female", "prefer not to say"], {
    errorMap: () => ({ message: "Invalid gender value" }),
  }),

  telephone: z
    .string()
    .min(1, "Telephone is required")
    .regex(
      CAMBODIA_PHONE_NUMBER_REGEX,
      "Invalid Cambodian telephone number format"
    ),

  country: z.string().min(1, "Country is required"),

  city_province: z.string().min(1, "City/Province is required"),

  // On server, avatar_file is handled separately (via FormData)
  // So we use a more permissive validation here
  avatar_file: z.any().optional(),
});

// ═══════════════════════════════════════════════════════════════
// TYPE EXPORTS
// For better IDE support and documentation (works with JSDoc)
// ═══════════════════════════════════════════════════════════════

/**
 * @typedef {z.infer<typeof profileUpdateSchema>} ProfileUpdateFormData
 * @description Type representing the validated profile update form data
 */

/**
 * @typedef {z.infer<typeof profileUpdateServerSchema>} ProfileUpdateServerData
 * @description Type representing the validated profile update data on the server
 */
