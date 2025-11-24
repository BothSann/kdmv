import { z } from "zod";

/**
 * Zod validation schema for Admin Create form
 * Used in AdminCreateForm.js with React Hook Form
 */

export const adminCreateSchema = z
  .object({
    // First Name - Required
    first_name: z
      .string({ required_error: "First name is required" })
      .trim()
      .min(2, "First name must be at least 2 characters")
      .max(50, "First name must not exceed 50 characters"),

    // Last Name - Required
    last_name: z
      .string({ required_error: "Last name is required" })
      .trim()
      .min(2, "Last name must be at least 2 characters")
      .max(50, "Last name must not exceed 50 characters"),

    // Email - Required, normalized to lowercase
    email: z
      .string({ required_error: "Email is required" })
      .trim()
      .email("Please enter a valid email address")
      .transform((val) => val.toLowerCase()),

    // Password - Required with strength validation
    password: z
      .string({ required_error: "Password is required" })
      .min(8, "Password must be at least 8 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Password must contain at least one uppercase letter, one lowercase letter, and one number"
      ),

    // Confirm Password - Required for cross-field validation
    confirm_password: z.string({
      required_error: "Please confirm your password",
    }),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "Passwords do not match",
    path: ["confirm_password"], // Error will appear on confirm_password field
  });

/**
 * IMPORTANT: Before sending to API, remove confirm_password field
 *
 * Example usage in onSubmit:
 *
 * const onSubmit = async (data) => {
 *   // data has been validated by Zod and includes confirm_password
 *
 *   // Remove confirm_password before sending to server
 *   const { confirm_password, ...adminData } = data;
 *
 *   // adminData now only contains: first_name, last_name, email, password
 *   await registerAdminAction(adminData);
 * };
 */
