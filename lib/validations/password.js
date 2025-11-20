import { z } from "zod";

// ═══════════════════════════════════════════════════════════════
// REGEX PATTERN - Reuse from auth.js for consistency
// ═══════════════════════════════════════════════════════════════
const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;

// ═══════════════════════════════════════════════════════════════
// PASSWORD CHANGE SCHEMA (Client-side)
// For use with React Hook Form in UserChangePasswordForm.js
// ═══════════════════════════════════════════════════════════════
export const changePasswordSchema = z
  .object({
    // Current Password - Required for verification
    current_password: z.string().min(1, "Current password is required"),

    // New Password - Must meet security requirements
    new_password: z
      .string()
      .min(8, "New password must be at least 8 characters")
      .regex(
        PASSWORD_REGEX,
        "New password must include uppercase, lowercase, number, and special character (@$!%*?&#)"
      ),

    // Confirm Password - Must match new password
    confirm_password: z.string().min(1, "Please confirm your new password"),

    // Logout Other Devices - Optional feature (currently disabled)
    logout_other_devices: z.boolean().default(false),
  })
  .refine((data) => data.new_password === data.confirm_password, {
    message: "Passwords do not match",
    path: ["confirm_password"], // Error will be displayed on confirm_password field
  })
  .refine((data) => data.new_password !== data.current_password, {
    message: "New password must be different from current password",
    path: ["new_password"], // Error will be displayed on new_password field
  });

// ═══════════════════════════════════════════════════════════════
// PASSWORD CHANGE SERVER SCHEMA (Server-side)
// For use in server actions (verifyAndUpdateUserPasswordAction)
// More strict validation with less descriptive error messages
// ═══════════════════════════════════════════════════════════════
export const changePasswordServerSchema = z
  .object({
    current_password: z.string().min(1, "Current password is required"),

    new_password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(PASSWORD_REGEX, "Password does not meet security requirements"),

    confirm_password: z.string().min(1, "Password confirmation required"),

    logout_other_devices: z.boolean().default(false),
  })
  .refine((data) => data.new_password === data.confirm_password, {
    message: "New password and confirmation do not match",
    path: ["confirm_password"],
  })
  .refine((data) => data.new_password !== data.current_password, {
    message: "New password cannot be the same as current password",
    path: ["new_password"],
  });

// ═══════════════════════════════════════════════════════════════
// TYPE EXPORTS
// For better IDE support and documentation (works with JSDoc)
// ═══════════════════════════════════════════════════════════════

/**
 * @typedef {z.infer<typeof changePasswordSchema>} ChangePasswordFormData
 * @description Type representing the validated password change form data
 */

/**
 * @typedef {z.infer<typeof changePasswordServerSchema>} ChangePasswordServerData
 * @description Type representing the validated password change data on the server
 */

// ═══════════════════════════════════════════════════════════════
// PASSWORD RESET SCHEMA (Client-side)
// For use with React Hook Form in ResetPasswordForm.js
// Used when user resets password via email link (forgot password flow)
// Does NOT require current password (user is authenticated via magic link)
// ═══════════════════════════════════════════════════════════════
export const resetPasswordSchema = z
  .object({
    // New Password - Must meet security requirements
    new_password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(
        PASSWORD_REGEX,
        "Password must include uppercase, lowercase, number, and special character (@$!%*?&#)"
      ),

    // Confirm Password - Must match new password
    confirm_password: z.string().min(1, "Please confirm your new password"),
  })
  .refine((data) => data.new_password === data.confirm_password, {
    message: "Passwords do not match",
    path: ["confirm_password"], // Error will be displayed on confirm_password field
  });

/**
 * @typedef {z.infer<typeof resetPasswordSchema>} ResetPasswordFormData
 * @description Type representing the validated password reset form data (forgot password flow)
 */
