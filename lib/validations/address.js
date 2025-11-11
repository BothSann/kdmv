import { z } from "zod";
import { CAMBODIA_PROVINCES, COUNTRIES } from "@/lib/constants";

// Regex patterns for validation
const ALPHABETIC_REGEX = /^[a-zA-Z\s]+$/;
const CAMBODIA_PHONE_NUMBER_REGEX =
  /^(?:\+855|0)(?:(?:[1-9]\d|2[3-7]|3[1-6]|4[2-4]|5[1-5]|6[0-9]|7[0-9]|8[0-9]|9[0-9])\d{6,7}|(?:[1-9]\d{7,8}))$/;

// Extract valid values from constants for enum validation
const validProvinces = CAMBODIA_PROVINCES.map((p) => p.value);
const validCountries = COUNTRIES.map((c) => c.value);

export const addressSchema = z.object({
  // First Name - Only alphabetic characters
  first_name: z
    .string()
    .trim()
    .min(2, "First name must be at least 2 characters")
    .max(50, "First name must not exceed 50 characters")
    .regex(ALPHABETIC_REGEX, "First name must contain only letters"),

  // Last Name - Only alphabetic characters
  last_name: z
    .string()
    .trim()
    .min(2, "Last name must be at least 2 characters")
    .max(50, "Last name must not exceed 50 characters")
    .regex(ALPHABETIC_REGEX, "Last name must contain only letters"),

  // Phone Number - Cambodian format
  phone_number: z
    .string()
    .min(1, "Phone number is required")
    .regex(
      CAMBODIA_PHONE_NUMBER_REGEX,
      "Please enter a valid Cambodian phone number"
    ),

  // Street Address - Required, flexible format
  street_address: z
    .string()
    .trim()
    .min(5, "Street address must be at least 5 characters")
    .max(200, "Street address is too long"),

  // Apartment - Optional
  apartment: z
    .string()
    .trim()
    .max(50, "Apartment info is too long")
    .optional()
    .or(z.literal("")), // Allow empty string

  // Country - Must be from valid list
  country: z.enum(validCountries, {
    errorMap: () => ({ message: "Please select a valid country" }),
  }),

  // City/Province - Must be from valid list
  city_province: z.enum(validProvinces, {
    errorMap: () => ({ message: "Please select a valid city/province" }),
  }),

  // Is Default - Boolean
  is_default: z.boolean().default(false),
});
