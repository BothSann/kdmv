import { z } from "zod";

// Regex patterns
const ALPHABETIC_REGEX = /^[a-zA-Z\s]+$/;
const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;
const CAMBODIA_PHONE_NUMBER_REGEX =
  /^(?:\+855|0)(?:(?:[1-9]\d|2[3-7]|3[1-6]|4[2-4]|5[1-5]|6[0-9]|7[0-9]|8[0-9]|9[0-9])\d{6,7}|(?:[1-9]\d{7,8}))$/;

export const registerSchema = z.object({
  // First Name - Only alphabetic characters
  first_name: z
    .string()
    .trim()
    .min(3, "First name must be at least 3 characters")
    .max(50, "First name must not exceed 50 characters")
    .regex(ALPHABETIC_REGEX, "First name must contain only letters"),

  // Last Name - Only alphabetic characters
  last_name: z
    .string()
    .trim()
    .min(3, "Last name must be at least 3 characters")
    .max(50, "Last name must not exceed 50 characters")
    .regex(ALPHABETIC_REGEX, "Last name must contain only letters"),

  // Email validation
  email: z
    .email({ message: "Invalid email address" })
    .min(1, "Email is required"),

  // Password - 8+ chars, uppercase, lowercase, number, special char
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(
      PASSWORD_REGEX,
      "Password must include uppercase, lowercase, number, and special character"
    ),

  // Gender validation
  gender: z.enum(["male", "female", "prefer not to say"], {
    message: "Please select a gender",
  }),

  // Telephone validation
  telephone: z
    .string()
    .min(1, "Telephone is required")
    .regex(
      CAMBODIA_PHONE_NUMBER_REGEX,
      "Please enter a valid Cambodian telephone number"
    ),

  // Country validation
  country: z.string().default("Cambodia"),

  // City/Province validation
  city_province: z.string().min(1, "Please select a city/province"),
});

// Login Schema - Simpler validation (only email format + password presence)
export const loginSchema = z.object({
  // Email validation
  email: z
    .email({ message: "Invalid email address" })
    .min(1, "Email is required"),

  // Password validation - Only check presence (no strength check for login)
  password: z.string().min(1, "Password is required"),
});

// Forgot Password Schema - Only email validation needed
export const forgotPasswordSchema = z.object({
  // Email validation
  email: z
    .email({ message: "Invalid email address" })
    .min(1, "Email is required"),
});
